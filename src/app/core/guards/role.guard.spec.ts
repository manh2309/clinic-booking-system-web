import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

describe('roleGuard (Role Boundary Enforcement)', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
      'hasAnyRole',
      'hasRole',
    ]);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    router = TestBed.inject(Router);
  });

  function createRouteSnapshot(roles?: Role[]): ActivatedRouteSnapshot {
    return {
      data: roles ? { roles } : {},
    } as unknown as ActivatedRouteSnapshot;
  }

  const dummyState = {} as RouterStateSnapshot;

  it('should allow access if route has no required roles defined', () => {
    const route = createRouteSnapshot(undefined);
    const result = TestBed.runInInjectionContext(() => roleGuard(route, dummyState));
    expect(result).toBeTrue();
  });

  it('should allow access if user has the matching role', () => {
    mockAuthService.hasAnyRole.and.returnValue(true);
    const route = createRouteSnapshot([Role.PATIENT]);
    const result = TestBed.runInInjectionContext(() => roleGuard(route, dummyState));
    expect(result).toBeTrue();
  });

  it('should redirect ADMIN to /403 if route is only for PATIENT (no auto-bypass)', () => {
    // When ADMIN visits PATIENT route, hasAnyRole([Role.PATIENT]) is false
    mockAuthService.hasAnyRole.and.returnValue(false);
    mockAuthService.hasRole.and.callFake((r) => r === Role.ADMIN);

    const route = createRouteSnapshot([Role.PATIENT]);
    const result = TestBed.runInInjectionContext(() => roleGuard(route, dummyState));

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/403');
  });

  it('should redirect PATIENT to /403 if route is only for ADMIN', () => {
    mockAuthService.hasAnyRole.and.returnValue(false);

    const route = createRouteSnapshot([Role.ADMIN]);
    const result = TestBed.runInInjectionContext(() => roleGuard(route, dummyState));

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/403');
  });

  it('should redirect DOCTOR to /403 if route is only for ADMIN', () => {
    mockAuthService.hasAnyRole.and.returnValue(false);

    const route = createRouteSnapshot([Role.ADMIN]);
    const result = TestBed.runInInjectionContext(() => roleGuard(route, dummyState));

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/403');
  });
});
