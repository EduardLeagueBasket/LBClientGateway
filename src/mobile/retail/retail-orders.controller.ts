import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import { MobileListOrdersQueryDto } from './dto/cart.dto';

@Controller('retail/orders')
export class MobileRetailOrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: MobileListOrdersQueryDto) {
    return this.natsService.send('retail.list-orders', query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.natsService.send('retail.get-order', { id });
  }
}
