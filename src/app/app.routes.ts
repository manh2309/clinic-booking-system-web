import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/user.model';

export const routes: Routes = [
  // === Redirect mặc định về login ===
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // ===========================
  // AUTH ROUTES (public)
  // ===========================
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent
          ),
        title: 'Đăng nhập — Clinic Booking',
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        title: 'Đăng ký — Clinic Booking',
      },
    ],
  },

  // ===========================
  // PATIENT ROUTES
  // ===========================
  {
    path: 'patient',
    loadComponent: () =>
      import('./layouts/patient-layout/patient-layout.component').then(
        (m) => m.PatientLayoutComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.PATIENT] },
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/patient/pages/home/patient-home.component').then(
            (m) => m.PatientHomeComponent
          ),
        title: 'Trang chủ — Clinic Booking',
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/patient/pages/doctors/patient-doctors.component').then(
            (m) => m.PatientDoctorsComponent
          ),
        title: 'Tìm bác sĩ — Clinic Booking',
      },
      {
        path: 'booking/:id',
        loadComponent: () =>
          import('./features/patient/pages/booking/patient-booking.component').then(
            (m) => m.PatientBookingComponent
          ),
        title: 'Đặt lịch khám — Clinic Booking',
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/patient/pages/appointments/patient-appointments.component').then(
            (m) => m.PatientAppointmentsComponent
          ),
        title: 'Lịch hẹn của tôi — Clinic Booking',
      },
      {
        path: 'medical-records',
        loadComponent: () =>
          import('./features/patient/pages/medical-records/patient-medical-records.component').then(
            (m) => m.PatientMedicalRecordsComponent
          ),
        title: 'Hồ sơ bệnh án — Clinic Booking',
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/patient/pages/notifications/patient-notifications.component').then(
            (m) => m.PatientNotificationsComponent
          ),
        title: 'Thông báo — Clinic Booking',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/patient/pages/profile/patient-profile.component').then(
            (m) => m.PatientProfileComponent
          ),
        title: 'Hồ sơ cá nhân — Clinic Booking',
      },
    ],
  },

  // ===========================
  // DOCTOR ROUTES
  // ===========================
  {
    path: 'doctor',
    loadComponent: () =>
      import('./layouts/doctor-layout/doctor-layout.component').then(
        (m) => m.DoctorLayoutComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.DOCTOR] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/doctor/pages/dashboard/doctor-dashboard.component').then(
            (m) => m.DoctorDashboardComponent
          ),
        title: 'Dashboard — Clinic Booking',
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import('./features/doctor/pages/schedule/doctor-schedule.component').then(
            (m) => m.DoctorScheduleComponent
          ),
        title: 'Lịch khám — Clinic Booking',
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/doctor/pages/appointments/doctor-appointments.component').then(
            (m) => m.DoctorAppointmentsComponent
          ),
        title: 'Lịch hẹn — Clinic Booking',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/doctor/pages/profile/doctor-profile.component').then(
            (m) => m.DoctorProfileComponent
          ),
        title: 'Hồ sơ bác sĩ — Clinic Booking',
      },
    ],
  },

  // ===========================
  // ADMIN ROUTES
  // ===========================
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    canActivate: [authGuard, roleGuard],
    data: { roles: [Role.ADMIN] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/pages/dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        title: 'Dashboard Admin — Clinic Booking',
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/admin/pages/accounts/admin-accounts.component').then(
            (m) => m.AdminAccountsComponent
          ),
        title: 'Tài khoản — Clinic Booking',
      },
      {
        path: 'doctors',
        loadComponent: () =>
          import('./features/admin/pages/doctors/admin-doctors.component').then(
            (m) => m.AdminDoctorsComponent
          ),
        title: 'Bác sĩ — Clinic Booking',
      },
      {
        path: 'specialties',
        loadComponent: () =>
          import('./features/admin/pages/specialties/admin-specialties.component').then(
            (m) => m.AdminSpecialtiesComponent
          ),
        title: 'Chuyên khoa — Clinic Booking',
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/admin/pages/appointments/admin-appointments.component').then(
            (m) => m.AdminAppointmentsComponent
          ),
        title: 'Lịch hẹn Admin — Clinic Booking',
      },
    ],
  },

  // ===========================
  // SYSTEM / ERROR ROUTES
  // ===========================
  {
    path: '403',
    loadComponent: () =>
      import('./features/error/pages/forbidden/forbidden.component').then(
        (m) => m.ForbiddenComponent
      ),
    title: '403 Forbidden — Clinic Booking',
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/error/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: '404 Not Found — Clinic Booking',
  },

  // Wildcard → 404
  {
    path: '**',
    redirectTo: '404',
  },
];
