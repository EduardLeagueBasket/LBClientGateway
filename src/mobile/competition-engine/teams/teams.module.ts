import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [TeamsController],
  providers: [],
})
export class TeamsModule {}
