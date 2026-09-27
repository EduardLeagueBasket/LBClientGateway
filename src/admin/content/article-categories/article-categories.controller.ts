import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { CONTENT_ROLES } from '../content-roles';
import { CreateArticleCategoryDto } from './dto/create-article-category.dto';

@Controller('admin/content/article-categories')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
export class ArticleCategoriesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get()
  @Roles(...CONTENT_ROLES)
  async list() {
    try {
      return await firstValueFrom(
        this.natsService.send('article-category.list', {}),
      );
    } catch (err: unknown) {
      throw new BadGatewayException(
        this.errorMessage(err, 'No se pudieron listar las categorías'),
      );
    }
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateArticleCategoryDto) {
    try {
      return await firstValueFrom(
        this.natsService.send('article-category.create', {
          name: dto.name.trim(),
          slug: dto.slug?.trim() || '',
        }),
      );
    } catch (err: unknown) {
      throw new BadGatewayException(
        this.errorMessage(err, 'No se pudo crear la categoría'),
      );
    }
  }

  private errorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    return fallback;
  }
}
