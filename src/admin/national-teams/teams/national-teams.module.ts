import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { GatewayNationalTeamsController } from './national-teams.controller';

@Module({
  imports: [NatsModule],
  controllers: [GatewayNationalTeamsController],
  providers: [NatsJwtAuthGuard],
})
export class GatewayNationalTeamsModule {}
