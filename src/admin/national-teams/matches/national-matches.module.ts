import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { GatewayNationalMatchesController } from './national-matches.controller';

@Module({
  imports: [NatsModule],
  controllers: [GatewayNationalMatchesController],
  providers: [NatsJwtAuthGuard],
})
export class GatewayNationalMatchesModule {}
