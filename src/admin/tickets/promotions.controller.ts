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
import { NATS_SERVICE } from '../../config/service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../retail/shared/dto/id.param';

@Controller('admin/tickets/promotions')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTicketsPromotionsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.create-promotion', body);
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.list-promotions', query);
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.get-promotion', { id: params.id });
  }

  @Patch(':id')
  update(@Param() params: IdParamDto, @Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.update-promotion', {
      id: params.id,
      ...body,
    });
  }
}
