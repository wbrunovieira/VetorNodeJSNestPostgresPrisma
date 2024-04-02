import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    console.log('email', email);
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { licenses: true },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      console.log('pass', pass);
      console.log('user', user);
      const validLicenses = user.licenses.some((license) => license.valid);
      if (validLicenses) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, licenses, ...result } = user;
        console.log('result', result);
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    console.log('payload', payload);
    const access_token = this.jwtService.sign(payload, {
      expiresIn: '60m',
      privateKey: Buffer.from(process.env.JWT_PRIVATE_KEY, 'base64').toString(
        'ascii',
      ),
    });
    console.log('token', access_token);
    return {
      access_token,
    };
  }
}
