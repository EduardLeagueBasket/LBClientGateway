import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { EngineMatchesController } from './matches.controller';
import { ManagerLeagueMatchesController } from './manager-matches.controller';

@Module({
  imports: [NatsModule],
  controllers: [EngineMatchesController, ManagerLeagueMatchesController],
  providers: [NatsJwtAuthGuard],
})
export class EngineMatchesModule {}
