import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DeviceService {
  constructor(private prisma: PrismaService) {}

  async createDevice(data: {
    name: string;
    userId: string;
    macNumber: string;
    hostname: string;
    os: string;
    version: string;
  }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      console.log('macnumber : ', data.macNumber);
      const existingDevice = await this.prisma.device.findUnique({
        where: {
          macNumber: data.macNumber,
        },
      });
      if (existingDevice) {
        throw new ConflictException('Endereço de mac já está em uso');
      }
      console.log('criando device');
      const device = await this.prisma.device.create({
        data: {
          name: data.name,
          hostname: data.hostname,
          os: data.os,
          version: data.version,
          macNumber: data.macNumber,
          userId: data.userId,
        },
      });

      await this.prisma.user.update({
        where: { id: data.userId },
        data: { devicesQtd: user.devicesQtd + 1 },
      });

      return device;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new Error('Endereço de emac já está em uso');
        }
      }
      throw error;
    }
  }
  async getDevices() {
    return this.prisma.device.findMany();
  }

  async findDeviceByMacAndUserId(macNumber: string, userId: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        macNumber: macNumber,
        userId: userId,
      },
    });

    return device;
  }

  async getUserDevices(userId: string) {
    return this.prisma.device.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async deleteDevice(deviceId: string) {
    return await this.prisma.$transaction(async (prisma) => {
      // Primeiro, busca o dispositivo para obter o userId antes de deletá-lo
      const device = await prisma.device.findUnique({
        where: { id: deviceId },
        select: { userId: true }, // Seleciona apenas o userId
      });

      if (!device) {
        throw new Error('Dispositivo não encontrado');
      }

      // Deleta o dispositivo
      await prisma.device.delete({
        where: { id: deviceId },
      });

      // Decrementa a quantidade de dispositivos do usuário
      const user = await prisma.user.update({
        where: { id: device.userId },
        data: { devicesQtd: { decrement: 1 } }, // Reduz em 1 a contagem de dispositivos
      });

      return { message: 'Dispositivo deletado com sucesso.', user };
    });
  }
}
