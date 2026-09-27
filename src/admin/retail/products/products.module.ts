import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { UploadMedia } from '../../../helpers/upload-media';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { ProductsController } from './products.controller';

@Module({
  imports: [NatsModule],
  controllers: [ProductsController],
  providers: [UploadMedia, NatsJwtAuthGuard],
})
export class ProductsModule {}
