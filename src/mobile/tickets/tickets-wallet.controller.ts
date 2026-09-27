import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';

@Controller('tickets/points')
export class MobileTicketsWalletController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get('wallet')
  getWallet(@Query('userId') userId: string) {
    return this.natsService.send('tickets.mobile.get-points-wallet', {
      userId,
    });
  }

  @Post('redeem')
  redeem(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.mobile.redeem-ticket', body);
  }
}
