import {
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config/service';
import { ListNationalMatchesQueryDto } from './dto/list-national-matches-query.dto';

@Controller('national-teams')
export class NationalTeamsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get(':nationalTeamId/match')
  findAllMatches(
    @Param('nationalTeamId', ParseUUIDPipe) nationalTeamId: string,
    @Query() query: ListNationalMatchesQueryDto,
  ) {
    return this.natsService.send('national-teams.list-national-matches', {
      nationalTeamId,
      statuses: query.statuses,
      matchDateFromToday: query.matchDateFromToday,
      page: query.page,
      limit: query.limit,
    });
  }
}
