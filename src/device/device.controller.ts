// src/users/users.controller.ts
import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';

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
}
