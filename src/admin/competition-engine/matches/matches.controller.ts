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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import { BulkCreateEngineMatchesDto } from './dto/bulk-create-matches.dto';
import { CreateEngineMatchDto } from './dto/create-match.dto';
import { UpdateEngineMatchDto } from './dto/update-match.dto';

@Controller('admin/engine/matches')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MANAGER_LEAGUE', 'ASISTANT_LEAGUE')
export class EngineMatchesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  create(
    @Req() req: { user?: { id?: string } },
    @Body() dto: CreateEngineMatchDto,
  ) {
    return this.natsService.send('competition-engine.create-match', {
      ...dto,
      createdById: req.user?.id,
    });
  }

  @Post('bulk')
  bulkCreate(
    @Req() req: { user?: { id?: string } },
    @Body() dto: BulkCreateEngineMatchesDto,
  ) {
    return this.natsService.send('competition-engine.bulk-create-matches', {
      ...dto,
      createdById: req.user?.id,
    });
  }

  @Get()
  findAll(
    @Query('competitionId') competitionId?: string,
    @Query('seasonId') seasonId?: string,
  ) {
    return this.natsService.send('competition-engine.find-matches', {
      competitionId,
      seasonId,
      page: 1,
      limit: 500,
    });
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.get-match', {
      id: params.id,
    });
  }

  @Patch(':id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateEngineMatchDto) {
    return this.natsService.send('competition-engine.update-match', {
      id: params.id,
      data: dto,
    });
  }

  @Delete(':id')
  delete(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.delete-match', {
      id: params.id,
    });
  }
}
