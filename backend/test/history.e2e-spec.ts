import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/clean-database';

describe('History (e2e)', () => {
  let app: INestApplication<App>;
  let ownerToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    await cleanDatabase(app);

    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'history-owner@example.com',
        password: 'password123',
        name: 'History Owner',
      });
    ownerToken = owner.body.accessToken;
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  it('rejects requests without a token', async () => {
    await request(app.getHttpServer()).get('/history').expect(401);
  });

  it('lists history across all of the user todos, newest first, title snapshot intact after delete', async () => {
    const first = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'First todo' });

    await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Second todo' });

    await request(app.getHttpServer())
      .delete(`/todos/${first.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(204);

    const response = await request(app.getHttpServer())
      .get('/history')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(response.body).toHaveLength(3); // 2x created + 1x deleted
    expect(response.body[0].action).toBe('deleted');
    expect(response.body[0].todoTitle).toBe('First todo');

    const titles = response.body.map(
      (entry: { todoTitle: string }) => entry.todoTitle,
    );
    expect(titles).toEqual(
      expect.arrayContaining(['First todo', 'Second todo']),
    );
  });
});
