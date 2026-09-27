import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { GatewayUserAuth } from './nats-jwt-auth.guard';

/** Perfiles que pueden usar el backoffice (alineados con auth-ms `LIST_PROFILES`; sin USER). */
export const DEFAULT_BACKOFFICE_PROFILES = [
  'ADMIN',
  'SUPER_ADMIN',
  'MANAGER_LEAGUE',
  'MANAGER_TEAM',
  'PLAYER',
  'ASISTANT_TEAM',
  'ASISTANT_LEAGUE',
  'COACH',
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
] as const;

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const allowed =
      required?.length > 0 ? required : [...DEFAULT_BACKOFFICE_PROFILES];

    const req = context.switchToHttp().getRequest<{ user?: GatewayUserAuth }>();
    const profileName = req.user?.profile?.name;

    if (!profileName || !allowed.includes(profileName)) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a esta operación de administración',
      );
    }
    return true;
  }
}
