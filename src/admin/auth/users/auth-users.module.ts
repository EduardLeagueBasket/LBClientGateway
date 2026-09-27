import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { CompetitionsModule } from '../../sports-catalog/competitions/competitions.module';
import { AuthUsersController } from './auth-users.controller';

@Module({
  imports: [NatsModule, CompetitionsModule],
  controllers: [AuthUsersController],
  providers: [NatsJwtAuthGuard],
})
export class AuthUsersModule {}
