import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('AuthController (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();

    const testeuser = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Bruno',
        email: 'bruno@example.com',
        password: '123456a@d',
        licenses: [
          {
            amount: 1000,
            method: 'Visa',
            valid: true,
          },
        ],
      });
    console.log('Usuário de teste criado:', testeuser);
  });

  afterAll(async () => {
    prisma.$disconnect();
  });

  beforeEach(async () => {});

  it('[POST] /auth login deve autenticar um usuário e retornar um token', async () => {
    const userData = {
      email: 'bruno@example.com',
      password: '123456a@d',
    };

    const response = await request(app.getHttpServer())
      .post('/auth')
      .send(userData);

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty('access_token');
  });

  it('[POST] /auth login deve falhar com senha incorreta', async () => {
    const userData = {
      email: 'bruno@example.com',
      password: 'senhaIncorreta',
    };

    const response = await request(app.getHttpServer())
      .post('/auth')
      .send(userData);

    expect(response.statusCode).toBe(401);
  });

  it('[POST] /auth login deve falhar com usuário não existente', async () => {
    const userData = {
      email: 'naoexiste@example.com',
      password: '123456',
    };

    const response = await request(app.getHttpServer())
      .post('/auth')
      .send(userData);

    expect(response.statusCode).toBe(401);
  });
  it('[POST] /auth login deve falhar quando campos obrigatórios estão ausentes', async () => {
    const response = await request(app.getHttpServer()).post('/auth').send({});

    expect(response.statusCode).toBe(401);
  });
});
