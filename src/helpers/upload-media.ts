import {
  BadGatewayException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'node:stream';

@Injectable()
export class UploadMedia {
  private readonly logger = new Logger(UploadMedia.name);

  constructor() {
    cloudinary.config({
      cloud_name: 'dbatojumk',
      api_key: '842841348412942',
      api_secret: 'GrsNtzbRUb-HKwNu_s33iUtdzRA',
    });
  }

  async uploadImage(
    file: { buffer: Buffer; mimetype?: string },
    folder: string,
    resourceType: 'image' | 'video' | 'auto' = 'image',
  ): Promise<UploadApiResponse> {
    if (!file?.buffer?.length) {
      throw new BadGatewayException('Archivo vacío o no recibido');
    }

    const resolvedType =
      resourceType === 'auto'
        ? this.inferResourceType(file.mimetype)
        : resourceType;

    try {
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { resource_type: resolvedType, folder },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            if (!result) {
              return reject(new Error('Cloudinary returned no result'));
            }
            resolve(result);
          },
        );

        Readable.from([file.buffer]).pipe(upload);
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Error al subir archivo a Cloudinary';
      this.logger.error(`Cloudinary upload failed (${folder}): ${message}`);
      throw new BadGatewayException(
        `No se pudo subir el archivo: ${message}`,
      );
    }
  }

  private inferResourceType(
    mimetype?: string,
  ): 'image' | 'video' | 'auto' {
    if (!mimetype) return 'auto';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('image/')) return 'image';
    return 'auto';
  }
}
