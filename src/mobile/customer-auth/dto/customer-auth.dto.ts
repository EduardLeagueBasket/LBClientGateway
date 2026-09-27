import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class MobileRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class MobileLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class MobileVerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class MobileRegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  installationId: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  pushToken?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}

export class MobileLinkDeviceDto {
  @IsString()
  @IsNotEmpty()
  installationId: string;

  @IsString()
  @IsNotEmpty()
  customerId: string;
}

export class MobileSetFavoriteTeamDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsString()
  @IsNotEmpty()
  teamId: string;

  @IsOptional()
  @IsString()
  competitionId?: string;
}

export class MobileListFavoriteTeamsQueryDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
