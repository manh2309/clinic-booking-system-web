import { MedicalRecordRequest, MedicalRecordResponse } from './medical-record.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  AppointmentResponse,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  AppointmentStatus,
} from '../models/domain.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly baseUrl = `${environment.apiBaseUrl}/appointments`;
  private readonly doctorUrl = `${environment.apiBaseUrl}/doctors/me/appointments`;

  constructor(private http: HttpClient) {}

  /** POST /appointments — bệnh nhân đặt lịch */
  book(request: CreateAppointmentRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.post<ApiResponse<AppointmentResponse>>(this.baseUrl, request);
  }

  /** GET /appointments/me?page&size — lịch hẹn của bệnh nhân hiện tại */
  getMine(page = 0, size = 10, status?: AppointmentStatus): Observable<ApiResponse<PageResponse<AppointmentResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<AppointmentResponse>>>(
      `${this.baseUrl}/me`,
      { params }
    );
  }

  /** PATCH /appointments/{id}/cancel */
  cancel(id: number): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.baseUrl}/${id}/cancel`,
      {}
    );
  }

  /** GET /doctors/me/appointments?page&size — lịch hẹn của bác sĩ hiện tại */
  getDoctorAppointments(page = 0, size = 10, status?: AppointmentStatus): Observable<ApiResponse<PageResponse<AppointmentResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<PageResponse<AppointmentResponse>>>(
      this.doctorUrl,
      { params }
    );
  }

  complete(id: number, request: MedicalRecordRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.post<ApiResponse<AppointmentResponse>>(`${this.doctorUrl}/${id}/complete`, request);
  }

  getDoctorRecord(id: number): Observable<ApiResponse<MedicalRecordResponse>> {
    return this.http.get<ApiResponse<MedicalRecordResponse>>(`${this.doctorUrl}/${id}/medical-record`);
  }

  getDoctorSummary(): Observable<ApiResponse<DoctorAppointmentSummary>> {
    return this.http.get<ApiResponse<DoctorAppointmentSummary>>(`${this.doctorUrl}/summary`);
  }

  /** PATCH /doctors/me/appointments/{id}/status */
  updateStatus(id: number, request: UpdateAppointmentStatusRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.doctorUrl}/${id}/status`,
      request
    );
  }

  getAdminAppointments(page = 0, size = 20, status?: AppointmentStatus, doctorId?: number): Observable<ApiResponse<PageResponse<AppointmentResponse>>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (doctorId) params = params.set('doctorId', doctorId);
    return this.http.get<ApiResponse<PageResponse<AppointmentResponse>>>(`${environment.apiBaseUrl}/admin/appointments`, { params });
  }

  resolveByAdmin(id: number, action: 'cancel' | 'no-show', reason: string): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.patch<ApiResponse<AppointmentResponse>>(`${environment.apiBaseUrl}/admin/appointments/${id}/${action}`, { reason });
  }
}

export interface DoctorAppointmentSummary {
  totalAppointments: number;
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  openScheduleCount: number;
}
