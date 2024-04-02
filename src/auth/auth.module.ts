// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { Env } from 'src/env';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory(config: ConfigService<Env, true>) {
        const privateKey = config.get('JWT_PRIVATE_KEY', { infer: true });
        const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true });
        console.log(privateKey, publicKey);

        return {
          signOptions: { expiresIn: '60m', algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64').toString(),
          publicKey: Buffer.from(publicKey, 'base64').toString(),
        };
      },
    }),
  ],
  providers: [AuthService, PrismaService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
