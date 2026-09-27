import { Module } from '@nestjs/common';
import { NatsModule } from '../nats/nats.module';
import { NatsJwtAuthGuard } from '../admin/auth/guards/nats-jwt-auth.guard';
import { UploadMedia } from '../helpers/upload-media';
import { UploadController } from './upload.controller';

@Module({
  imports: [NatsModule],
  controllers: [UploadController],
  providers: [UploadMedia, NatsJwtAuthGuard],
})
export class UploadModule {}
