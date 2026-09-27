import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import type { GatewayUserAuth } from '../../auth/guards/nats-jwt-auth.guard';

type CompetitionRow = { id?: string; managerUserId?: string | null };

@Injectable()
export class LeagueScopeService {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  isLeagueStaff(profile?: string): boolean {
    return profile === 'MANAGER_LEAGUE' || profile === 'ASISTANT_LEAGUE';
  }

  async resolveCompetitionId(
    user?: GatewayUserAuth,
  ): Promise<string | undefined> {
    if (user?.competitionId) {
      return user.competitionId;
    }

    const profile = user?.profile?.name;
    if (profile === 'MANAGER_LEAGUE' && user?.id) {
      const competition = await firstValueFrom(
        this.natsService.send<CompetitionRow | null>(
          'get-competition-by-manager-user',
          { id: user.id },
        ),
      );
      return competition?.id;
    }

    if (profile === 'ASISTANT_LEAGUE' && user?.id) {
      const fullUser = await firstValueFrom(
        this.natsService.send<{
          competitionId?: string | null;
          createdById?: string | null;
        }>('auth.get-user-by-id', { id: user.id }),
      );
      if (fullUser?.competitionId) {
        return fullUser.competitionId;
      }
      if (fullUser?.createdById) {
        const competition = await firstValueFrom(
          this.natsService.send<CompetitionRow | null>(
            'get-competition-by-manager-user',
            { id: fullUser.createdById },
          ),
        );
        return competition?.id;
      }
    }

    return undefined;
  }

  async setUserCompetition(userId: string, competitionId: string | null) {
    if (!userId) {
      return;
    }
    await firstValueFrom(
      this.natsService.send('auth.set-user-competition', {
        id: userId,
        competitionId,
      }),
    );
  }
}
