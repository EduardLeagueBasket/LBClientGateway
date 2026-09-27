import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../retail/shared/dto/id.param';

@Controller('admin/tickets/orders')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTicketsOrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.list-orders', query);
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.get-order', { id: params.id });
  }
}
