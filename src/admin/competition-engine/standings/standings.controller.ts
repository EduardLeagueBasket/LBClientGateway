import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import { CreateEngineStandingDto } from './dto/create-standing.dto';
import { RecalculateStandingsDto } from './dto/recalculate-standings.dto';
import { UpdateEngineStandingDto } from './dto/update-standing.dto';

@Controller('admin/engine/standings')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
export class EngineStandingsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE')
  create(@Body() dto: CreateEngineStandingDto) {
    return this.natsService.send('competition-engine.create-standing', dto);
  }

  @Post('recalculate')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE')
  recalculate(@Body() dto: RecalculateStandingsDto) {
    return this.natsService.send('competition-engine.recalculate-standings', dto);
  }

  @Get()
  findAll(
    @Query('competitionId') competitionId?: string,
    @Query('seasonId') seasonId?: string,
  ) {
    if (competitionId) {
      return this.natsService.send(
        'competition-engine.list-standings-by-competition',
        { competitionId, seasonId },
      );
    }
    return this.natsService.send('competition-engine.list-standings', {});
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.get-standing', {
      id: params.id,
    });
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE')
  update(@Param() params: IdParamDto, @Body() dto: UpdateEngineStandingDto) {
    return this.natsService.send('competition-engine.update-standing', {
      id: params.id,
      data: dto,
    });
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  delete(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.delete-standing', {
      id: params.id,
    });
  }
}
