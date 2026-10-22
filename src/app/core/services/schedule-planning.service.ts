import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
export interface WeeklyRule {
    id: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    effectiveFrom: string;
    effectiveTo: string;
    active: boolean;
}
export interface WeeklyBatchRequest {
    daysOfWeek: number[];
    windows: {startTime:string;endTime:string}[];
    effectiveFrom:string;
    effectiveTo:string;
}
export interface WeeklyBatchResult extends Generation { added:number; skipped:number; }
export interface Leave {
    id: number;
    doctorId: number;
    doctorName: string;
    startAt: string;
    endAt: string;
    reason: string;
    status: string;
    reviewReason?: string;
}
export interface Affected {
    appointmentId: number;
    patientAccountId: number;
    patientName: string;
    patientPhone?: string;
    startAt: string;
    status: string;
    contactId?: number;
    contactedAt?: string;
}
export interface Generation {
    created: number;
    conflicts: string[];
}
export function clinicInstant(value: string): number { return Date.parse(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : value + '+07:00'); }
export function clinicDate(): string { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
export const leaveLabels: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối', WITHDRAWN: 'Đã rút' };
@Injectable({ providedIn: 'root' })
export class SchedulePlanningService {
    private base = environment.apiBaseUrl;
    constructor(private http: HttpClient) { }
    weekly(id: number) { return this.http.get<ApiResponse<WeeklyRule[]>>(`${this.base}/admin/doctors/${id}/weekly-schedules`); }
    addWeekly(id: number, body: Omit<WeeklyRule, 'id' | 'active'>) { return this.http.post<ApiResponse<Generation>>(`${this.base}/admin/doctors/${id}/weekly-schedules`, body); }
    addWeeklyBatch(id:number,body:WeeklyBatchRequest){return this.http.post<ApiResponse<WeeklyBatchResult>>(`${this.base}/admin/doctors/${id}/weekly-schedules/batch`,body);}
    generate(id: number) { return this.http.post<ApiResponse<Generation>>(`${this.base}/admin/doctors/${id}/schedules/generate`, {}); }
    endWeekly(id: number, rule: number, from: string) { return this.http.patch<ApiResponse<void>>(`${this.base}/admin/doctors/${id}/weekly-schedules/${rule}/end`, {}, { params: { from } }); }
    mine() { return this.http.get<ApiResponse<Leave[]>>(`${this.base}/doctors/me/leaves`); }
    request(body: {
        startAt: string;
        endAt: string;
        reason: string;
    }) { return this.http.post<ApiResponse<Leave>>(`${this.base}/doctors/me/leaves`, body); }
    withdraw(id: number) { return this.http.patch<ApiResponse<Leave>>(`${this.base}/doctors/me/leaves/${id}/withdraw`, {}); }
    all() { return this.http.get<ApiResponse<Leave[]>>(`${this.base}/admin/leaves`); }
    affected(id: number) { return this.http.get<ApiResponse<Affected[]>>(`${this.base}/admin/leaves/${id}/affected`); }
    review(id: number, body: {
        decision: string;
        reason: string;
        confirmCancellation: boolean;
    }) { return this.http.patch<ApiResponse<Leave>>(`${this.base}/admin/leaves/${id}/review`, body); }
    contact(id: number, contactId: number) { return this.http.patch<ApiResponse<void>>(`${this.base}/admin/leaves/${id}/contacts/${contactId}`, {}); }
}
