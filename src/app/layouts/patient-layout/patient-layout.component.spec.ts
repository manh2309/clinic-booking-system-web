import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { Role, User } from '../../core/models/user.model';
import { NotificationService } from '../../core/services/notification.service';
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

describe('Authenticated patient navigation', () => {
  let users: BehaviorSubject<User | null>;
  beforeEach(async () => {
    users = new BehaviorSubject<User | null>({id:8,username:'demo_patient01',email:'patient@example.test',fullName:'Bệnh nhân',role:Role.PATIENT});
    await TestBed.configureTestingModule({
      imports:[PatientLayoutComponent, RouterTestingModule, NoopAnimationsModule],
      providers:[
        {provide:AuthService,useValue:{isAuthenticated:()=>!!users.value,currentUser$:users.asObservable()}},
        {provide:NotificationService,useValue:{changed:new Subject<void>(),unreadCount:()=>of({data:0})}},
      ],
    }).compileComponents();
  });
  it('keeps the navigation DOM mounted across change detection and becomes stable', async () => {
    const fixture=TestBed.createComponent(PatientLayoutComponent);
    fixture.detectChanges();
    const host:HTMLElement=fixture.nativeElement;
    const original=host.querySelector('.navbar-nav a[href="/patient/appointments"]');
    expect(original).not.toBeNull();
    for(let i=0;i<5;i++)fixture.detectChanges();
    expect(host.querySelector('.navbar-nav a[href="/patient/appointments"]')).toBe(original);
    await fixture.whenStable();
    expect(host.querySelector('app-notification-bell')).not.toBeNull();
    fixture.destroy();
  });
  it('removes patient-only links after logout', () => {
    const fixture=TestBed.createComponent(PatientLayoutComponent);
    fixture.detectChanges(); users.next(null); fixture.detectChanges();
    const host:HTMLElement=fixture.nativeElement;
    expect(host.querySelector('a[href="/patient/appointments"]')).toBeNull();
    expect(host.querySelector('app-notification-bell')).toBeNull();
    expect(host.textContent).toContain('Đăng nhập');
    fixture.destroy();
  });
});
