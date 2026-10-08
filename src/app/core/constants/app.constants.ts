import { Role } from '../models/user.model';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'clinic_access_token',
  CURRENT_USER: 'clinic_current_user',
} as const;

export const ROLE_LABELS: Record<Role, string> = {
  [Role.PATIENT]: 'Bệnh nhân',
  [Role.DOCTOR]: 'Bác sĩ',
  [Role.ADMIN]: 'Quản trị viên',
};

export const ROLE_HOME_ROUTES: Record<Role, string> = {
  [Role.PATIENT]: '/patient/home',
  [Role.DOCTOR]: '/doctor/dashboard',
  [Role.ADMIN]: '/admin/dashboard',
};
