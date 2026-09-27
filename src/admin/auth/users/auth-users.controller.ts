import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { LeagueScopeService } from '../../sports-catalog/competitions/league-scope.service';
import { Roles } from '../decorators/roles.decorator';
import { AdminRolesGuard } from '../guards/admin-roles.guard';
import {
  GatewayUserAuth,
  NatsJwtAuthGuard,
} from '../guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { assertCanAssignProfile } from './user-profile-policy';

type JwtRequest = { user?: GatewayUserAuth };

const LEAGUE_BOUND_PROFILES = new Set([
  'MANAGER_TEAM',
  'ASISTANT_LEAGUE',
  'ASISTANT_TEAM',
]);

@Controller('admin/users')
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
export class AuthUsersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
    private readonly leagueScope: LeagueScopeService,
  ) {}

  @Post()
  @Roles(
    'ADMIN',
    'SUPER_ADMIN',
    'MANAGER_LEAGUE',
    'MANAGER_TEAM',
    'MANAGER_NATIONAL_TEAM',
    'MANAGER_REGIONAL_TEAM',
  )
  async create(
    @Req() req: { user?: GatewayUserAuth },
    @Body() dto: CreateUserDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const profileName = await this.resolveProfileName(dto.profileId);
    assertCanAssignProfile(req.user?.profile?.name, profileName);

    const competitionId = await this.resolveCompetitionForNewUser(
      req.user,
      dto,
      profileName,
    );

    return this.natsService.send('auth.create-user', {
      ...dto,
      userId,
      ...(competitionId ? { competitionId } : {}),
    });
  }

  @Post('list')
  list(@Req() req: JwtRequest, @Body() dto: ListUsersQueryDto) {
    const user = req.user;
    const email = user?.email;
    const profileId = user?.profile?.id;
    if (!user || !email || !profileId) {
      throw new UnauthorizedException();
    }
    return this.natsService.send('auth.list-users', {
      admin: {
        id: user.id,
        email,
        profileId: String(profileId),
      },
      ...dto,
    });
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('auth.get-user-by-id', { id: params.id });
  }

  @Patch(':id')
  @Roles(
    'ADMIN',
    'SUPER_ADMIN',
    'MANAGER_LEAGUE',
    'MANAGER_TEAM',
    'MANAGER_NATIONAL_TEAM',
    'MANAGER_REGIONAL_TEAM',
  )
  async update(
    @Req() req: { user?: GatewayUserAuth },
    @Param() params: IdParamDto,
    @Body() dto: UpdateUserDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException();
    }

    const profileName = await this.resolveProfileName(dto.profileId);
    assertCanAssignProfile(req.user?.profile?.name, profileName);

    return this.natsService.send('auth.update-user', {
      ...dto,
      id: params.id,
      userId,
    });
  }

  @Delete(':id')
  deactivate(@Param() params: IdParamDto) {
    return this.natsService.send('auth.deactivate-user', { id: params.id });
  }

  private async resolveCompetitionForNewUser(
    actor: GatewayUserAuth | undefined,
    dto: CreateUserDto,
    profileName: string,
  ): Promise<string | undefined> {
    const needsLeague = LEAGUE_BOUND_PROFILES.has(profileName);
    const actorProfile = actor?.profile?.name;

    if (
      this.leagueScope.isLeagueStaff(actorProfile) ||
      actorProfile === 'MANAGER_TEAM'
    ) {
      const competitionId = await this.leagueScope.resolveCompetitionId(actor);
      if (!competitionId) {
        throw new BadRequestException(
          'No tienes una liga asignada. Pide al administrador que te asocie a una competencia.',
        );
      }
      return competitionId;
    }

    if (needsLeague && !dto.competitionId) {
      throw new BadRequestException(
        'Debes indicar la liga a la que pertenecerá este usuario.',
      );
    }

    return dto.competitionId || undefined;
  }

  private async resolveProfileName(profileId: string): Promise<string> {
    const profiles = await firstValueFrom(
      this.natsService.send<Array<{ id?: number | string; name?: string }>>(
        'auth.profiles',
        {},
      ),
    );
    const list = Array.isArray(profiles) ? profiles : [];
    const found = list.find((p) => String(p.id) === String(profileId));
    return found?.name ?? '';
  }
}
