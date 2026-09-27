import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { AuthLoginController } from './auth-login.controller';

@Module({
  imports: [NatsModule],
  controllers: [AuthLoginController],
})
export class AuthLoginModule {}
