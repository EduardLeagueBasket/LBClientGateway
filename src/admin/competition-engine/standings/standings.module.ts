import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { EngineStandingsController } from './standings.controller';

@Module({
  imports: [NatsModule],
  controllers: [EngineStandingsController],
  providers: [NatsJwtAuthGuard],
})
export class EngineStandingsModule {}
