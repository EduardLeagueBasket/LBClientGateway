import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import {
  CreateOrderDto,
  ListOrdersQuery,
  UpdateOrderStatusDto,
} from './dto/order.dto';

@Controller('admin/retail/orders')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: ListOrdersQuery) {
    return this.natsService.send('retail.list-orders', query);
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('retail.get-order', { id: params.id });
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.natsService.send('retail.create-order', dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param() params: IdParamDto,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.natsService.send('retail.update-order-status', {
      id: params.id,
      estado: dto.estado,
    });
  }
}
