import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { AuthRegisterController } from './auth-register.controller';

@Module({
  imports: [NatsModule],
  controllers: [AuthRegisterController],
})
export class AuthRegisterModule {}
