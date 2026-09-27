import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { UploadMedia } from '../../../helpers/upload-media';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import {
  GatewayUserAuth,
  NatsJwtAuthGuard,
} from '../../auth/guards/nats-jwt-auth.guard';
import { LeagueScopeService } from '../../sports-catalog/competitions/league-scope.service';
import { IdParamDto } from '../shared/dto/id.param';
import { CreateEngineTeamDto } from './dto/create-team.dto';
import { UpdateEngineTeamDto } from './dto/update-team.dto';

type CreateTeamNatsPayload = {
  name: string;
  competitionId: string;
  createdById?: string;
  managerUserId?: string;
  logo?: string;
  groupId?: string;
  sellsTickets?: boolean;
  isActive?: boolean;
};

@Controller('admin/teams')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
export class EngineTeamsController {
  constructor(
    private readonly uploadMedia: UploadMedia,
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
    private readonly leagueScope: LeagueScopeService,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req: { user?: GatewayUserAuth },
    @Body() dto: CreateEngineTeamDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const competitionId = await this.resolveTeamCompetitionId(req.user, dto);
    await this.assertManagerBelongsToCompetition(
      dto.managerUserId,
      competitionId,
    );

    let resolvedLogo = '';
    if (file) {
      const uploadResult = await this.uploadMedia.uploadImage(
        file,
        'team-logos',
      );
      resolvedLogo = uploadResult.secure_url;
    } else {
      const fromLogo = typeof dto.logo === 'string' ? dto.logo.trim() : '';
      const fromLogoUrl =
        typeof dto.logoUrl === 'string' ? dto.logoUrl.trim() : '';
      resolvedLogo = fromLogo.length > 0 ? fromLogo : fromLogoUrl;
    }

    const payload: CreateTeamNatsPayload = {
      name: dto.name,
      competitionId,
      createdById: req.user?.id,
    };
    if (dto.managerUserId) {
      payload.managerUserId = dto.managerUserId;
    }
    if (resolvedLogo) {
      payload.logo = resolvedLogo;
    }
    if (dto.groupId) {
      payload.groupId = dto.groupId;
    }
    if (dto.sellsTickets !== undefined) {
      payload.sellsTickets = dto.sellsTickets;
    }
    if (dto.isActive !== undefined) {
      payload.isActive = dto.isActive;
    }
    const team = await firstValueFrom(
      this.natsService.send<{
        id: string;
        name: string;
        logo?: string | null;
        competitionId: string;
      }>('competition-engine.create-team', payload),
    );

    if (dto.managerUserId) {
      await this.leagueScope.setUserCompetition(
        dto.managerUserId,
        competitionId,
      );
    }

    let countryCode = 'GLOBAL';
    try {
      const competition = await firstValueFrom(
        this.natsService.send<{
          country?: { countryCode?: string };
          countryCode?: string;
        }>('get-competition', { id: team.competitionId }),
      );
      countryCode =
        competition?.country?.countryCode ||
        competition?.countryCode ||
        'GLOBAL';
    } catch {
      // sin país de competición → GLOBAL
    }

    this.natsService.emit('publisher.sync', {
      entity_type: 'team',
      entity_id: team.id,
      display_name: team.name,
      avatar_url: team.logo ?? resolvedLogo ?? '',
      is_verified: true,
      country_code: String(countryCode).toUpperCase(),
    });

    return team;
  }

