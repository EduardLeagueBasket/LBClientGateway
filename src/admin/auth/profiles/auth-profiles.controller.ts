import { Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../decorators/roles.decorator';
import { AdminRolesGuard } from '../guards/admin-roles.guard';
import {
  GatewayUserAuth,
  NatsJwtAuthGuard,
} from '../guards/nats-jwt-auth.guard';
import { filterCreatableProfiles } from '../users/user-profile-policy';

@Controller('admin/profiles')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles(
  'ADMIN',
  'SUPER_ADMIN',
  'MANAGER_LEAGUE',
  'MANAGER_TEAM',
  'ASISTANT_LEAGUE',
  'ASISTANT_TEAM',
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
)
export class AuthProfilesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  async list(@Req() req: { user?: GatewayUserAuth }) {
    const profiles = await firstValueFrom(
      this.natsService.send<Array<{ id: string; name: string }>>(
        'auth.profiles',
        {},
      ),
    );

    return filterCreatableProfiles(
      req.user?.profile?.name,
      Array.isArray(profiles) ? profiles : [],
    );
  }

  @Post('generate')
  //@Roles('ADMIN', 'SUPER_ADMIN')
  generate() {
    return this.natsService.send('profile-generate', {});
  }
}
