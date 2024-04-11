import { Module } from '@nestjs/common';

import { UsersController } from './user/users.controller';
import { PrismaService } from './prisma.service';
import { UsersService } from './user/users.service';
import { ValidationInterceptor } from './interceptors/validation.interceptor';
import { AuthModule } from './auth/auth.module';

import { ConfigModule } from '@nestjs/config';
import { DevicesController } from './device/device.controller';
import { DeviceService } from './device/device.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UsersController, DevicesController],
  providers: [
    PrismaService,
    UsersService,
    ValidationInterceptor,
    DeviceService,
  ],
})
export class AppModule {}
