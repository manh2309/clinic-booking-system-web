import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

/**
 * RoleGuard — kiểm tra role sau khi đã xác thực.
 * Sử dụng trong route data: { roles: [Role.ADMIN] }
 * Nếu không có quyền → chuyển tới /403 (không logout).
 */
export const roleGuard: CanActivateFn = (route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Role[] | undefined;

  // Nếu không khai báo roles → cho phép mọi user đã login
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  return router.createUrlTree(['/403']);
};
