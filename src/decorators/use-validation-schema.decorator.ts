// src/decorators/use-validation-schema.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { ZodSchema } from 'zod';

export const UseValidationSchema = (schema: ZodSchema) =>
  SetMetadata('validationSchema', schema);
