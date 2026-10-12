import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  AdminAccountResponse,
  UpdateAccountStatusRequest,
  DoctorResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  UpdateDoctorStatusRequest,
  UpdateSpecialtyStatusRequest,
  RoleResponse,
} from '../models/domain.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** GET /accounts */
  getAllAccounts(): Observable<ApiResponse<AdminAccountResponse[]>> {
    return this.http.get<ApiResponse<AdminAccountResponse[]>>(`${this.baseUrl}/accounts`);
  }

  /** GET /accounts/{id} */
  getAccountById(id: number): Observable<ApiResponse<AdminAccountResponse>> {
    return this.http.get<ApiResponse<AdminAccountResponse>>(`${this.baseUrl}/accounts/${id}`);
  }

  /** PATCH /admin/accounts/{id}/status */
  updateAccountStatus(id: number, request: UpdateAccountStatusRequest): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/admin/accounts/${id}/status`,
      request
    );
  }

  /** GET /roles */
  getRoles(): Observable<ApiResponse<RoleResponse[]>> {
    return this.http.get<ApiResponse<RoleResponse[]>>(`${this.baseUrl}/roles`);
  }

  /** POST /admin/doctors */
  createDoctor(request: CreateDoctorRequest): Observable<ApiResponse<DoctorResponse>> {
    return this.http.post<ApiResponse<DoctorResponse>>(
      `${this.baseUrl}/admin/doctors`,
      request
    );
  }

  /** PUT /admin/doctors/{id} */
  updateDoctor(id: number, request: UpdateDoctorRequest): Observable<ApiResponse<DoctorResponse>> {
    return this.http.put<ApiResponse<DoctorResponse>>(
      `${this.baseUrl}/admin/doctors/${id}`,
      request
    );
  }

  /** PATCH /admin/doctors/{id}/status */
  updateDoctorStatus(id: number, request: UpdateDoctorStatusRequest): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/admin/doctors/${id}/status`,
      request
    );
  }

  /** PATCH /admin/specialties/{id}/status */
  updateSpecialtyStatus(id: number, request: UpdateSpecialtyStatusRequest): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(
      `${this.baseUrl}/admin/specialties/${id}/status`,
      request
    );
  }
}
