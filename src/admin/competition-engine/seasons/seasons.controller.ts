import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import {
  CreateEngineSeasonDto,
  EnrollSeasonTeamDto,
  SetSeasonTeamsDto,
  UpdateEngineSeasonDto,
} from './dto/create-season.dto';

@Controller('admin/engine/seasons')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE')
export class EngineSeasonsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateEngineSeasonDto) {
    return this.natsService.send('competition-engine.create-season', dto);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
  findByCompetition(@Query('competitionId') competitionId: string) {
    return this.natsService.send(
      'competition-engine.list-seasons-by-competition',
      { competitionId },
    );
  }

  @Get('active')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
  findActive(@Query('competitionId') competitionId: string) {
    return this.natsService.send('competition-engine.get-active-season', {
      competitionId,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.get-season', {
      id: params.id,
    });
  }

  @Patch(':id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateEngineSeasonDto) {
    return this.natsService.send('competition-engine.update-season', {
      id: params.id,
      data: dto,
    });
  }

  @Post(':id/activate')
  activate(
    @Param() params: IdParamDto,
    @Query('competitionId') competitionId: string,
  ) {
    return this.natsService.send('competition-engine.set-active-season', {
      id: params.id,
      competitionId,
    });
  }

  @Post(':id/complete')
  complete(
    @Param() params: IdParamDto,
    @Query('competitionId') competitionId: string,
  ) {
    return this.natsService.send('competition-engine.complete-season', {
      id: params.id,
      competitionId,
    });
  }

  @Get(':id/teams')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
  listTeams(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.list-season-teams', {
      seasonId: params.id,
    });
  }

  @Put(':id/teams')
  setTeams(@Param() params: IdParamDto, @Body() dto: SetSeasonTeamsDto) {
    return this.natsService.send('competition-engine.set-season-teams', {
      seasonId: params.id,
      teamIds: dto.teamIds,
    });
  }

  @Post(':id/teams')
  enrollTeam(@Param() params: IdParamDto, @Body() dto: EnrollSeasonTeamDto) {
    return this.natsService.send('competition-engine.enroll-season-team', {
      seasonId: params.id,
      teamId: dto.teamId,
      groupId: dto.groupId,
    });
  }

  @Delete(':id/teams/:teamId')
  removeTeam(@Param() params: IdParamDto, @Param('teamId') teamId: string) {
    return this.natsService.send('competition-engine.remove-season-team', {
      seasonId: params.id,
      teamId,
    });
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  delete(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.delete-season', {
      id: params.id,
    });
  }
}
