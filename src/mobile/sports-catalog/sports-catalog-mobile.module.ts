import { Module } from '@nestjs/common';
import { SportsCatalogMobileController } from './sports-catalog-mobile.controller';
import { NatsModule } from '../../nats/nats.module';

@Module({
  imports: [NatsModule],
  controllers: [SportsCatalogMobileController],
})
export class SportsCatalogMobileModule {}
