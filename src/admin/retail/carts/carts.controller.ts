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
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import {
  AddCartItemDto,
  GetCartQuery,
  ListCartsQuery,
  UpdateCartItemDto,
} from './dto/cart.dto';

@Controller('admin/retail/carts')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class CartsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  list(@Query() query: ListCartsQuery) {
    return this.natsService.send('retail.list-carts', query);
  }

  @Get('active')
  getActive(@Query() query: GetCartQuery) {
    return this.natsService.send('retail.get-cart', query);
  }

  @Post(':cartId/items')
  addItem(@Param('cartId') cartId: string, @Body() dto: AddCartItemDto) {
    return this.natsService.send('retail.add-cart-item', dto);
  }

  @Patch(':cartId/items/:itemId')
  updateItem(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemDto,
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
