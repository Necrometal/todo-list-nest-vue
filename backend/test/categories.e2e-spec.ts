import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { cleanDatabase } from './utils/clean-database';

describe('Categories (e2e)', () => {
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
        email: 'categories-owner@example.com',
        password: 'password123',
        name: 'Owner',
      });
    ownerToken = owner.body.accessToken;

    const other = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'categories-other@example.com',
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
    await request(app.getHttpServer()).get('/categories').expect(401);
  });

  it('creates a category and lists it for the owner', async () => {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Work' })
      .expect(201);

    expect(created.body).toMatchObject({ name: 'Work' });

    const list = await request(app.getHttpServer())
      .get('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    expect(list.body).toHaveLength(1);
  });

  it('rejects a duplicate category name for the same owner', async () => {
    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Duplicate' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Duplicate' })
      .expect(409);
  });

  it('updates a category owned by the requester', async () => {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Errands' });

    const updated = await request(app.getHttpServer())
      .patch(`/categories/${created.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Errands renamed' })
      .expect(200);

    expect(updated.body.name).toBe('Errands renamed');
  });

  it('forbids updating another user category', async () => {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Private' });

    await request(app.getHttpServer())
      .patch(`/categories/${created.body.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Hijacked' })
      .expect(403);
  });

  it('deletes a category owned by the requester', async () => {
    const created = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: 'Throwaway' });

    await request(app.getHttpServer())
      .delete(`/categories/${created.body.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(204);
  });
});
