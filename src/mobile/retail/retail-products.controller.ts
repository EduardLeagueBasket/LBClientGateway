import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import { MobileListProductsQueryDto } from './dto/list-products-query.dto';

@Controller('retail/products')
export class MobileRetailProductsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: MobileListProductsQueryDto) {
    return this.natsService.send('retail.list-products', {
      teamId: query.teamId,
      teamType: query.teamType,
      activo: query.activo ?? true,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.natsService.send('retail.get-product', { id });
  }
}
