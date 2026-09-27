import { Controller, Get, Inject, Param } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IdParamDto } from 'src/admin/competition-engine/shared/dto/id.param';
import { NATS_SERVICE } from 'src/config/service';

@Controller('teams')
export class TeamsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('competition-engine.get-team', {
      id: params.id,
    });
  }
}
