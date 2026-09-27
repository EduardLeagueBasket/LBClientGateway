import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadMedia } from '../helpers/upload-media';
import { Roles } from '../admin/auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../admin/auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../admin/auth/guards/nats-jwt-auth.guard';

const SAFE_FOLDER = /^[a-zA-Z0-9_-]+$/;

@Controller('admin/upload')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles(
  'ADMIN',
  'SUPER_ADMIN',
  'MANAGER_TEAM',
  'ASISTANT_TEAM',
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
  'MANAGER_LEAGUE',
  'ASISTANT_LEAGUE',
)
export class UploadController {
  constructor(private readonly uploadMedia: UploadMedia) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Query('folder') folder: string | undefined,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ url: string }> {
    if (!file?.buffer?.length) {
      throw new BadRequestException(
        'Se requiere el archivo en el campo "file"',
      );
    }
    const targetFolder =
      folder && SAFE_FOLDER.test(folder) ? folder : 'uploads';
    const result = await this.uploadMedia.uploadImage(file, targetFolder);
    return { url: result.secure_url };
  }
}
