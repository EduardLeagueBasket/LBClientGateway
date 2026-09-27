import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';

/**
 * Feed de stories para la app móvil.
 * El usuario elige un país y recibe:
 * - stories de equipos / selecciones / ligas de ese país
 * - stories de League Basket (platform) globales o dirigidas a ese país
 */
@Controller('app/content/stories')
export class MobileStoriesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  async feedByCountry(@Query('countryCode') countryCode?: string) {
    const code = countryCode?.trim().toUpperCase();
    if (!code) {
      throw new BadRequestException(
        'Query countryCode es obligatorio (ej. CO, PA, VE)',
      );
    }

    const publishers: Array<{ stories?: unknown[] }> = await firstValueFrom(
      this.natsService.send('stories.feed-by-country', {
        country_code: code,
      }),
    );

    // Solo publishers que tengan al menos una story activa.
    const withStories = (Array.isArray(publishers) ? publishers : []).filter(
      (p) => Array.isArray(p?.stories) && p.stories.length > 0,
    );

    return {
      countryCode: code,
      publishers: withStories,
    };
  }
}
