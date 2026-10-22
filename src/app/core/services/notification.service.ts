import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';

export interface NotificationResponse {
  id: number; appointmentId: number | null; type: string; title: string; message: string;
  read: boolean; readAt: string | null; createdAt: string;
}
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = `${environment.apiBaseUrl}/notifications/me`;
  readonly changed = new Subject<void>();
  constructor(private http: HttpClient) {}
  getMine(page = 0, size = 10) {
    return this.http.get<ApiResponse<PageResponse<NotificationResponse>>>(this.base, {
      params: new HttpParams().set('page', page).set('size', size),
    });
  }
  unreadCount() { return this.http.get<ApiResponse<number>>(`${this.base}/unread-count`); }
  markAllRead() {
    return this.http.patch<ApiResponse<number>>(`${this.base}/read-all`, {}).pipe(
      tap(() => this.changed.next()),
    );
  }
  markRead(id: number) {
    return this.http.patch<ApiResponse<NotificationResponse>>(`${this.base}/${id}/read`, {}).pipe(
      tap(() => this.changed.next()),
    );
  }
}
