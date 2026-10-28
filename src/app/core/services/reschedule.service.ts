import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export interface RescheduleProposal {
  id: number; appointmentId: number; targetSlotId: number;
  targetStartAt: string; targetEndAt: string; reason: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN' | 'EXPIRED' | 'INVALIDATED';
  expiresAt: string; respondedAt?: string; proposedBy: number; createdAt: string;
  replacementAppointmentId?: number;
}

@Injectable({providedIn: 'root'})
export class RescheduleService {
  constructor(private http: HttpClient) {}
  private url(appointmentId: number, admin: boolean): string {
    return `${environment.apiBaseUrl}/${admin ? 'admin/' : ''}appointments/${appointmentId}/reschedules`;
  }
  history(id: number, admin: boolean) { return this.http.get<ApiResponse<RescheduleProposal[]>>(this.url(id, admin)); }
  propose(id: number, slotId: number, reason: string, expiresAt: string) {
    return this.http.post<ApiResponse<RescheduleProposal>>(this.url(id, true), {slotId, reason, expiresAt});
  }
  respond(appointmentId: number, id: number, action: 'accept' | 'decline' | 'withdraw') {
    return this.http.patch<ApiResponse<RescheduleProposal>>(`${this.url(appointmentId, action === 'withdraw')}/${id}/${action}`, {});
  }
}
