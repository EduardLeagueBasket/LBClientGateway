import { Module } from '@nestjs/common';
import { FavoriteTeamsService } from './favorite-teams.service';
import { FavoriteTeamsController } from './favorite-teams.controller';

@Module({
  controllers: [FavoriteTeamsController],
  providers: [FavoriteTeamsService],
})
export class FavoriteTeamsModule {}
