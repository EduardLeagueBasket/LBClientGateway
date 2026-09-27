import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';

@Controller('tickets/cart')
export class MobileTicketsCartController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  getCart(@Query('userId') userId: string) {
    return this.natsService.send('tickets.mobile.get-cart', { userId });
  }

  @Post('items')
  addItem(@Body() body: Record<string, unknown>) {
    return this.natsService.send('tickets.mobile.add-cart-item', body);
  }

  @Patch(':cartId/items/:itemId')
  updateItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.natsService.send('tickets.mobile.update-cart-item', {
      cartId,
      itemId,
      ...body,
    });
  }

  @Delete(':cartId/items/:itemId')
  removeItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.natsService.send('tickets.mobile.remove-cart-item', {
      cartId,
      itemId,
    });
  }

  @Delete(':cartId')
  clear(@Param('cartId') cartId: string) {
    return this.natsService.send('tickets.mobile.clear-cart', { id: cartId });
  }
}
