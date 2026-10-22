/** Chuyên khoa */
export interface SpecialtyResponse {
  id: number;
  name: string;
  description?: string;
  active?: boolean;
}

export interface CreateSpecialtyRequest {
  name: string;
  description?: string;
}

export interface UpdateSpecialtyRequest {
  name: string;
  description?: string;
}

export interface UpdateSpecialtyStatusRequest {
  active: boolean;
}

/** Bác sĩ */
export interface DoctorResponse {
  id: number;
  fullName: string;
  qualification?: string;
  description?: string;
  specialtyId?: number;
  specialtyName?: string;
  active?: boolean;
}

export interface CreateDoctorRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  fullName: string;
  qualification?: string;
  description?: string;
  specialtyId: number;
}

export interface UpdateDoctorRequest {
  fullName: string;
  qualification?: string;
  description?: string;
  specialtyId: number;
}

export interface UpdateDoctorStatusRequest {
  active: boolean;
}

/** Lịch làm việc */
export interface ScheduleResponse {
  id: number;
  startAt: string;
  endAt: string;
  slots?: SlotResponse[];
  doctorAvailable?: boolean;
  active: boolean;
}

export interface SlotResponse {
  id: number;
  startAt: string;
  endAt: string;
  status?: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  blockReason?: 'PENDING_LEAVE' | 'APPROVED_LEAVE' | null;
}

export interface CreateScheduleRequest {
  startAt: string; // ISO date-time
  endAt: string;   // ISO date-time
}

/** Lịch hẹn */
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'EXPIRED' | 'NO_SHOW';

export interface AppointmentResponse {
  id: number;
  status: AppointmentStatus;
  doctorId: number;
  doctorName?: string;
  patientAccountId?: number;
  patientFullName?: string;
  patientPhone?: string;
  statusReason?: string;
  startAt: string;
  endAt: string;
}

export interface CreateAppointmentRequest {
  slotId: number;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
}

/** Hồ sơ bệnh nhân */
export interface PatientProfileResponse {
  patientProfileId?: number | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  accountId?: number;
}

export interface PatientProfileRequest {
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  email: string;
  phone?: string;
  address?: string;
}

/** Admin account management */
export interface UpdateAccountStatusRequest {
  isActive: boolean;
}

export interface AdminAccountResponse {
  id: number;
  username: string;
  email: string;
  roleName: string;
  isActive?: boolean;
}

export interface RoleResponse {
  roleId: number;
  roleName: string;
}

export interface AvailableDateResponse {
  date: string;
  availableSlots: number;
}
