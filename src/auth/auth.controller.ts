// src/users/users.controller.ts
import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @UseGuards(LocalAuthGuard)
  async login(@Request() req) {
    console.log('req', req.user);
    return this.authService.login(req.user);
  }
}
