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
      const userExists = await this.prisma.user.findUnique({
        where: { id: data.userId },
      });

      if (!userExists) {
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
}
