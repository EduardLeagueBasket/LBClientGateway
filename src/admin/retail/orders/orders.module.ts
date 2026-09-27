import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { OrdersController } from './orders.controller';

@Module({
  imports: [NatsModule],
  controllers: [OrdersController],
  providers: [NatsJwtAuthGuard],
})
export class OrdersModule {}
