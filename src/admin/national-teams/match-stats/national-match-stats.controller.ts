import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { CreateNationalMatchStatsDto } from './dto/create-national-match-stats.dto';
import { UpdateNationalMatchStatsDto } from './dto/update-national-match-stats.dto';

type MatchIdParam = { matchId: string };
type UpdatePayload = { matchId: string; data: UpdateNationalMatchStatsDto };

@Controller('admin/national-teams/match-stats')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class GatewayNationalMatchStatsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get(':matchId')
  findByMatchId(@Param() params: MatchIdParam) {
    return this.natsService.send('national-teams.get-national-match-stats', {
      matchId: params.matchId,
    });
  }

  @Post()
  create(@Body() dto: CreateNationalMatchStatsDto) {
    return this.natsService.send(
      'national-teams.create-national-match-stats',
      dto,
    );
  }

  @Patch(':matchId')
  update(
    @Param() params: MatchIdParam,
    @Body() dto: UpdateNationalMatchStatsDto,
  ) {
    const payload: UpdatePayload = { matchId: params.matchId, data: dto };
    return this.natsService.send(
      'national-teams.update-national-match-stats',
      payload,
    );
  }

  @Delete(':matchId')
  delete(@Param() params: MatchIdParam) {
    return this.natsService.send('national-teams.delete-national-match-stats', {
      matchId: params.matchId,
    });
  }
}
