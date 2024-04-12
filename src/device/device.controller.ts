// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';

import { createDeviceSchema } from './device.schema';
import { ZodValidationPipe } from 'src/pipes/validation.pipe';
import { DeviceService } from './device.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createDeviceSchema))
  async createDevice(@Body() body: any) {
    return this.deviceService.createDevice(body);
  }

  @Get()
  async getDevices() {
    return this.deviceService.getDevices();
  }

  @Post('check-mac')
  async checkDeviceByMac(
    @Body() body: { macNumber: string; userId: string },
  ): Promise<boolean> {
    const device = await this.deviceService.findDeviceByMacAndUserId(
      body.macNumber,
      body.userId,
    );
    return !!device;
  }

  @Get('user/:userId')
  async getUserDevices(@Param('userId') userId: string) {
    return this.deviceService.getUserDevices(userId);
  }
  @Delete(':deviceId')
  async deleteDevice(@Param('deviceId') deviceId: string) {
    try {
      const device = await this.deviceService.deleteDevice(deviceId);
      return { message: 'Dispositivo deletado com sucesso.', device };
    } catch (error) {
      throw new HttpException(
        'Dispositivo não encontrado ou erro ao deletar.',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
