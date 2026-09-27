import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { MulterFile } from '../../../../types/multer-file';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  countryName?: string;

  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  @IsOptional()
  file?: MulterFile;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  createdById?: string;

  //@IsString()
  //region: string;

  //@IsNumber()
  //order: number;

  //@IsBoolean()
  //isActive: boolean;
}
