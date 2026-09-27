import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';

type ArticlePayload = Record<string, unknown>;

@Controller('app/content/articles')
export class MobileArticlesController {
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

    const articles = await firstValueFrom(
      this.natsService.send<ArticlePayload[]>('articles.feed-by-country', {
        country_code: code,
      }),
    );

    return {
      countryCode: code,
      articles: Array.isArray(articles) ? articles : [],
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.natsService.send<ArticlePayload>('articles.get', { id }),
      );
    } catch {
      throw new NotFoundException('Artículo no encontrado');
    }
  }
}
