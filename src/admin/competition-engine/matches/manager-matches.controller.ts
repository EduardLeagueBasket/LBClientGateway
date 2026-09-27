import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { CreateEngineMatchDto } from './dto/create-match.dto';

const MANAGER_ALLOWED_TYPES = ['FRIENDLY', 'TOURNAMENT', 'INTERNATIONAL'];

@Controller('admin/engine/my-matches')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('MANAGER_TEAM')
export class ManagerLeagueMatchesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  async findMine(
    @Req() req: { user?: { id?: string } },
    @Query('statuses') statuses?: string,
  ) {
    const team = await this.resolveManagerTeam(req.user?.id);
    const parsedStatuses = statuses
      ? statuses
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : ['SCHEDULED', 'LIVE', 'FINISHED'];

    return this.natsService.send('competition-engine.find-matches', {
      teamId: team.id,
      statuses: parsedStatuses,
      page: 1,
      limit: 100,
    });
  }

  @Post()
  async create(
    @Req() req: { user?: { id?: string } },
    @Body() dto: CreateEngineMatchDto,
  ) {
    const team = await this.resolveManagerTeam(req.user?.id);
    const matchType = dto.matchType ?? 'FRIENDLY';

    if (!MANAGER_ALLOWED_TYPES.includes(matchType)) {
      throw new ForbiddenException(
        'El gerente solo puede crear amistosos, torneos o internacionales',
      );
    }

    if (dto.homeTeamId !== team.id) {
      throw new ForbiddenException(
        'Solo puedes registrar partidos donde tu equipo sea local',
      );
    }

    return this.natsService.send('competition-engine.create-match', {
      ...dto,
      competitionId: dto.competitionId ?? team.competitionId,
      matchType,
      createdById: req.user?.id,
    });
  }

  private async resolveManagerTeam(userId?: string) {
    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const team = await firstValueFrom(
      this.natsService.send<{ id: string; competitionId: string } | null>(
        'competition-engine.get-team-by-manager-user',
        { id: userId },
      ),
    );

    if (!team?.id) {
      throw new ForbiddenException('No tienes un equipo asignado');
    }

    return team;
  }
}
