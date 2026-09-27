import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';

@Controller('tickets/my')
export class MobileTicketsMyTicketsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  listMyTickets(
    @Query('userId') userId: string,
    @Query('status') status?: string,
  ) {
    return this.natsService.send('tickets.mobile.list-my-tickets', {
      userId,
      status,
    });
  }

  @Post('transfer')
  transfer(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.mobile.transfer-ticket', body);
  }

  @Get('transfers')
  listTransfers(@Query('userId') userId: string) {
    return this.natsService.send('tickets.mobile.list-transfers', { userId });
  }

  @Post('register-taquilla')
  registerTaquilla(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.mobile.register-taquilla-ticket', body);
  }
}
