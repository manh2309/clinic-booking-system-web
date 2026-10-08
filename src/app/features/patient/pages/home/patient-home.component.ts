import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, NgIf, PageHeaderComponent],
  template: `
    <div>
      <app-page-header
        title="Trang chủ"
        [subtitle]="'Xin chào, ' + (currentUser?.fullName ?? 'bạn') + '!'"
      ></app-page-header>

      <mat-card class="placeholder-card">
        <mat-card-content>
          <div class="placeholder-content">
            <mat-icon class="placeholder-icon">home</mat-icon>
            <h3>Trang chủ bệnh nhân</h3>
            <p>
              Chức năng này đang được phát triển.<br />
              Tại đây sẽ hiển thị tổng quan: lịch hẹn sắp tới, thông báo mới, gợi ý bác sĩ...
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .placeholder-card { border-radius: 12px; }
    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      gap: 12px;
      text-align: center;
    }
    .placeholder-icon { font-size: 56px; width: 56px; height: 56px; color: #90caf9; }
    h3 { font-size: 18px; font-weight: 600; color: #374151; margin: 0; }
    p  { font-size: 14px; color: #6b7280; line-height: 1.7; margin: 0; }
  `],
})
export class PatientHomeComponent {
  constructor(private authService: AuthService) {}
  get currentUser() { return this.authService.getCurrentUser(); }
}
