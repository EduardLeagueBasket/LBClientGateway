import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../../../config/service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UploadMedia } from '../../../helpers/upload-media';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';

@Controller('admin')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class SportsCatalogController {
  constructor(
    private readonly uploadMedia: UploadMedia,
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Get('countries')
  @Roles(
    'ADMIN',
    'SUPER_ADMIN',
    'MANAGER_NATIONAL_TEAM',
    'ASISTANT_NATIONAL_TEAM',
    'MANAGER_REGIONAL_TEAM',
    'ASISTANT_REGIONAL_TEAM',
  )
  getSportsCatalog() {
    return this.natsService.send<any>('get-all-countries', {});
  }

  @Post('countries')
  @UseInterceptors(FileInterceptor('file'))
  async createCountry(
    @Req() req: { user?: { id?: string } },
    @Body() createCountryDto: CreateCountryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const uploadResult = await this.uploadMedia.uploadImage(file, 'countries');
    createCountryDto.logo = uploadResult.secure_url;
    createCountryDto.createdById = req.user?.id;
    return this.natsService.send<any>('create-country', createCountryDto);
  }
}
