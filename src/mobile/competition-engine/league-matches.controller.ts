import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import { MobileListLeagueMatchesQueryDto } from './dto/list-league-matches-query.dto';

@Controller('')
export class LeagueMatchesMobileController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get('competition/:competitionId/matches')
  findByCompetition(
    @Param('competitionId') competitionId: string,
    @Query() query: MobileListLeagueMatchesQueryDto,
  ) {
    return this.natsService.send(
      'competition-engine.mobile.list-matches-by-competition',
      {
        competitionId,
        statuses: query.statuses,
        matchTypes: query.matchTypes,
        seasonId: query.seasonId,
        matchDateFromToday: query.matchDateFromToday,
        page: query.page,
        limit: query.limit,
      },
    );
  }

  @Get('teams/:teamId/matches')
  findByTeam(
    @Param('teamId') teamId: string,
    @Query() query: MobileListLeagueMatchesQueryDto,
  ) {
    return this.natsService.send(
      'competition-engine.mobile.list-matches-by-team',
      {
        teamId,
        statuses: query.statuses,
        matchTypes: query.matchTypes,
        seasonId: query.seasonId,
        matchDateFromToday: query.matchDateFromToday,
        page: query.page,
        limit: query.limit,
      },
    );
  }
}
