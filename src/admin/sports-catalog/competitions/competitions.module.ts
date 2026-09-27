import { Module } from '@nestjs/common';
import { CompetitionsController } from './competitions.controller';
import { UploadMedia } from '../../../helpers/upload-media';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { LeagueScopeService } from './league-scope.service';

@Module({
  controllers: [CompetitionsController],
  providers: [UploadMedia, NatsJwtAuthGuard, LeagueScopeService],
  imports: [NatsModule],
  exports: [LeagueScopeService],
})
export class CompetitionsModule {}
