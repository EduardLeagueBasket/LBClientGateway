# Gateway HTTP: audiencias y rutas

Prefijo global: **`/api`**.

| Prefijo | Audiencia | Auth | Rol (perfil JWT) |
|--------|-----------|------|------------------|
| `/api/auth/*` | Login, registro, verificación de token | Parcial (login/register públicos; verify con body token) | — |
| `/api/admin/*` | Backoffice (panel web) | `Authorization: Bearer` | Perfiles de staff por defecto (`DEFAULT_BACKOFFICE_PROFILES`); endpoints sensibles usan `@Roles` más restrictivo |
| `/api/app/*` | App móvil / cliente final | `Authorization: Bearer` | Cualquier usuario autenticado (sin guard de rol admin) |

## Tabla rápida (módulos admin)

| Ruta base | Descripción |
|-----------|-------------|
| `/api/admin/teams` | Equipos (motor competición) |
| `/api/admin/competitions` | Competencias (catálogo) |
| `/api/admin/countries` | Países (catálogo) |
| `/api/admin/profiles` | Perfiles auth |
| `/api/admin/upload` | Subida de imágenes |
| `/api/admin/users` | Usuarios auth |
| `/api/admin/auth/update-password` | Actualizar contraseña |
| `/api/admin/engine/groups` | Grupos |
| `/api/admin/engine/matches` | Partidos |
| `/api/admin/engine/standings` | Clasificación |
| `/api/admin/national-teams/teams` | Selecciones nacionales |
| `/api/admin/national-teams/matches` | Partidos selecciones |
| `/api/admin/national-teams/match-stats` | Estadísticas |
| `/api/admin/content/stories` | Stories (staff + SUPER_ADMIN/ADMIN con publisher) |
| `/api/admin/content/publishers` | Publishers de plataforma (SUPER_ADMIN/ADMIN) |
| `/api/admin/content/article-categories` | Categorías: GET staff / POST SUPER_ADMIN/ADMIN |
| `/api/admin/content/articles` | Artículos (mismos perfiles que stories) |

## App (móvil)

| Ruta | Descripción |
|------|-------------|
| `/api/app/health` | Comprobación |
| `/api/app/me` | Datos mínimos del usuario del token |
| `/api/app/content/stories?countryCode=CO` | Feed de stories del país (equipos/selecciones/ligas + League Basket GLOBAL o de ese país) |
| `/api/app/content/articles?countryCode=CO` | Feed de artículos del país (locales + platform GLOBAL o de ese país) |
| `/api/app/content/articles/:id` | Detalle de un artículo |

Añade nuevas rutas **`/api/admin/...`** para gestión interna y **`/api/app/...`** para clientes finales.
