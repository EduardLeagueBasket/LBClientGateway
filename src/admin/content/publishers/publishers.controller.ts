import {
  BadGatewayException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
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
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { CreatePlatformPublisherDto } from './dto/create-publisher.dto';

@Controller('admin/content/publishers')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class PublishersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
    private readonly uploadMedia: UploadMedia,
  ) {}

  @Get()
  async list(@Query('entityType') entityType?: string) {
    try {
      return await firstValueFrom(
        this.natsService.send('publisher.list', {
          entity_type: entityType?.trim() || '',
        }),
      );
    } catch (err: unknown) {
      throw new BadGatewayException(this.errorMessage(err, 'No se pudieron listar publishers'));
    }
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreatePlatformPublisherDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let avatarUrl = dto.avatarUrl?.trim() || '';

    if (file?.buffer?.length) {
      const uploadResult = await this.uploadMedia.uploadImage(
        file,
        'publishers',
        'image',
      );
      avatarUrl = uploadResult.secure_url;
    }

    try {
      return await firstValueFrom(
        this.natsService.send('publisher.create', {
          display_name: dto.displayName.trim(),
          avatar_url: avatarUrl,
          is_verified: dto.isVerified ?? true,
        }),
      );
    } catch (err: unknown) {
      throw new BadGatewayException(
        this.errorMessage(err, 'No se pudo crear el publisher'),
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
