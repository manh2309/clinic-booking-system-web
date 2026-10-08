import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PatientProfileResponse, PatientProfileRequest } from '../models/domain.model';

@Injectable({ providedIn: 'root' })
export class PatientProfileService {
  private readonly baseUrl = `${environment.apiBaseUrl}/patient/me/profile`;

  constructor(private http: HttpClient) {}

  /** GET /patient/me/profile */
  getMyProfile(): Observable<ApiResponse<PatientProfileResponse>> {
    return this.http.get<ApiResponse<PatientProfileResponse>>(this.baseUrl);
  }

  /** PUT /patient/me/profile/update */
  updateMyProfile(request: PatientProfileRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/update`, request);
  }
}
