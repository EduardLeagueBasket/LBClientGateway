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
import { CreateStoryDto } from './dto/create-story.dto';
import { PublisherAffiliationService } from './publisher-affiliation.service';

const STORY_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER_TEAM',
  'ASISTANT_TEAM',
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
  'MANAGER_LEAGUE',
  'ASISTANT_LEAGUE',
] as const;

type StoriesFeed = {
  publisher_id?: string;
  entity_type?: string;
  entity_id?: string;
  display_name?: string;
  avatar_url?: string;
  stories?: Array<Record<string, unknown>>;
};

@Controller('admin/content/stories')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles(...STORY_ROLES)
export class StoriesController {
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

    const feed = await firstValueFrom(
      this.natsService.send<StoriesFeed>('stories.list-by-entity', {
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
        publisher_id: feed?.publisher_id ?? null,
      },
      stories: feed?.stories ?? [],
    };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async create(
    @Req() req: { user?: GatewayUserAuth },
    @Body() dto: CreateStoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let mediaUrl = dto.mediaUrl?.trim() || '';

    if (file?.buffer?.length) {
      const resourceType = dto.mediaType === 'video' ? 'video' : 'auto';
      const uploadResult = await this.uploadMedia.uploadImage(
        file,
        'stories',
        resourceType,
      );
      mediaUrl = uploadResult.secure_url;
    }

    if (!mediaUrl) {
      throw new BadRequestException(
        'Se requiere el archivo en el campo "file" o una mediaUrl',
      );
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
        this.natsService.send('stories.create', {
          entity_type: affiliation.entityType,
          entity_id: affiliation.entityId,
          display_name: affiliation.displayName,
          avatar_url: affiliation.avatarUrl,
          is_verified: true,
          media_type: dto.mediaType,
          media_url: mediaUrl,
          created_by: createdBy,
          name_created_by: nameCreatedBy || 'Usuario',
          target_country_code: isPlatform
            ? dto.targetCountryCode?.trim().toUpperCase() || 'GLOBAL'
            : affiliationCountry,
          publisher_country_code: isPlatform ? 'GLOBAL' : affiliationCountry,
        }),
      );
    } catch (err: unknown) {
      const message =
        typeof err === 'string'
          ? err
          : err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : 'Error al crear la story en content-ms';
      throw new BadGatewayException(message);
    }

    return {
      message: 'Story creada',
      mediaUrl,
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
        this.natsService.send('stories.delete', {
          id,
          entity_type: affiliation.entityType,
          entity_id: affiliation.entityId,
        }),
      );
    } catch {
      throw new NotFoundException(
        'Historia no encontrada o no pertenece a tu publisher',
      );
    }

    return { message: 'Story eliminada', id };
  }
}
