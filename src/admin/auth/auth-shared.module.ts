import { Global, Module } from '@nestjs/common';
import { AdminRolesGuard } from './guards/admin-roles.guard';

/** Expone `AdminRolesGuard` a todos los módulos (sin repetir providers). */
@Global()
@Module({
  providers: [AdminRolesGuard],
  exports: [AdminRolesGuard],
})
export class AuthSharedModule {}
