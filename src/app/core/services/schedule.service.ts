import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { ScheduleResponse, CreateScheduleRequest } from '../models/domain.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly baseUrl = `${environment.apiBaseUrl}/doctors/me/schedules`;

  constructor(private http: HttpClient) {}

  /** GET /doctors/me/schedules */
  getMySchedules(): Observable<ApiResponse<ScheduleResponse[]>> {
    return this.http.get<ApiResponse<ScheduleResponse[]>>(this.baseUrl);
  }

  /** POST /doctors/me/schedules */
  create(request: CreateScheduleRequest): Observable<ApiResponse<ScheduleResponse>> {
    return this.http.post<ApiResponse<ScheduleResponse>>(this.baseUrl, request);
  }

  /** DELETE /doctors/me/schedules/{id} */
  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  restore(id: number): Observable<ApiResponse<ScheduleResponse>> {
    return this.http.patch<ApiResponse<ScheduleResponse>>(`${this.baseUrl}/${id}/restore`, {});
  }
}
