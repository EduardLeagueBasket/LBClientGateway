import { Body, Controller, Inject, Patch, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import {
  MobileLinkDeviceDto,
  MobileRegisterDeviceDto,
} from './dto/customer-auth.dto';

@Controller('mobile/devices')
export class CustomerAuthDevicesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  register(@Body() dto: MobileRegisterDeviceDto) {
    return this.natsService.send('customer-auth.device.register', dto);
  }

  @Patch('link')
  link(@Body() dto: MobileLinkDeviceDto) {
    return this.natsService.send('customer-auth.device.link', dto);
  }
}
