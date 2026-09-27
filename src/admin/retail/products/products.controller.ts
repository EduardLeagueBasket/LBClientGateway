import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FilesInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NATS_SERVICE } from '../../../config/service';
import { UploadMedia } from '../../../helpers/upload-media';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminRolesGuard } from '../../auth/guards/admin-roles.guard';
import { NatsJwtAuthGuard } from '../../auth/guards/nats-jwt-auth.guard';
import { IdParamDto } from '../shared/dto/id.param';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductFormDto } from './dto/create-product-form.dto';
import { ListProductsQuery } from './dto/list-products.query';
import { UpdateProductDto } from './dto/update-product.dto';

type ImagenMetaItem = {
  principal?: boolean;
  existingUrl?: string;
};

@Controller('admin/retail/products')
@UseGuards(NatsJwtAuthGuard, AdminRolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class ProductsController {
  constructor(
    private readonly uploadMedia: UploadMedia,
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 20))
  async create(
    @Req() req: { user?: { id?: string }; body: unknown },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const dto = await this.resolveCreateDto(req.body, files);
    return this.natsService.send('retail.create-product', {
      ...dto,
      creadoPorId: req.user?.id,
    });
  }

  @Get()
  findAll(@Query() query: ListProductsQuery) {
    return this.natsService.send('retail.list-products', query);
  }

  @Get(':id')
  findById(@Param() params: IdParamDto) {
    return this.natsService.send('retail.get-product', { id: params.id });
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 20))
  async update(
    @Param() params: IdParamDto,
    @Req() req: { body: unknown },
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const dto = await this.resolveUpdateDto(req.body, files);
    return this.natsService.send('retail.update-product', {
      id: params.id,
      data: dto,
    });
  }

  @Delete(':id')
  deactivate(@Param() params: IdParamDto) {
    return this.natsService.send('retail.deactivate-product', {
      id: params.id,
    });
  }

  private isFormBody(body: unknown): body is CreateProductFormDto {
    return (
      typeof body === 'object' &&
      body !== null &&
      typeof (body as CreateProductFormDto).variantes === 'string'
    );
  }

  private async resolveCreateDto(
    body: unknown,
    files?: Express.Multer.File[],
  ): Promise<CreateProductDto> {
    if (this.isFormBody(body)) {
      const formDto = plainToInstance(CreateProductFormDto, body);
      await this.assertValid(formDto);

      const imagenesMeta = this.parseJsonArray<ImagenMetaItem>(
        formDto.imagenesMeta,
        'imagenesMeta',
      );
      const imagenes = await this.resolveImagenes(imagenesMeta, files);

      const dto = plainToInstance(CreateProductDto, {
        teamId: formDto.teamId,
        teamType: formDto.teamType,
        nombre: formDto.nombre,
        slug: formDto.slug,
        categoria: formDto.categoria,
        descripcion: formDto.descripcion,
        marca: formDto.marca,
        variantes: this.parseJsonArray(formDto.variantes, 'variantes'),
        tags: formDto.tags
          ? this.parseJsonArray<string>(formDto.tags, 'tags')
          : undefined,
        imagenes,
      });
      await this.assertValid(dto);
      return dto;
    }

    const dto = plainToInstance(CreateProductDto, body);
    await this.assertValid(dto);
    return dto;
  }

  private async resolveUpdateDto(
    body: unknown,
    files?: Express.Multer.File[],
  ): Promise<UpdateProductDto> {
    if (this.isFormBody(body)) {
      const formDto = plainToInstance(CreateProductFormDto, body);
      await this.assertValid(formDto);

      const imagenesMeta = this.parseJsonArray<ImagenMetaItem>(
        formDto.imagenesMeta,
        'imagenesMeta',
      );
      const imagenes = await this.resolveImagenes(imagenesMeta, files);

      const dto = plainToInstance(UpdateProductDto, {
        teamId: formDto.teamId,
        teamType: formDto.teamType,
        nombre: formDto.nombre,
        slug: formDto.slug,
        categoria: formDto.categoria,
        descripcion: formDto.descripcion,
        marca: formDto.marca,
        variantes: this.parseJsonArray(formDto.variantes, 'variantes'),
        tags: formDto.tags
          ? this.parseJsonArray<string>(formDto.tags, 'tags')
          : undefined,
        imagenes,
      });
      await this.assertValid(dto);
      return dto;
    }

    const dto = plainToInstance(UpdateProductDto, body);
    await this.assertValid(dto);
    return dto;
  }

  private parseJsonArray<T>(value: string | undefined, field: string): T[] {
    if (!value?.trim()) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new Error('not array');
      }
      return parsed as T[];
    } catch {
      throw new BadRequestException(`Campo ${field} inválido`);
    }
  }

  private async resolveImagenes(
    meta: ImagenMetaItem[],
    files?: Express.Multer.File[],
  ): Promise<{ url: string; principal?: boolean }[]> {
    if (!meta.length) {
      return [];
    }

    const imagenes: { url: string; principal?: boolean }[] = [];
    let fileIndex = 0;

    for (const item of meta) {
      const existingUrl =
        typeof item.existingUrl === 'string' ? item.existingUrl.trim() : '';
      if (existingUrl) {
        imagenes.push({
          url: existingUrl,
          principal: item.principal,
        });
        continue;
      }

      const file = files?.[fileIndex];
      if (!file) {
        throw new BadRequestException(
          'Faltan archivos de imagen en la solicitud',
        );
      }
      fileIndex += 1;
      const uploadResult = await this.uploadMedia.uploadImage(
        file,
        'product-images',
      );
      imagenes.push({
        url: uploadResult.secure_url,
        principal: item.principal,
      });
    }

    if (fileIndex !== (files?.length ?? 0)) {
      throw new BadRequestException(
        'Cantidad de archivos no coincide con las imágenes nuevas',
      );
    }

    return imagenes;
  }

  private async assertValid(dto: object): Promise<void> {
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }
}
