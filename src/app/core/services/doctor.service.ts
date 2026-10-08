import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';
import {
  DoctorResponse,
  SpecialtyResponse,
  SlotResponse,
} from '../models/domain.model';

export interface DoctorSearchParams {
  specialtyId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly baseUrl = `${environment.apiBaseUrl}/doctors`;

  constructor(private http: HttpClient) {}

  /** GET /doctors?specialtyId&keyword&page&size */
  search(params: DoctorSearchParams = {}): Observable<ApiResponse<PageResponse<DoctorResponse>>> {
    let httpParams = new HttpParams();
    if (params.specialtyId != null) httpParams = httpParams.set('specialtyId', params.specialtyId);
    if (params.keyword)             httpParams = httpParams.set('keyword', params.keyword);
    if (params.page != null)        httpParams = httpParams.set('page', params.page);
    if (params.size != null)        httpParams = httpParams.set('size', params.size);
    return this.http.get<ApiResponse<PageResponse<DoctorResponse>>>(this.baseUrl, { params: httpParams });
  }

  /** GET /doctors/{id} */
  getById(id: number): Observable<ApiResponse<DoctorResponse>> {
    return this.http.get<ApiResponse<DoctorResponse>>(`${this.baseUrl}/${id}`);
  }

  /** GET /doctors/{doctorId}/available-slots?date */
  getAvailableSlots(doctorId: number, date: string): Observable<ApiResponse<SlotResponse[]>> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<SlotResponse[]>>(
      `${this.baseUrl}/${doctorId}/available-slots`,
      { params }
    );
  }
}
