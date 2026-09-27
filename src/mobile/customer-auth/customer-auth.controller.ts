import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import {
  MobileLoginDto,
  MobileRegisterDto,
  MobileVerifyTokenDto,
} from './dto/customer-auth.dto';

@Controller('mobile/auth')
export class CustomerAuthController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() dto: MobileRegisterDto) {
    return this.natsService.send('customer-auth.register', dto);
  }

  @Post('login')
  login(@Body() dto: MobileLoginDto) {
    return this.natsService.send('customer-auth.login', dto);
  }

  @Post('verify')
  verify(@Body() dto: MobileVerifyTokenDto) {
    return this.natsService.send('customer-auth.authenticate', dto);
  }
}
