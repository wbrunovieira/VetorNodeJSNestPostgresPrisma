// src/users/users.controller.ts
import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';

import { createUserSchema } from './user.schema';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() body: any) {
    return this.usersService.createUser(body);
  }
}
