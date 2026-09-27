import { Module } from '@nestjs/common';
import { NatsModule } from '../../nats/nats.module';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthDevicesController } from './customer-auth-devices.controller';
import { CustomerAuthFavoriteTeamsController } from './customer-auth-favorite-teams.controller';

@Module({
  imports: [NatsModule],
  controllers: [
    CustomerAuthController,
    CustomerAuthDevicesController,
    CustomerAuthFavoriteTeamsController,
  ],
})
export class CustomerAuthMobileModule {}
