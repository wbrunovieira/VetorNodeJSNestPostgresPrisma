// src/interceptors/validation.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ZodSchema } from 'zod';
import { Reflector } from '@nestjs/core';

const VALIDATION_SCHEMA_KEY = 'validationSchema';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Obtendo o esquema do metadado da rota
    const schema: ZodSchema<any> = this.reflector.get(
      VALIDATION_SCHEMA_KEY,
      context.getHandler(),
    );

    if (!schema) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    try {
      schema.parse({
        body: request.body,
      });
    } catch (error) {
      throw new BadRequestException(error.errors);
    }

    return next.handle();
  }
}
