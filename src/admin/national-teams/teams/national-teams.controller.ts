import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  BadRequestException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import {
  GatewayUserAuth,
  NatsJwtAuthGuard,
} from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import { CreateNationalTeamDto } from './dto/create-national-team.dto';
import { UpdateNationalTeamDto } from './dto/update-national-team.dto';
import { firstValueFrom } from 'rxjs';
import { NationalTeamEntity } from 'src/mobile/sports-catalog/entities/national-team.entity';
import { CountryEntity } from '../../sports-catalog/countries/entities/country.entity';

const REPRESENTATIVE_STAFF = [
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
] as const;

@Controller('admin/national-teams/teams')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class GatewayNationalTeamsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  async create(
    @Req() req: { user?: { id?: string } },
    @Body() dto: CreateNationalTeamDto,
  ) {
    const country = await this.resolveCatalogCountry(
      dto.countryId,
      dto.countryCode,
      true,
    );
    const nationalTeam = await firstValueFrom(
      this.natsService.send<NationalTeamEntity>(
        'national-teams.create-national-team',
        {
          ...dto,
          type: dto.type ?? 'national_team',
          countryCode: country?.countryCode,
          countryId: country?.id,
          createdById: req.user?.id,
        },
      ),
    );

    this.syncPublisher(nationalTeam, country?.countryCode || 'GLOBAL');

    return nationalTeam;
  }

  @Get()
  findAll(@Query('type') type?: string) {
    const payload =
      type === 'national_team' || type === 'regional' ? { type } : {};
    return this.natsService.send('national-teams.list-national-teams', payload);
  }

  /** Selección o equipo regional asignado al manager/asistente (para backoffice). */
  @Get('me')
  @Roles(...REPRESENTATIVE_STAFF)
  async findMine(@Req() req: { user?: { id?: string } }) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Missing user id');

    const byManager = await firstValueFrom(
      this.natsService.send<NationalTeamEntity | null>(
        'national-teams.get-by-manager-user',
        { id: userId },
      ),
    );

    if (byManager?.id) {
      return byManager;
    }

    return this.natsService.send('national-teams.get-by-staff-user', {
      id: userId,
    });
  }

  /** Self-serve: el manager crea su selección/equipo regional y queda asignado. */
  @Post('me')
  @Roles('MANAGER_NATIONAL_TEAM', 'MANAGER_REGIONAL_TEAM')
  async createMine(
    @Req() req: { user?: GatewayUserAuth },
    @Body() dto: CreateNationalTeamDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new BadRequestException('Missing user id');

    const type =
      dto.type ??
      (req.user?.profile?.name === 'MANAGER_REGIONAL_TEAM'
        ? 'regional'
        : 'national_team');

    if (type === 'regional' && !dto.region?.trim()) {
      throw new BadRequestException(
        'La región es requerida para un equipo regional',
      );
    }

    const country = await this.resolveCatalogCountry(
      dto.countryId,
      dto.countryCode,
      true,
    );

    const nationalTeam = await firstValueFrom(
      this.natsService.send<NationalTeamEntity>(
        'national-teams.create-national-team',
        {
          ...dto,
          type,
          countryCode: country?.countryCode,
          countryId: country?.id,
          createdById: userId,
          managerUserId: userId,
        },
      ),
    );

    this.syncPublisher(nationalTeam, country?.countryCode || 'GLOBAL');

    return nationalTeam;
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('national-teams.get-national-team', {
      id: params.id,
    });
  }

  @Patch(':id')
  async update(
    @Param() params: IdParamDto,
    @Body() dto: UpdateNationalTeamDto,
  ) {
    const country = await this.resolveCatalogCountry(
      dto.countryId,
      dto.countryCode,
      false,
    );
    const payload = {
      ...dto,
      ...(country
        ? { countryId: country.id, countryCode: country.countryCode }
        : {}),
    };

    const nationalTeam = await firstValueFrom(
      this.natsService.send<NationalTeamEntity>(
        'national-teams.update-national-team',
        {
          id: params.id,
          data: payload,
        },
      ),
    );

    this.syncPublisher(
      nationalTeam,
      country?.countryCode || dto.countryCode || 'GLOBAL',
    );

    return nationalTeam;
  }

  @Delete(':id')
  deactivate(@Param() params: IdParamDto) {
    return this.natsService.send('national-teams.deactivate-national-team', {
      id: params.id,
    });
  }

  private async resolveCatalogCountry(
    countryId?: string | null,
    countryCode?: string | null,
    required = false,
  ): Promise<{ id: string; countryCode: string } | null> {
    const code = countryCode?.trim().toUpperCase() || '';
    const id = countryId?.trim() || '';

    if (!id && !code) {
      if (required) {
        throw new BadRequestException('Debes indicar el país de la selección');
      }
      return null;
    }

    const countries = await firstValueFrom(
      this.natsService.send<CountryEntity[]>('get-all-countries', {}),
    );
    const list = Array.isArray(countries) ? countries : [];
    const found =
      list.find((c) => id && c.id === id) ||
      list.find((c) => code && c.countryCode?.toUpperCase() === code);

    if (!found?.id) {
      throw new BadRequestException(
        `El país ${code || id} no existe en el catálogo. Créalo en Países antes de asignar la selección.`,
      );
    }

    return {
      id: found.id,
      countryCode: (found.countryCode || code).toUpperCase(),
    };
  }

  private syncPublisher(nationalTeam: NationalTeamEntity, countryCode: string) {
    this.natsService.emit('publisher.sync', {
      entity_type: 'national team',
      entity_id: nationalTeam.id,
      display_name: nationalTeam.name,
      avatar_url: nationalTeam.logo ?? '',
      is_verified: true,
      country_code: String(countryCode || 'GLOBAL').toUpperCase(),
    });
  }
}
