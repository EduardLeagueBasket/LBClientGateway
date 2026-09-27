import { Module } from '@nestjs/common';
import { NatsModule } from '../../../nats/nats.module';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { AuthProfilesController } from './auth-profiles.controller';

@Module({
  imports: [NatsModule],
  controllers: [AuthProfilesController],
  providers: [NatsJwtAuthGuard],
})
export class AuthProfilesModule {}
