import { Module } from '@nestjs/common';
import { CompetitionEngineController } from './competition-engine.controller';
import { LeagueMatchesMobileController } from './league-matches.controller';
import { NatsModule } from '../../nats/nats.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  controllers: [CompetitionEngineController, LeagueMatchesMobileController],
  imports: [NatsModule, TeamsModule],
})
export class CompetitionEngineModule {}
