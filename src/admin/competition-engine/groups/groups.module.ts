import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../../admin/auth/guards/nats-jwt-auth.guard';
import { EngineGroupsController } from './groups.controller';

@Module({
  imports: [NatsModule],
  controllers: [EngineGroupsController],
  providers: [NatsJwtAuthGuard],
})
export class EngineGroupsModule {}
