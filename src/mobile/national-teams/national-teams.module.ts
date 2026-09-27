import { Module } from '@nestjs/common';
import { NationalTeamsController } from './national-teams.controller';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [NationalTeamsController],
})
export class NationalTeamsMobileModule {}
