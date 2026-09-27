import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { GatewayNationalMatchStatsController } from './national-match-stats.controller';

@Module({
  imports: [NatsModule],
  controllers: [GatewayNationalMatchStatsController],
  providers: [NatsJwtAuthGuard],
})
export class GatewayNationalMatchStatsModule {}
