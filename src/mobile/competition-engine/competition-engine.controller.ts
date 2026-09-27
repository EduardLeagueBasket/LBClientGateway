import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';

@Controller('')
export class CompetitionEngineController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get('competition/:competitionId/teams')
  findAllByCompetition(@Param('competitionId') competitionId: string) {
    return this.natsService.send(
      'competition-engine.mobile.list-teams-by-competition',
      {
        id: competitionId,
      },
    );
  }

  @Get('competition/:competitionId/standings')
  findStandings(
    @Param('competitionId') competitionId: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.natsService.send(
      'competition-engine.mobile.list-standings-by-competition',
      { competitionId, seasonId },
    );
  }
}
