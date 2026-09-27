import { Controller, Get, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';

@Controller('tickets/raffles')
export class MobileTicketsRafflesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.mobile.list-raffles', query);
  }

  @Get('eligibility')
  checkEligibility(
    @Query('eventId') eventId: string,
    @Query('userId') userId: string,
  ) {
    return this.natsService.send('tickets.mobile.check-raffle-eligibility', {
      eventId,
      userId,
    });
  }
}
