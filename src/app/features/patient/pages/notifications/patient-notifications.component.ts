import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-patient-notifications',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PageHeaderComponent],
  template: `
    <div class="fade-in">
      <app-page-header
        title="Thông báo"
        subtitle="Hệ thống thông báo nhắc lịch và cập nhật trạng thái ca khám"
      ></app-page-header>

      <mat-card class="in-dev-card">
        <mat-card-content>
          <div class="in-dev-content">
            <div class="in-dev-icon-wrapper">
              <mat-icon>notifications</mat-icon>
            </div>
            <span class="in-dev-badge">Tính năng đang phát triển</span>
            <h2 class="in-dev-title">Hệ thống Thông báo trực tuyến</h2>
            <p class="in-dev-desc">
              Chức năng tiếp nhận thông báo xác nhận ca khám, nhắc lịch hẹn và cập nhật trạng thái từ bác sĩ đang trong giai đoạn phát triển và sẽ sớm được ra mắt.
            </p>
            <div class="planned-items">
              <div class="item">
                <mat-icon class="check">pending</mat-icon>
                <span>Nhận thông báo khi bác sĩ xác nhận hoặc hoàn thành lịch khám</span>
              </div>
              <div class="item">
                <mat-icon class="check">pending</mat-icon>
                <span>Nhắc lịch hẹn khám trước giờ diễn ra ca khám</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .in-dev-card {
      border-radius: 14px !important;
      border: 1px dashed #cbd5e1 !important;
      background: #f8fafc !important;
      box-shadow: none !important;
    }
    .in-dev-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      text-align: center;
      max-width: 540px;
      margin: 0 auto;
    }
    .in-dev-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: #e0f2fe;
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }
    .in-dev-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: #0369a1;
      background: #e0f2fe;
      padding: 3px 10px;
      border-radius: 9999px;
      margin-bottom: 8px;
    }
    .in-dev-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px;
    }
    .in-dev-desc {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 20px;
    }
    .planned-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
      width: 100%;
      background: #ffffff;
      padding: 16px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #475569;
      .check { font-size: 18px; width: 18px; height: 18px; color: #94a3b8; }
    }
  `],
})
export class PatientNotificationsComponent {}
