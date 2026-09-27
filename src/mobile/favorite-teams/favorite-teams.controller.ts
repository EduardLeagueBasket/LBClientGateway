import { Controller } from '@nestjs/common';
import { FavoriteTeamsService } from './favorite-teams.service';

@Controller('favorite-teams')
export class FavoriteTeamsController {
  constructor(private readonly favoriteTeamsService: FavoriteTeamsService) {}
}
