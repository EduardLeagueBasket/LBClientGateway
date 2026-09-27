import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [NatsModule],
  controllers: [CategoriesController],
  providers: [NatsJwtAuthGuard],
})
export class CategoriesModule {}
