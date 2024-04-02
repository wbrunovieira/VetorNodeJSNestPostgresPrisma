import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcryptjs from 'bcryptjs';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: { name: string; email: string; password: string }) {
    try {
      const hashedPassword = await bcryptjs.hash(data.password, 10);
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
          // Adiciona a licença aqui, no relacionamento
          licenses: {
            create: [
              {
                // Defina os campos da licença aqui
                amount: 1000, // Exemplo, defina conforme sua lógica de negócios
                method: 'Visa', // Exemplo
                valid: true, // Define a licença como válida
              },
            ],
          },
        },
        include: {
          licenses: true, // Opcional: inclua isso se quiser retornar os detalhes da licença juntamente com o usuário
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
}
