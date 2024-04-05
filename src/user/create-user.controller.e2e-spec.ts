import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma.service';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { createUserSchema } from './user.schema';

describe('Create Account (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  test('[POST] /users', async () => {
    const response = await request(app.getHttpServer())
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

    expect(response.statusCode).toBe(201);

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'bruno@example.com',
      },
    });

    expect(userOnDatabase).toBeTruthy();
  });

  test('[POST] /users with existing email', async () => {
    await request(app.getHttpServer()).post('/users').send({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: '123456a@d',
    });

    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'Test User 2',
      email: 'duplicate@example.com',
      password: '123456a@d',
    });

    expect(response.statusCode).toBe(409);
  });

  test('deve rejeitar um e-mail inválido', () => {
    const result = createUserSchema.safeParse({
      name: 'Test User',
      email: 'not-an-email',
      password: 'Password1!',
    });

    expect(result.success).toBe(false);
  });

  test('deve retornar 400 para um e-mail inválido', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'Test User',
      email: 'invalid-email',
      password: 'Password1!',
    });

    expect(response.statusCode).toBe(400);
    const emailInvalidMessage = response.body.message.find(
      (m) => m.message === 'Email inválido',
    );
    expect(emailInvalidMessage).toBeDefined();
  });

  test('deve rejeitar uma senha invalida sem caracteres especiais', () => {
    const result = createUserSchema.safeParse({
      name: 'Test User',
      email: 'email@email.com',
      password: 'Password1',
    });

    expect(result.success).toBe(false);
  });
  test('deve retornar 400 para senhas sem caracteres especiais', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'Test User',
      email: 'email@email.com',
      password: 'Password1',
    });

    expect(response.statusCode).toBe(400);
    const emailInvalidMessage = response.body.message.find(
      (m) => m.message === 'Senha deve conter pelo menos um caractere especial',
    );
    expect(emailInvalidMessage).toBeDefined();
  });
  test('[POST] /users - verifica criação de usuário e licenças com e-mail único', async () => {
    const uniqueEmail = `bruno-${Date.now()}@example.com`;
    const userData = {
      name: 'Bruno',
      email: uniqueEmail,
      password: '123456a@d',
      licenses: [
        {
          amount: 1000,
          method: 'Visa',
          valid: true,
        },
      ],
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userData);

    expect(response.statusCode).toBe(201);
    expect(response.body.licenses).toBeDefined();
    expect(response.body.licenses.length).toBeGreaterThan(0);

    const license = response.body.licenses[0];
    expect(license.amount).toBe(userData.licenses[0].amount);
    expect(license.method).toBe(userData.licenses[0].method);
    expect(license.valid).toBe(true);
  });
});
