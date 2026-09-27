import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { CreateRegisterDto } from './dto/create-register.dto';

@Controller('auth')
export class AuthRegisterController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() dto: CreateRegisterDto) {
    return this.natsService.send('auth.register', dto);
  }
}
