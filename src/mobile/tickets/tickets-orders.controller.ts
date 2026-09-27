import { Body, Controller, Get, Inject, Param, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';

@Controller('tickets/orders')
export class MobileTicketsOrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.natsService.send('tickets.list-orders', { userId });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.natsService.send('tickets.get-order', { id });
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.mobile.create-order', body);
  }
}
