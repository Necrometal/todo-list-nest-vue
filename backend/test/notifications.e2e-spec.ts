import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/shared/infrastructure/modules/app.module';

interface NotificationResponse {
  notificationId: string;
  recipientEmail: string;
  message: string;
  sentAt: string;
}

describe('Notifications (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('records a notification when a user registers, reachable across contexts through the shared event bus', async () => {
    await request(app.getHttpServer())
      .post('/identity/register')
      .send({ email: 'notify-me@example.com', password: 'abcd1234' })
      .expect(201);

    // Publishing is fire-and-forget (EventEmitter2#emit does not await
    // listeners), so the notification may not be recorded the instant the
    // register call returns — poll briefly instead of asserting immediately.
    const foundEntry = await pollUntil(async () => {
      const response = await request(app.getHttpServer())
        .get('/notifications')
        .expect(200);

      const notifications = response.body as NotificationResponse[];
      return notifications.find(
        (notification) =>
          notification.recipientEmail === 'notify-me@example.com',
      );
    });

    expect(foundEntry).toBeDefined();
    expect(foundEntry?.message).toBe('Welcome email');
    expect(typeof foundEntry?.notificationId).toBe('string');
    expect(typeof foundEntry?.sentAt).toBe('string');
  });
});

async function pollUntil<T>(
  check: () => Promise<T | undefined>,
  { timeoutMs = 2000, intervalMs = 20 } = {},
): Promise<T | undefined> {
  const deadline = Date.now() + timeoutMs;
  let result = await check();

  while (!result && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    result = await check();
  }

  return result;
}
