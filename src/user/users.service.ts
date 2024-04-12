import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcryptjs from 'bcryptjs';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { name: string; email: string; password: string }) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });
      if (existingUser) {
        throw new ConflictException('Endereço de e-mail já está em uso');
      }
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,

          licenses: {
            create: [
              {
                amount: 1000,
                method: 'Visa',
                valid: true,
              },
            ],
          },
        },
        include: {
          licenses: true,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Endereço de e-mail já está em uso');
        }
      }
      throw error;
    }
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getAllUsersValidLicenses() {
    return this.prisma.user.findMany({
      where: {
        licenses: {
          some: {
            valid: true,
          },
        },
      },
    });
  }

  async getUserDevicesCount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { devicesQtd: true },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user.devicesQtd;
  }
}
