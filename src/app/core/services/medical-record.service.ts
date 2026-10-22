import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';

export interface MedicalRecordRequest {
  diagnosis: string;
  examinationNotes?: string;
  treatmentAdvice?: string;
}
export interface MedicalRecordResponse {
  diagnosis: string; examinationNotes: string | null; treatmentAdvice: string | null;
  id: number; appointmentId: number; doctorId: number; doctorName: string;
  startAt: string; createdAt: string | null;
}
@Injectable({ providedIn: 'root' })
export class MedicalRecordService {
  constructor(private http: HttpClient) {}
  getMine(page = 0, size = 10): Observable<ApiResponse<PageResponse<MedicalRecordResponse>>> {
    return this.http.get<ApiResponse<PageResponse<MedicalRecordResponse>>>(`${environment.apiBaseUrl}/patient/me/medical-records`, {
      params: new HttpParams().set('page', page).set('size', size),
    });
  }
}
