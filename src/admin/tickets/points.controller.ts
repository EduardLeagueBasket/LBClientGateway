import {
  Body,
  Controller,
  Get,
  Inject,
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

@Controller('admin/tickets/points')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminTicketsPointsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get('wallet')
  getWallet(@Query('userId') userId: string) {
    return this.natsService.send('tickets.get-points-wallet', { userId });
  }

  @Get('transactions')
  listTransactions(@Query('userId') userId: string) {
    return this.natsService.send('tickets.list-points-transactions', {
      userId,
    });
  }

  @Post('adjust')
  adjust(
    @Req() req: { user?: { id?: string } },
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.adjust-points', {
      ...body,
      adjustedBy: req.user?.id,
    });
  }
}
