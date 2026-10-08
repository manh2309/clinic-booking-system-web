import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard — bảo vệ các route yêu cầu đăng nhập.
 * Nếu chưa đăng nhập → chuyển về /login.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Lưu lại URL để sau khi login sẽ redirect đúng trang
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
