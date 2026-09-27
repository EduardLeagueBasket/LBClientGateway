import {
  BadGatewayException,
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { UploadMedia } from '../../../helpers/upload-media';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import {
  GatewayUserAuth,
  NatsJwtAuthGuard,
} from '../../auth/guards/nats-jwt-auth.guard';
import { CONTENT_ROLES } from '../content-roles';
import { PublisherAffiliationService } from '../stories/publisher-affiliation.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('admin/content/articles')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles(...CONTENT_ROLES)
export class ArticlesController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
    private readonly affiliationService: PublisherAffiliationService,
    private readonly uploadMedia: UploadMedia,
  ) {}

  @Get()
  async listMine(
    @Req() req: { user?: GatewayUserAuth },
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    const affiliation = await this.affiliationService.resolve(req.user, {
      entityType,
      entityId,
    });

    try {
      const articles = await firstValueFrom(
        this.natsService.send('articles.list-by-entity', {
          entity_type: affiliation.entityType,
          entity_id: affiliation.entityId,
        }),
      );

      return {
        publisher: {
          entity_type: affiliation.entityType,
          entity_id: affiliation.entityId,
          display_name: affiliation.displayName,
          avatar_url: affiliation.avatarUrl,
          country_code: affiliation.countryCode ?? null,
        },
        articles: Array.isArray(articles) ? articles : [],
      };
    } catch (err: unknown) {
      throw new BadGatewayException(
        this.errorMessage(err, 'No se pudieron listar los artículos'),
      );
    }
  }

  @Get('feed')
  async feedByCountry(@Query('countryCode') countryCode?: string) {
    const code = countryCode?.trim().toUpperCase();
    if (!code) {
      throw new BadRequestException(
        'Query countryCode es obligatorio (ej. CO, PA, VE)',
      );
    }

    try {
      const articles = await firstValueFrom(
        this.natsService.send('articles.feed-by-country', {
          country_code: code,
        }),
      );

      return {
        countryCode: code,
        articles: Array.isArray(articles) ? articles : [],
      };
    } catch (err: unknown) {
      throw new BadGatewayException(
        this.errorMessage(err, 'No se pudo cargar el feed de artículos'),
      );
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.natsService.send('articles.get', { id }),
      );
    } catch {
      throw new NotFoundException('Artículo no encontrado');
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Req() req: { user?: GatewayUserAuth },
    @Body() dto: CreateArticleDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let coverImageUrl = dto.coverImageUrl?.trim() || '';
    let cloudinaryPublicId = '';

    if (file?.buffer?.length) {
      const uploadResult = await this.uploadMedia.uploadImage(
        file,
        'articles',
        'image',
      );
      coverImageUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id ?? '';
    }

    const affiliation = await this.affiliationService.resolve(req.user, {
      entityType: dto.entityType,
      entityId: dto.entityId,
    });
    const createdBy = req.user!.id;
    const nameCreatedBy = [req.user?.name, req.user?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
    const affiliationCountry =
      affiliation.countryCode?.trim().toUpperCase() || 'GLOBAL';
    const isPlatform = affiliation.entityType === 'platform';

    try {
      await firstValueFrom(
        this.natsService.send('articles.create', {
          entity_type: affiliation.entityType,
          entity_id: affiliation.entityId,
          display_name: affiliation.displayName,
          avatar_url: affiliation.avatarUrl,
          is_verified: true,
          publisher_country_code: isPlatform ? 'GLOBAL' : affiliationCountry,
          target_country_code: isPlatform
            ? dto.targetCountryCode?.trim().toUpperCase() || 'GLOBAL'
            : affiliationCountry,
          category_id: dto.categoryId.trim(),
          title: dto.title.trim(),
          summary: dto.summary?.trim() || '',
          content: dto.content.trim(),
          cover_image_url: coverImageUrl,
          cloudinary_public_id: cloudinaryPublicId,
          is_featured: dto.isFeatured ?? false,
          created_by: createdBy,
          name_created_by: nameCreatedBy || 'Usuario',
        }),
      );
    } catch (err: unknown) {
      throw new BadGatewayException(
        this.errorMessage(err, 'No se pudo crear el artículo'),
      );
    }

    return {
      message: 'Artículo creado',
      coverImageUrl,
      publisher: {
        entity_type: affiliation.entityType,
        entity_id: affiliation.entityId,
        display_name: affiliation.displayName,
      },
    };
  }

  @Delete(':id')
  async remove(
    @Req() req: { user?: GatewayUserAuth },
    @Param('id') id: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    const affiliation = await this.affiliationService.resolve(req.user, {
      entityType,
      entityId,
    });

    try {
      await firstValueFrom(
        this.natsService.send('articles.delete', {
          id,
          entity_type: affiliation.entityType,
          entity_id: affiliation.entityId,
        }),
      );
    } catch {
      throw new NotFoundException(
        'Artículo no encontrado o no pertenece a tu publisher',
      );
    }

    return { message: 'Artículo eliminado', id };
  }

  private errorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    return fallback;
  }
}
