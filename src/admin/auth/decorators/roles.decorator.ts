import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'allowedProfileNames';

/**
 * Perfiles permitidos (`user.profile.name` del JWT).
 * Usar junto a `AdminRolesGuard` en rutas `/api/admin/*`.
 */
export const Roles = (...profileNames: string[]) =>
  SetMetadata(ROLES_KEY, profileNames);
