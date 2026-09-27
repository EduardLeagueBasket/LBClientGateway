import { Module } from '@nestjs/common';
import { NatsModule } from '../../nats/nats.module';
import { MobileRetailProductsController } from './retail-products.controller';
import { MobileRetailCartsController } from './retail-carts.controller';
import { MobileRetailOrdersController } from './retail-orders.controller';
import { MobileRetailCategoriesController } from './retail-categories.controller';

@Module({
  imports: [NatsModule],
  controllers: [
    MobileRetailProductsController,
    MobileRetailCartsController,
    MobileRetailOrdersController,
    MobileRetailCategoriesController,
  ],
})
export class RetailMobileModule {}
