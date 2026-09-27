import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../config/service';
import {
  MobileListFavoriteTeamsQueryDto,
  MobileSetFavoriteTeamDto,
} from './dto/customer-auth.dto';

@Controller('mobile/favorite-teams')
export class CustomerAuthFavoriteTeamsController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  list(@Query() query: MobileListFavoriteTeamsQueryDto) {
    return this.natsService.send('customer-auth.favorite-team.list', query);
  }

  @Post()
  set(@Body() dto: MobileSetFavoriteTeamDto) {
    return this.natsService.send('customer-auth.favorite-team.set', dto);
  }

  @Delete()
  remove(@Query() query: MobileSetFavoriteTeamDto) {
    return this.natsService.send('customer-auth.favorite-team.remove', {
      deviceId: query.deviceId,
      teamId: query.teamId,
    });
  }
}
