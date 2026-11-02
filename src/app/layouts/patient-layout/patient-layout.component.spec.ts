import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { PatientLayoutComponent } from './patient-layout.component';

describe('Guest navigation rendering', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [PatientLayoutComponent, RouterTestingModule, NoopAnimationsModule], providers: [{provide: AuthService, useValue: {isAuthenticated: () => false, currentUser$: of(null)}}]}).compileComponents();
  });
  it('shows login and registration without instantiating notifications or private navigation', () => {
    const fixture = TestBed.createComponent(PatientLayoutComponent); fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toContain('Đăng nhập'); expect(host.textContent).toContain('Đăng ký');
    expect(host.querySelector('app-notification-bell')).toBeNull();
    expect(host.querySelector('a[href="/patient/appointments"]')).toBeNull();
    expect(host.querySelector('a[href="/patient/medical-records"]')).toBeNull();
    fixture.destroy();
  });
});
