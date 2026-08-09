import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/shared/infrastructure/modules/app.module';

interface RegisterResponseBody {
  userId: string;
}

interface AuthenticateResponseBody {
  token: string;
}

interface ErrorResponseBody {
  message: string;
}

describe('Identity (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirrors main.ts bootstrap: TestingModule doesn't run main.ts, so the
    // global pipe has to be reapplied here for validation to actually run.
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a new user', () => {
    return request(app.getHttpServer())
      .post('/identity/register')
      .send({ email: 'user@example.com', password: 'abcd1234' })
      .expect(201)
      .expect((res) => {
        const body = res.body as RegisterResponseBody;
        expect(body.userId).toEqual(expect.any(String));
      });
  });

  it('rejects a malformed registration body with 400', () => {
    return request(app.getHttpServer())
      .post('/identity/register')
      .send({ email: 'not-an-email', password: 'x' })
      .expect(400);
  });

  it('rejects registering the same email twice with 400', async () => {
    await request(app.getHttpServer())
      .post('/identity/register')
      .send({ email: 'duplicate@example.com', password: 'abcd1234' })
      .expect(201);

    return request(app.getHttpServer())
      .post('/identity/register')
      .send({ email: 'duplicate@example.com', password: 'abcd1234' })
      .expect(400)
      .expect((res) => {
        const body = res.body as ErrorResponseBody;
        expect(body.message).toBe('Email already registered');
      });
  });

  it('authenticates a registered user and returns a JWT', async () => {
    await request(app.getHttpServer())
      .post('/identity/register')
      .send({ email: 'login@example.com', password: 'abcd1234' })
      .expect(201);

    return request(app.getHttpServer())
      .post('/identity/authenticate')
      .send({ email: 'login@example.com', password: 'abcd1234' })
      .expect(200)
      .expect((res) => {
        const body = res.body as AuthenticateResponseBody;
        expect(body.token).toEqual(expect.any(String));
        expect(body.token.split('.')).toHaveLength(3);
      });
  });

  it('rejects authentication with a wrong password using a generic message', async () => {
    await request(app.getHttpServer())
      .post('/identity/register')
      .send({ email: 'wrongpass@example.com', password: 'abcd1234' })
      .expect(201);

    return request(app.getHttpServer())
      .post('/identity/authenticate')
      .send({ email: 'wrongpass@example.com', password: 'wrongpass1' })
      .expect(400)
      .expect((res) => {
        const body = res.body as ErrorResponseBody;
        expect(body.message).toBe('Invalid credentials');
      });
  });
});
