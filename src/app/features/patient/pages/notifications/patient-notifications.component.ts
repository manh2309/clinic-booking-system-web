import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NotificationService, NotificationResponse } from '../../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector:'app-patient-notifications', standalone:true,
  imports:[NgIf, NgFor, DatePipe, RouterLink, MatButtonModule, MatCardModule, MatPaginatorModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template:`<app-page-header title="Thông báo" subtitle="Cập nhật trạng thái các lịch hẹn của bạn"></app-page-header>
    <button mat-stroked-button (click)="load()" [disabled]="loading">Làm mới</button>
    <app-loading *ngIf="loading" message="Đang tải thông báo..."></app-loading>
    <p *ngIf="!loading && error" role="alert">{{ error }} <button mat-button (click)="load()">Thử lại</button></p>
    <p *ngIf="actionError" role="alert">{{ actionError }}</p>
    <ng-container *ngIf="!loading && !error">
      <app-empty-state *ngIf="!items.length" icon="notifications_none" title="Chưa có thông báo" message="Các thay đổi lịch hẹn sẽ xuất hiện tại đây."></app-empty-state>
      <mat-card *ngFor="let item of items" class="notification-card" [class.unread]="!item.read">
        <mat-card-content>
          <h2>{{ item.title }} <span *ngIf="!item.read" class="unread-label">Chưa đọc</span></h2>
          <p>{{ item.createdAt | date:'dd/MM/yyyy HH:mm' }}</p><p>{{ item.message }}</p>
          <div class="actions">
            <button mat-button *ngIf="!item.read" [disabled]="reading.has(item.id)" (click)="markRead(item)">Đánh dấu đã đọc</button>
            <a mat-button *ngIf="item.appointmentId" [routerLink]="destination(item)">Xem {{ item.type === 'APPOINTMENT_COMPLETED' && !isDoctor ? 'kết quả khám' : 'lịch hẹn' }}</a>
          </div>
        </mat-card-content>
      </mat-card>
      <mat-paginator *ngIf="total > pageSize" [length]="total" [pageIndex]="page" [pageSize]="pageSize" (page)="changePage($event)"></mat-paginator>
    </ng-container>`,
  styles:[`.notification-card{margin-top:12px;overflow-wrap:anywhere;} .unread{border-left:3px solid #0284c7;} h2{font-size:17px;} .unread-label{font-size:12px;color:#0369a1;} .actions{display:flex;flex-wrap:wrap;gap:8px;}`],
})
export class PatientNotificationsComponent implements OnInit {
  items: NotificationResponse[] = [];
  loading = false; error = ''; actionError = ''; page = 0; pageSize = 10; total = 0;
  reading = new Set<number>();
  readonly isDoctor: boolean;
  constructor(private service: NotificationService, router: Router) { this.isDoctor = router.url.startsWith('/doctor'); }
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.service.getMine(this.page, this.pageSize).subscribe({
      next: res => { this.items = res.data.content; this.total = res.data.totalElements; this.loading = false; this.service.changed.next(); },
      error: () => { this.loading = false; this.error = 'Không thể tải thông báo. Vui lòng thử lại.'; },
    });
  }
  markRead(item: NotificationResponse): void {
    if (item.read || this.reading.has(item.id)) return;
    this.reading.add(item.id); this.actionError = '';
    this.service.markRead(item.id).subscribe({
      next: res => { Object.assign(item, res.data); this.reading.delete(item.id); },
      error: () => { this.reading.delete(item.id); this.actionError = 'Chưa đánh dấu được thông báo. Vui lòng thử lại.'; },
    });
  }
  destination(item: NotificationResponse): string {
    return this.isDoctor ? '/doctor/appointments' : item.type === 'APPOINTMENT_COMPLETED' ? '/patient/medical-records' : '/patient/appointments';
  }
  changePage(event: PageEvent): void { this.page = event.pageIndex; this.pageSize = event.pageSize; this.load(); }
}
