import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export function patientReturnUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048 || !value.startsWith('/') || value.startsWith('//') || /[\\\s]/.test(value)) return null;
  try {
    const url = new URL(value, 'https://clinic.invalid');
    if (url.origin !== 'https://clinic.invalid' || !/^\/patient\/(home|doctors|booking\/[1-9]\d*|appointments|medical-records|notifications|profile)\/?$/.test(url.pathname)) return null;
    return url.pathname + url.search;
  } catch { return null; }
}

export function continueAfterAuthentication(auth: AuthService, router: Router, returnUrl: unknown): void {
  const target = patientReturnUrl(returnUrl);
  if (target && auth.hasRole(Role.PATIENT)) router.navigateByUrl(target);
  else auth.redirectToHome();
}
