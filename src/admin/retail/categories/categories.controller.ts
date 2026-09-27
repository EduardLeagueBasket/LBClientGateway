import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';

@Controller('admin/retail/categories')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class CategoriesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  list() {
    return this.natsService.send('retail.list-categories', {});
  }
}
