import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { AuthPasswordController } from './auth-password.controller';

@Module({
  imports: [NatsModule],
  controllers: [AuthPasswordController],
  providers: [NatsJwtAuthGuard],
})
export class AuthPasswordModule {}
