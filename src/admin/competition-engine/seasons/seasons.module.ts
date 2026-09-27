import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { EngineSeasonsController } from './seasons.controller';

@Module({
  imports: [NatsModule],
  controllers: [EngineSeasonsController],
  providers: [NatsJwtAuthGuard],
})
export class EngineSeasonsModule {}
