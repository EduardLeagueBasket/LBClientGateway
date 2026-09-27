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
import {
  MobileAddCartItemDto,
  MobileGetCartQueryDto,
  MobileUpdateCartItemDto,
} from './dto/cart.dto';

@Controller('retail/cart')
export class MobileRetailCartsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  getCart(@Query() query: MobileGetCartQueryDto) {
    return this.natsService.send('retail.get-cart', query);
  }

  @Post('items')
  addItem(@Body() dto: MobileAddCartItemDto) {
    return this.natsService.send('retail.add-cart-item', dto);
  }

  @Patch(':cartId/items/:itemId')
  updateItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() dto: MobileUpdateCartItemDto,
  ) {
    return this.natsService.send('retail.update-cart-item', {
      carritoId: cartId,
      itemId,
      cantidad: dto.cantidad,
    });
  }

  @Delete(':cartId/items/:itemId')
  removeItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string) {
    return this.natsService.send('retail.remove-cart-item', {
      carritoId: cartId,
      itemId,
    });
  }

  @Delete(':cartId')
  clear(@Param('cartId') cartId: string) {
    return this.natsService.send('retail.clear-cart', { id: cartId });
  }
}
