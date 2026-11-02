import { patientReturnUrl, continueAfterAuthentication } from './auth-return';
import { routes } from '../../app.routes';
import { authGuard } from '../guards/auth.guard';
import { roleGuard } from '../guards/role.guard';
import { Role } from '../models/user.model';

describe('Public navigation boundaries', () => {
  it('allows browsing but guards every private patient page', () => {
    const patient = routes.find(route => route.path === 'patient')!;
    expect(patient.canActivate).toBeUndefined();
    for (const path of ['home', 'doctors', 'booking/:id']) expect(patient.children!.find(route => route.path === path)!.canActivate).toBeUndefined();
    for (const path of ['appointments', 'medical-records', 'notifications', 'profile']) {
      const route = patient.children!.find(route => route.path === path)!;
      expect(route.canActivate).toEqual([authGuard, roleGuard]);
      expect(route.data?.['roles']).toEqual([Role.PATIENT]);
    }
    for (const path of ['admin', 'doctor']) expect(routes.find(route => route.path === path)!.canActivate).toEqual([authGuard, roleGuard]);
  });
  it('accepts only internal patient destinations', () => {
    expect(patientReturnUrl('/patient/booking/1?date=2090-10-26&slotId=12')).toBe('/patient/booking/1?date=2090-10-26&slotId=12');
    for (const url of ['https://evil.invalid', '//evil.invalid', '/admin/dashboard', '/patient/booking/0', '/patient/../admin', '/patient/home\\evil', '/patient/home x', null]) expect(patientReturnUrl(url)).toBeNull();
  });
  it('never sends a staff account to the patient destination', () => {
    const auth: any = {hasRole: () => false, redirectToHome: jasmine.createSpy()};
    const router: any = {navigateByUrl: jasmine.createSpy()};
    continueAfterAuthentication(auth, router, '/patient/appointments');
    expect(auth.redirectToHome).toHaveBeenCalled(); expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
