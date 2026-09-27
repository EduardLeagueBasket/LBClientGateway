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
import { IdParamDto } from '../shared/dto/id.param';
import { CreateEngineGroupDto } from './dto/create-group.dto';
import { UpdateEngineGroupDto } from './dto/update-group.dto';

@Controller('admin/engine/groups')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class EngineGroupsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  create(@Body() dto: CreateEngineGroupDto) {
    return this.natsService.send('competition-engine.create-group', dto);
  }

  @Get()
  findAll() {
    return this.natsService.send('competition-engine.list-groups', {});
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.get-group', {
      id: params.id,
    });
  }

  @Patch(':id')
  update(@Param() params: IdParamDto, @Body() dto: UpdateEngineGroupDto) {
    return this.natsService.send('competition-engine.update-group', {
      id: params.id,
      data: dto,
    });
  }

  @Delete(':id')
  delete(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.delete-group', {
      id: params.id,
    });
  }
}
