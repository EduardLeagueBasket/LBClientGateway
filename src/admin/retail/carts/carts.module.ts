import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { CartsController } from './carts.controller';

@Module({
  imports: [NatsModule],
  controllers: [CartsController],
  providers: [NatsJwtAuthGuard],
})
export class CartsModule {}
