import { Module } from '@nestjs/common';
import { NatsModule } from '../../nats/nats.module';
import { AdminTicketsVenuesController } from './venues.controller';
import { AdminTicketsEventsController, AdminTicketsSectionsNestedController } from './events.controller';
import { AdminTicketsController } from './tickets.controller';
import { AdminTicketsPromotionsController } from './promotions.controller';
import { AdminTicketsOrdersController } from './orders.controller';
import { AdminTicketsRafflesController } from './raffles.controller';
import { AdminTicketsPointsController } from './points.controller';

@Module({
  imports: [NatsModule],
  controllers: [
    AdminTicketsVenuesController,
    AdminTicketsEventsController,
    AdminTicketsSectionsNestedController,
    AdminTicketsController,
    AdminTicketsPromotionsController,
    AdminTicketsOrdersController,
    AdminTicketsRafflesController,
    AdminTicketsPointsController,
  ],
})
export class AdminTicketsModule {}
