import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  AppointmentResponse,
  CreateAppointmentRequest,
  UpdateAppointmentStatusRequest,
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
  getMine(page = 0, size = 10): Observable<ApiResponse<PageResponse<AppointmentResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
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
  getDoctorAppointments(page = 0, size = 10): Observable<ApiResponse<PageResponse<AppointmentResponse>>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<PageResponse<AppointmentResponse>>>(
      this.doctorUrl,
      { params }
    );
  }

  /** PATCH /doctors/me/appointments/{id}/status */
  updateStatus(id: number, request: UpdateAppointmentStatusRequest): Observable<ApiResponse<AppointmentResponse>> {
    return this.http.patch<ApiResponse<AppointmentResponse>>(
      `${this.doctorUrl}/${id}/status`,
      request
    );
  }
}
