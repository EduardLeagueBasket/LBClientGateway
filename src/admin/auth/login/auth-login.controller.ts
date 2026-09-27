import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';
import { LoginDto } from './dto/login.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Controller('auth')
export class AuthLoginController {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await firstValueFrom(this.natsService.send('auth.login', dto));
    } catch (error) {
      const message = this.extractRpcMessage(error);
      if (
        typeof message === 'string' &&
        /invalid credentials/i.test(message)
      ) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      throw new UnauthorizedException(
        message || 'No se pudo iniciar sesión',
      );
    }
  }

  @Post('verify')
  async verify(@Body() dto: VerifyTokenDto) {
    try {
      return await firstValueFrom(
        this.natsService.send('auth.user.authenticate', dto.token),
      );
    } catch (error) {
      const message = this.extractRpcMessage(error);
      throw new UnauthorizedException(message || 'Token inválido');
    }
  }

  private extractRpcMessage(error: unknown): string | undefined {
    if (!error || typeof error !== 'object') return undefined;
    const err = error as {
      message?: string | string[];
      status?: string;
    };
    if (typeof err.message === 'string') return err.message;
    if (Array.isArray(err.message)) return err.message.join(', ');
    return undefined;
  }
}
