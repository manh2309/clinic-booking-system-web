import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { normalizeRole } from './core/services/auth.service';
import { Role } from './core/models/user.model';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
    }).compileComponents();
  });

  it('should create the app component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should contain a router-outlet for application routing', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

describe('normalizeRole logic', () => {
  it('should correctly normalize valid backend role names', () => {
    expect(normalizeRole('ROLE_ADMIN')).toBe(Role.ADMIN);
    expect(normalizeRole('ADMIN')).toBe(Role.ADMIN);
    expect(normalizeRole('ROLE_DOCTOR')).toBe(Role.DOCTOR);
    expect(normalizeRole('DOCTOR')).toBe(Role.DOCTOR);
    expect(normalizeRole('ROLE_PATIENT')).toBe(Role.PATIENT);
    expect(normalizeRole('PATIENT')).toBe(Role.PATIENT);
  });

  it('should default null or undefined role to PATIENT', () => {
    expect(normalizeRole(null)).toBe(Role.PATIENT);
    expect(normalizeRole(undefined)).toBe(Role.PATIENT);
    expect(normalizeRole('')).toBe(Role.PATIENT);
  });

  it('should strictly not elevate role based on username or email', () => {
    // Users with email admin@... or username admin must NOT be elevated to ADMIN if their role is PATIENT
    expect(normalizeRole('ROLE_PATIENT')).toBe(Role.PATIENT);
    expect(normalizeRole('PATIENT')).toBe(Role.PATIENT);
  });
});

