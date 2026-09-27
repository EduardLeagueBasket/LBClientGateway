import { ForbiddenException } from '@nestjs/common';

const ADMIN_PROFILES = new Set(['ADMIN', 'SUPER_ADMIN']);

const ALLOWED_PROFILE_BY_MANAGER: Record<string, string> = {
  MANAGER_LEAGUE: 'ASISTANT_LEAGUE',
  MANAGER_TEAM: 'ASISTANT_TEAM',
  MANAGER_NATIONAL_TEAM: 'ASISTANT_NATIONAL_TEAM',
  MANAGER_REGIONAL_TEAM: 'ASISTANT_REGIONAL_TEAM',
};

export function filterCreatableProfiles<T extends { name?: string }>(
  actorProfile: string | undefined,
  profiles: T[],
): T[] {
  if (actorProfile && ADMIN_PROFILES.has(actorProfile)) {
    return profiles;
  }

  const allowedProfile = actorProfile
    ? ALLOWED_PROFILE_BY_MANAGER[actorProfile]
    : undefined;

  return allowedProfile
    ? profiles.filter((profile) => profile.name === allowedProfile)
    : [];
}

export function assertCanAssignProfile(
  actorProfile: string | undefined,
  targetProfile: string,
): void {
  if (actorProfile && ADMIN_PROFILES.has(actorProfile)) {
    return;
  }

  const allowedProfile = actorProfile
    ? ALLOWED_PROFILE_BY_MANAGER[actorProfile]
    : undefined;

  if (!allowedProfile || allowedProfile !== targetProfile) {
    throw new ForbiddenException(
      'No tienes permiso para asignar ese perfil de usuario',
    );
  }
}
