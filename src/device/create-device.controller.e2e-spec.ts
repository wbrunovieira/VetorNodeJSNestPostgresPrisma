import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma.service';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Create Device (E2E)', () => {
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

  test('[POST] /devices', async () => {
    const deviceData = {
      name: 'New Device',
      hostname: 'device-hostname',
      os: 'device-os',
      version: 'v1.0',
      macNumber: '00:1A:22:3B:44:55',
      userId: 'some-valid-user-id',
    };

    const response = await request(app.getHttpServer())
      .post('/devices')
      .send(deviceData);

    expect(response.statusCode).toBe(201);

    const deviceOnDatabase = await prisma.device.findUnique({
      where: {
        macNumber: '00:1A:22:3B:44:55',
      },
    });

    expect(deviceOnDatabase).toBeTruthy();
    expect(deviceOnDatabase.name).toBe(deviceData.name);
  });

  test('[POST] /devices with existing MAC', async () => {
    await request(app.getHttpServer()).post('/devices').send({
      name: 'Device 1',
      hostname: 'device1-hostname',
      os: 'device1-os',
      version: 'v1.0',
      macNumber: '00:1A:22:3B:44:55',
      userId: 'some-user-id',
    });

    const response = await request(app.getHttpServer()).post('/devices').send({
      name: 'Device 2',
      hostname: 'device2-hostname',
      os: 'device2-os',
      version: 'v1.0',
      macNumber: '00:1A:22:3B:44:55',
      userId: 'some-user-id',
    });

    expect(response.statusCode).toBe(409);
  });

  test('should validate required fields', async () => {
    const response = await request(app.getHttpServer()).post('/devices').send({
      hostname: 'incomplete-device',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain('name should not be empty');
    expect(response.body.message).toContain('macNumber should not be empty');
  });

  afterAll(async () => {
    await app.close();
  });
});
