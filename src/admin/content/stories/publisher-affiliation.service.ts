import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import type { GatewayUserAuth } from '../../auth/guards/nats-jwt-auth.guard';

export type PublisherEntityType =
  | 'team'
  | 'national team'
  | 'league'
  | 'platform';

export type PublisherAffiliation = {
  entityType: PublisherEntityType;
  entityId: string;
  displayName: string;
  avatarUrl: string;
  countryCode?: string;
};

const TEAM_STAFF = new Set(['MANAGER_TEAM', 'ASISTANT_TEAM']);
const NATIONAL_STAFF = new Set([
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
]);
const LEAGUE_STAFF = new Set(['MANAGER_LEAGUE', 'ASISTANT_LEAGUE']);
const ADMIN_PROFILES = new Set(['SUPER_ADMIN', 'ADMIN']);

type ContentPublisher = {
  id?: string;
  entity_type?: string;
  entity_id?: string;
  display_name?: string;
  avatar_url?: string;
  country_code?: string;
};

function normalizeCountryCode(value?: string | null): string | undefined {
  const code = value?.trim().toUpperCase();
  return code ? code : undefined;
}

@Injectable()
export class PublisherAffiliationService {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  isAdmin(user?: GatewayUserAuth): boolean {
    const profile = user?.profile?.name;
    return typeof profile === 'string' && ADMIN_PROFILES.has(profile);
  }

  async resolve(
    user?: GatewayUserAuth,
    _explicit?: { entityType?: string; entityId?: string },
  ): Promise<PublisherAffiliation> {
    if (!user?.id) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const profile = user.profile?.name;
    if (!profile) {
      throw new ForbiddenException('El usuario no tiene perfil asignado');
    }

    if (ADMIN_PROFILES.has(profile)) {
      return this.resolvePlatform();
    }

    if (TEAM_STAFF.has(profile)) {
      return this.resolveTeam(user.id);
    }
    if (NATIONAL_STAFF.has(profile)) {
      return this.resolveNationalTeam(user.id);
    }
    if (LEAGUE_STAFF.has(profile)) {
      return this.resolveLeague(user);
    }

    throw new ForbiddenException(
      'Tu perfil no puede gestionar contenido de un publisher',
    );
  }

  private async resolvePlatform(): Promise<PublisherAffiliation> {
    const publishers = await firstValueFrom(
      this.natsService.send<ContentPublisher[]>('publisher.list', {
        entity_type: 'platform',
      }),
    );

    const list = (Array.isArray(publishers) ? publishers : []).filter(
      (p) => p.entity_type === 'platform' && p.entity_id,
    );

    if (list.length === 0) {
      throw new ForbiddenException(
        'No existe el publisher de League Basket. Créalo en Publishers.',
      );
    }

    const preferred =
      list.find((p) =>
        (p.display_name ?? '').toLowerCase().includes('league basket'),
      ) ?? list[0];

    return {
      entityType: 'platform',
      entityId: preferred.entity_id!,
      displayName: preferred.display_name ?? 'League Basket',
      avatarUrl: preferred.avatar_url ?? '',
      countryCode: 'GLOBAL',
    };
  }

  private async resolveTeam(userId: string): Promise<PublisherAffiliation> {
    const team = await firstValueFrom(
      this.natsService.send<{
        id: string;
        name: string;
        logo?: string | null;
        competitionId?: string;
      } | null>('competition-engine.get-team-by-manager-user', {
        id: userId,
      }),
    );

    if (!team?.id) {
      throw new ForbiddenException('No tienes un equipo asignado');
    }

    return {
      entityType: 'team',
      entityId: team.id,
      displayName: team.name,
      avatarUrl: team.logo ?? '',
      countryCode: await this.countryCodeFromCompetition(team.competitionId),
    };
  }

  private async resolveLeague(
    user: GatewayUserAuth,
  ): Promise<PublisherAffiliation> {
    let competition = await firstValueFrom(
      this.natsService.send<{
        id: string;
        name: string;
        logo?: string | null;
        country?: { countryCode?: string };
      } | null>('get-competition-by-manager-user', {
        id: user.id,
      }),
    );

    if (!competition?.id && user.competitionId) {
      competition = await firstValueFrom(
        this.natsService.send<{
          id: string;
          name: string;
          logo?: string | null;
          country?: { countryCode?: string };
        } | null>('get-competition', { id: user.competitionId }),
      );
    }

    if (!competition?.id) {
      const fullUser = await firstValueFrom(
        this.natsService.send<{
          createdById?: string | null;
          competitionId?: string | null;
        }>('auth.get-user-by-id', { id: user.id }),
      );
      if (fullUser?.competitionId) {
        competition = await firstValueFrom(
          this.natsService.send<{
            id: string;
            name: string;
            logo?: string | null;
            country?: { countryCode?: string };
          } | null>('get-competition', { id: fullUser.competitionId }),
        );
      } else if (fullUser?.createdById) {
        competition = await firstValueFrom(
          this.natsService.send<{
            id: string;
            name: string;
            logo?: string | null;
            country?: { countryCode?: string };
          } | null>('get-competition-by-manager-user', {
            id: fullUser.createdById,
          }),
        );
      }
    }

    if (!competition?.id) {
      throw new ForbiddenException('No tienes una liga asignada');
    }

    return {
      entityType: 'league',
      entityId: competition.id,
      displayName: competition.name,
      avatarUrl: competition.logo ?? '',
      countryCode: normalizeCountryCode(competition.country?.countryCode),
    };
  }

  private async resolveNationalTeam(
    userId: string,
  ): Promise<PublisherAffiliation> {
    // Nuevo flujo: selección asignada por managerUserId (admin crea y asigna).
    const nationalTeam =
      (await firstValueFrom(
        this.natsService.send<{
          id: string;
          name: string;
          logo?: string | null;
          countryCode?: string;
        } | null>('national-teams.get-by-manager-user', { id: userId }),
      )) ??
      // Legacy: selección creada por el staff (createdById)
      (await firstValueFrom(
        this.natsService.send<{
          id: string;
          name: string;
          logo?: string | null;
          countryCode?: string;
        } | null>('national-teams.get-by-staff-user', { id: userId }),
      ));

    if (!nationalTeam?.id) {
      throw new ForbiddenException('No tienes una selección asignada');
    }

    return {
      entityType: 'national team',
      entityId: nationalTeam.id,
      displayName: nationalTeam.name,
      avatarUrl: nationalTeam.logo ?? '',
      countryCode: normalizeCountryCode(nationalTeam.countryCode),
    };
  }

  private async countryCodeFromCompetition(
    competitionId?: string,
  ): Promise<string | undefined> {
    if (!competitionId) {
      return undefined;
    }
    try {
      const competition = await firstValueFrom(
        this.natsService.send<{
          country?: { countryCode?: string };
        } | null>('get-competition', { id: competitionId }),
      );
      return normalizeCountryCode(competition?.country?.countryCode);
    } catch {
      return undefined;
    }
  }
}
