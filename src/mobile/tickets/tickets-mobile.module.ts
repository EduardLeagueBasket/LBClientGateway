import { Module } from '@nestjs/common';
import { NatsModule } from '../../nats/nats.module';
import { MobileTicketsEventsController } from './tickets-events.controller';
import { MobileTicketsCartController } from './tickets-cart.controller';
import { MobileTicketsOrdersController } from './tickets-orders.controller';
import { MobileTicketsWalletController } from './tickets-wallet.controller';
import { MobileTicketsMyTicketsController } from './tickets-my-tickets.controller';
import { MobileTicketsRafflesController } from './tickets-raffles.controller';

@Module({
  imports: [NatsModule],
  controllers: [
    MobileTicketsEventsController,
    MobileTicketsCartController,
    MobileTicketsOrdersController,
    MobileTicketsWalletController,
    MobileTicketsMyTicketsController,
    MobileTicketsRafflesController,
  ],
})
export class TicketsMobileModule {}
