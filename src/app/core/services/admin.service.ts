import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AdminAccountResponse, UpdateAccountStatusRequest } from '../models/domain.model';
import { DoctorResponse, CreateDoctorRequest } from '../models/domain.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** GET /accounts */
  getAllAccounts(): Observable<ApiResponse<AdminAccountResponse[]>> {
    return this.http.get<ApiResponse<AdminAccountResponse[]>>(`${this.baseUrl}/accounts`);
  }

  /** PATCH /admin/accounts/{id}/status */
  updateAccountStatus(id: number, request: UpdateAccountStatusRequest): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/admin/accounts/${id}/status`,
      request
    );
  }

  /** POST /admin/doctors */
  createDoctor(request: CreateDoctorRequest): Observable<ApiResponse<DoctorResponse>> {
    return this.http.post<ApiResponse<DoctorResponse>>(
      `${this.baseUrl}/admin/doctors`,
      request
    );
  }
}
