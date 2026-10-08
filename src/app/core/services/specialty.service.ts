import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { SpecialtyResponse, CreateSpecialtyRequest, UpdateSpecialtyRequest } from '../models/domain.model';

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
  private readonly baseUrl = `${environment.apiBaseUrl}/specialties`;
  private readonly adminUrl = `${environment.apiBaseUrl}/admin/specialties`;

  constructor(private http: HttpClient) {}

  /** GET /specialties (public) */
  getAll(): Observable<ApiResponse<SpecialtyResponse[]>> {
    return this.http.get<ApiResponse<SpecialtyResponse[]>>(this.baseUrl);
  }

  /** POST /admin/specialties */
  create(request: CreateSpecialtyRequest): Observable<ApiResponse<SpecialtyResponse>> {
    return this.http.post<ApiResponse<SpecialtyResponse>>(this.adminUrl, request);
  }

  /** PUT /admin/specialties/{id} */
  update(id: number, request: UpdateSpecialtyRequest): Observable<ApiResponse<SpecialtyResponse>> {
    return this.http.put<ApiResponse<SpecialtyResponse>>(`${this.adminUrl}/${id}`, request);
  }
}
