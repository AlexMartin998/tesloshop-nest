import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from '.';
import { ValidRoles } from '../interfaces';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';

// export function Auth(...roles: Role[]) { // roles in db
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    // no va el @
    RoleProtected(...roles),
    // solo se envia la referencia UserRoleGuard para q nest use la misma instance
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
