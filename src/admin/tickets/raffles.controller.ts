import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
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

@Controller('admin/tickets/raffles')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTicketsRafflesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  create(
    @Req() req: { user?: { id?: string } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.create-raffle', {
      ...body,
      createdBy: req.user?.id,
    });
  }

  @Get()
  findAll(@Query() query: Record<string, unknown>) {
    return this.natsService.send('tickets.list-raffles', query);
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.get-raffle', { id: params.id });
  }

  @Patch(':id/status')
  updateStatus(@Param() params: IdParamDto, @Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.update-raffle-status', {
      id: params.id,
      ...body,
    });
  }

  @Post(':id/draw')
  draw(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.draw-raffle', {
      raffleId: params.id,
    });
  }

  @Post(':id/prizes')
  createPrize(
    @Param() params: IdParamDto,
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.create-prize', {
      raffleId: params.id,
      ...body,
    });
  }

  @Get(':id/prizes')
  listPrizes(@Param() params: IdParamDto) {
    return this.natsService.send('tickets.list-prizes', {
      raffleId: params.id,
    });
  }

  @Post('prizes/:prizeId/assign')
  assignPrize(
    @Req() req: { user?: { id?: string } },
    @Param('prizeId') prizeId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.assign-prize', {
      prizeId,
      ...body,
      assignedBy: req.user?.id,
    });
  }
}
