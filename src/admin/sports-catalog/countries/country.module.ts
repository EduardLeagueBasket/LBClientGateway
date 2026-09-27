import { Module } from '@nestjs/common';
import { SportsCatalogController } from './country.controller';
import { NatsModule } from '../../../nats/nats.module';
import { UploadMedia } from '../../../helpers/upload-media';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';

@Module({
  imports: [NatsModule],
  controllers: [SportsCatalogController],
  providers: [UploadMedia, NatsJwtAuthGuard],
})
export class CountryModule {}
