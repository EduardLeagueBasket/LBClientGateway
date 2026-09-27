import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../decorators/roles.decorator';
import { AdminRolesGuard } from '../guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../guards/nats-jwt-auth.guard';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('admin/auth')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles(
  'ADMIN',
  'SUPER_ADMIN',
  'MANAGER_LEAGUE',
  'MANAGER_TEAM',
  'PLAYER',
  'ASISTANT_TEAM',
  'ASISTANT_LEAGUE',
  'COACH',
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
)
export class AuthPasswordController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post('update-password')
  updatePassword(@Body() dto: UpdatePasswordDto) {
    return this.natsService.send('auth.update-password', dto);
  }
}
