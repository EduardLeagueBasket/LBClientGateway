import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../retail/shared/dto/id.param';

@Controller('admin/tickets')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTicketsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.list-tickets', query);
  }

  @Get('by-code/:code')
  findByCode(@Param('code') code: string) {
    return this.natsService.send('tickets.get-ticket-by-code', { code });
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.get-ticket', { id: params.id });
  }

  @Post('assign')
  assign(
    @Req() req: { user?: { id?: string } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.assign-ticket', {
      ...body,
      assignedBy: req.user?.id,
    });
  }

  @Post('taquilla')
  registerTaquilla(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.register-taquilla-ticket', body);
  }
}
