import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';

@Controller('tickets/events')
export class MobileTicketsEventsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.mobile.list-events', query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.natsService.send('tickets.mobile.get-event', { id });
  }

  @Get(':id/sections')
  listSections(@Param('id') id: string) {
    return this.natsService.send('tickets.list-event-sections', {
      eventId: id,
      active: true,
    });
  }
}
