import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { UploadMedia } from '../../../helpers/upload-media';
import { CompetitionsModule } from '../../sports-catalog/competitions/competitions.module';
import { EngineTeamsController } from './teams.controller';

@Module({
  imports: [NatsModule, CompetitionsModule],
  controllers: [EngineTeamsController],
  providers: [UploadMedia, NatsJwtAuthGuard],
})
export class EngineTeamsModule {}
