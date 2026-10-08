import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

/**
 * JWT Interceptor — tự động thêm Authorization header vào mọi request.
 *
 * Xử lý lỗi:
 *  - 401: token hết hạn / không hợp lệ → xóa token → chuyển về /login
 *  - 403: không có quyền → chuyển tới /403 (KHÔNG logout)
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  // Không gắn Authorization header cho các endpoint auth (login, register)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  const token = storageService.getToken();

  // Nếu có token hợp lệ thì clone request và thêm Authorization header
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          // Token hết hạn hoặc không hợp lệ — xóa và về trang đăng nhập
          storageService.clearAll();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          // Không có quyền — KHÔNG logout, chỉ chuyển tới trang 403
          router.navigate(['/403']);
        }
      }
      return throwError(() => error);
    })
  );
};
