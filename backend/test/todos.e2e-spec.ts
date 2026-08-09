import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/clean-database';

describe('Todos (e2e)', () => {
  let app: INestApplication<App>;
  let ownerToken: string;
  let otherToken: string;

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
        email: 'todos-owner@example.com',
        password: 'password123',
        name: 'Owner',
      });
    ownerToken = owner.body.accessToken;

    const other = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'todos-other@example.com',
        password: 'password123',
        name: 'Other',
      });
    otherToken = other.body.accessToken;
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  it('rejects requests without a token', async () => {
    await request(app.getHttpServer()).get('/todos').expect(401);
    await request(app.getHttpServer())
      .post('/todos')
      .send({ title: 'nope' })
      .expect(401);
  });

  it('creates a todo and records a CREATED history entry', async () => {
    const response = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Buy milk' })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'Buy milk',
      completed: false,
    });

    const history = await request(app.getHttpServer())
      .get(`/todos/${response.body.id}/history`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(history.body).toHaveLength(1);
    expect(history.body[0].action).toBe('created');
  });

  it('lists only the authenticated user todos', async () => {
    const response = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
  });

  it('a partial update does not wipe untouched fields', async () => {
    const created = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Walk the dog', description: 'evening walk' });

    const updated = await request(app.getHttpServer())
      .patch(`/todos/${created.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ completed: true })
      .expect(200);

    expect(updated.body.title).toBe('Walk the dog');
    expect(updated.body.description).toBe('evening walk');
    expect(updated.body.completed).toBe(true);
  });

  it('forbids access to another user todo', async () => {
    const created = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Private' });

    await request(app.getHttpServer())
      .get(`/todos/${created.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });

  it('deletes a todo, which then becomes unreachable', async () => {
    const created = await request(app.getHttpServer())
      .post('/todos')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'Throwaway' });

    await request(app.getHttpServer())
      .delete(`/todos/${created.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(204);

    await request(app.getHttpServer())
      .get(`/todos/${created.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(404);
  });

  it('rejects stats requests without a token', async () => {
    await request(app.getHttpServer()).get('/todos/stats').expect(401);
  });

  it('aggregates created/completed counts by day, scoped to the owner', async () => {
    const response = await request(app.getHttpServer())
      .get('/todos/stats')
      .query({ groupBy: 'day' })
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(response.body).toHaveLength(1);
    const [bucket] = response.body;
    expect(bucket).toMatchObject({ created: 4, completed: 1 });
    expect(typeof bucket.period).toBe('string');
  });
});
