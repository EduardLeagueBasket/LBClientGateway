import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from '../../../config/service';

export type GatewayUserAuth = {
  id: string;
  email?: string;
  name?: string;
  lastName?: string;
  profile?: { id: string; name?: string };
  competitionId?: string | null;
};

@Injectable()
export class NatsJwtAuthGuard implements CanActivate {
  constructor(
    @Inject(NATS_SERVICE) private readonly natsService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers?: Record<string, unknown>;
      user?: GatewayUserAuth;
    }>();

    const rawAuth = req.headers?.authorization ?? req.headers?.Authorization;

    if (typeof rawAuth !== 'string' || rawAuth.length === 0) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = rawAuth.split(' ');
    if (scheme !== 'Bearer' || !token?.trim()) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    let user: GatewayUserAuth;
    try {
      user = await firstValueFrom(
        this.natsService.send<GatewayUserAuth, string>(
          'auth.user.authenticate',
          token.trim(),
        ),
      );
    } catch (err: unknown) {
      const rpc = NatsJwtAuthGuard.extractRpcError(err);
      if (rpc?.status === 401) {
        throw new UnauthorizedException(
          rpc.message ?? 'Token inválido o expirado',
        );
      }
      throw new UnauthorizedException(
        'No se pudo validar la sesión. Cierra sesión e inicia de nuevo.',
      );
    }

    if (
      !user ||
      typeof user !== 'object' ||
      !('id' in user) ||
      typeof (user as { id?: unknown }).id !== 'string'
    ) {
      throw new UnauthorizedException(
        'Token inválido o expirado. Cierra sesión e inicia de nuevo.',
      );
    }

    req.user = user;
    return true;
  }

  /** Respuesta de error que envía auth-ms vía NATS (RpcException). */
  private static extractRpcError(
    err: unknown,
  ): { status?: number; message?: string } | null {
    if (!err || typeof err !== 'object') return null;

    const candidates = [
      err,
      (err as { error?: unknown }).error,
      (err as { response?: unknown }).response,
    ];

    for (const c of candidates) {
      if (c && typeof c === 'object') {
        const status = (c as { status?: unknown }).status;
        const message = (c as { message?: unknown }).message;
        if (typeof status === 'number' && typeof message === 'string') {
          return { status, message };
        }
      }
    }

    if (typeof (err as { message?: unknown }).message === 'string') {
      return {
        status: (err as { status?: number }).status,
        message: (err as { message: string }).message,
      };
    }

    return null;
  }
}
