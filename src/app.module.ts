import { Module } from '@nestjs/common';

import { UsersController } from './user/users.controller';
import { PrismaService } from './prisma.service';
import { UsersService } from './user/users.service';
import { ValidationInterceptor } from './interceptors/validation.interceptor';
import { AuthModule } from './auth/auth.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [UsersController],
  providers: [PrismaService, UsersService, ValidationInterceptor],
})
export class AppModule {}
