import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import {
  GatewayUserAuth,
  NatsJwtAuthGuard,
} from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import { CreateNationalMatchDto } from './dto/create-national-match.dto';
import { UpdateNationalMatchDto } from './dto/update-national-match.dto';

type UpdatePayload = { id: string; data: UpdateNationalMatchDto };

const REPRESENTATIVE_STAFF = new Set([
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
]);

@Controller('admin/national-teams/matches')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles(
  'ADMIN',
  'SUPER_ADMIN',
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
)
export class GatewayNationalMatchesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Req() req: { user?: GatewayUserAuth },
    @Body() dto: CreateNationalMatchDto,
  ) {
    const createdById = req.user?.id;
    if (!createdById) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    await this.assertCanUseTeam(req.user, dto.nationalTeamId);

    return this.natsService.send('national-teams.create-national-match', {
      ...dto,
      createdById,
    });
  }

  @Get()
  async findAll(
    @Req() req: { user?: GatewayUserAuth },
    @Query('nationalTeamId') nationalTeamId?: string,
  ) {
    if (this.isRepresentativeStaff(req.user) && req.user?.id) {
      const team = await this.findAssignedTeam(req.user.id);
      if (!team?.id) {
        return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      }
      return this.natsService.send('national-teams.list-national-matches', {
        nationalTeamId: team.id,
      });
    }

    const requested = nationalTeamId?.trim();
    return this.natsService.send('national-teams.list-national-matches', {
      ...(requested ? { nationalTeamId: requested } : {}),
    });
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('national-teams.get-national-match', {
      id: params.id,
    });
  }

  @Patch(':id/cancel')
  cancel(@Param() params: IdParamDto) {
    return this.natsService.send('national-teams.cancel-national-match', {
      id: params.id,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: { user?: GatewayUserAuth },
    @Param() params: IdParamDto,
    @Body() dto: UpdateNationalMatchDto,
  ) {
    if (dto.nationalTeamId) {
      await this.assertCanUseTeam(req.user, dto.nationalTeamId);
    }
    const payload: UpdatePayload = { id: params.id, data: dto };
    return this.natsService.send(
      'national-teams.update-national-match',
      payload,
    );
  }

  @Delete(':id')
  delete(@Param() params: IdParamDto) {
    return this.natsService.send('national-teams.delete-national-match', {
      id: params.id,
    });
  }

  private isRepresentativeStaff(user?: GatewayUserAuth) {
    const profile = user?.profile?.name;
    return typeof profile === 'string' && REPRESENTATIVE_STAFF.has(profile);
  }

  private async findAssignedTeam(userId: string) {
    const byManager = await firstValueFrom(
      this.natsService.send<{ id?: string } | null>(
        'national-teams.get-by-manager-user',
        { id: userId },
      ),
    );
    if (byManager?.id) return byManager;

    return firstValueFrom(
      this.natsService.send<{ id?: string } | null>(
        'national-teams.get-by-staff-user',
        { id: userId },
      ),
    );
  }

  private async assertCanUseTeam(
    user: GatewayUserAuth | undefined,
    nationalTeamId: string,
  ) {
    if (!this.isRepresentativeStaff(user) || !user?.id) return;

    const team = await this.findAssignedTeam(user.id);
    if (!team?.id || team.id !== nationalTeamId) {
      throw new ForbiddenException(
        'Solo puedes gestionar juegos de tu equipo asignado',
      );
    }
  }
}