  @Get('by-manager')
  @Roles('MANAGER_TEAM')
  async findByManager(@Req() req: { user?: { id?: string } }) {
    if (!req.user?.id) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    return firstValueFrom(
      this.natsService.send(
        'competition-engine.get-team-by-manager-user',
        { id: req.user.id },
      ),
    );
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
  async findAll(@Req() req: { user?: GatewayUserAuth }) {
    const scopedCompetitionId = this.leagueScope.isLeagueStaff(
      req.user?.profile?.name,
    )
      ? await this.leagueScope.resolveCompetitionId(req.user)
      : undefined;

    const [teams, competitions] = await Promise.all([
      firstValueFrom(
        this.natsService.send<unknown[]>('competition-engine.list-teams', {}),
      ),
      firstValueFrom(
        this.natsService.send<unknown[]>('list-competitions', {}),
      ),
    ]);

    const list = (Array.isArray(teams) ? teams : []).filter((t) => {
      if (!scopedCompetitionId) return true;
      const row = t as { competitionId?: string };
      return row.competitionId === scopedCompetitionId;
    });
    const comps = Array.isArray(competitions) ? competitions : [];
    const byId = new Map<string, unknown>(
      comps.map((c) => {
        const row = c as { id?: string };
        return [String(row.id ?? ''), c];
      }),
    );

    return list.map((t) => {
      const row = t as { competitionId?: string };
      const cid = row.competitionId ? String(row.competitionId) : '';
      return {
        ...row,
        competition: cid ? (byId.get(cid) ?? null) : null,
      };
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'MANAGER_TEAM')
  async findById(@Param() params: IdParamDto) {
    const team = await firstValueFrom(
      this.natsService.send<{
        id?: string;
        competitionId?: string;
      } | null>('competition-engine.get-team', {
        id: params.id,
      }),
    );
    if (!team) {
      return team;
    }

    let competition = null;
    if (team.competitionId) {
      try {
        competition = await firstValueFrom(
          this.natsService.send('get-competition', { id: team.competitionId }),
        );
      } catch {
        competition = null;
      }
    }

    return { ...team, competition };
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'MANAGER_TEAM')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Req() req: { user?: GatewayUserAuth },
    @Param() params: IdParamDto,
    @Body() dto: UpdateEngineTeamDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: UpdateEngineTeamDto = { ...dto };
    const profile = req.user?.profile?.name;
    const canAssignCompetition =
      profile === 'ADMIN' || profile === 'SUPER_ADMIN';

    if (profile === 'MANAGER_TEAM') {
      delete data.sellsTickets;
      delete data.isActive;
    }
    if (!canAssignCompetition) {
      delete data.competitionId;
    }
    if (file) {
      const uploadResult = await this.uploadMedia.uploadImage(
        file,
        'team-logos',
      );
      data.logo = uploadResult.secure_url;
    }

    if (data.competitionId) {
      const existing = await firstValueFrom(
        this.natsService.send<{
          managerUserId?: string | null;
          competitionId?: string;
        } | null>('competition-engine.get-team', { id: params.id }),
      );
      if (
        existing?.competitionId &&
        existing.competitionId !== data.competitionId
      ) {
        data.groupId = null;
      }
      if (existing?.managerUserId) {
        await this.leagueScope.setUserCompetition(
          existing.managerUserId,
          data.competitionId,
        );
      }
    }

    return this.natsService.send('competition-engine.update-team', {
      id: params.id,
      data,
    });
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  delete(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.delete-team', {
      id: params.id,
    });
  }

  private async resolveTeamCompetitionId(
    user: GatewayUserAuth | undefined,
    dto: CreateEngineTeamDto,
  ): Promise<string> {
    if (this.leagueScope.isLeagueStaff(user?.profile?.name)) {
      const competitionId = await this.leagueScope.resolveCompetitionId(user);
      if (!competitionId) {
        throw new BadRequestException(
          'No tienes una liga asignada. Pide al administrador que te asocie a una competencia.',
        );
      }
      return competitionId;
    }

    if (!dto.competitionId) {
      throw new BadRequestException('Debes indicar la liga del equipo');
    }
    return dto.competitionId;
  }

  private async assertManagerBelongsToCompetition(
    managerUserId: string | undefined,
    competitionId: string,
  ) {
    if (!managerUserId) {
      return;
    }
    const manager = await firstValueFrom(
      this.natsService.send<{
        competitionId?: string | null;
        profile?: { name?: string };
      }>('auth.get-user-by-id', { id: managerUserId }),
    );
    if (
      manager?.competitionId &&
      manager.competitionId !== competitionId
    ) {
      throw new BadRequestException(
        'Ese gerente de equipo pertenece a otra liga',
      );
    }
  }
}
