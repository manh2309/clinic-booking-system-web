import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PageHeaderComponent],
  template: `
    <div>
      <app-page-header title="Hồ sơ bác sĩ" subtitle="Thông tin chuyên môn và cài đặt tài khoản"></app-page-header>
      <mat-card class="placeholder-card">
        <mat-card-content>
          <div class="placeholder-content">
            <mat-icon class="placeholder-icon">person</mat-icon>
            <h3>Hồ sơ bác sĩ</h3>
            <p>Chức năng đang phát triển — Thông tin chuyên khoa, kinh nghiệm, chứng chỉ.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.placeholder-card{border-radius:12px}.placeholder-content{display:flex;flex-direction:column;align-items:center;padding:48px 24px;gap:12px;text-align:center}.placeholder-icon{font-size:56px;width:56px;height:56px;color:#7986cb}h3{font-size:18px;font-weight:600;color:#374151;margin:0}p{font-size:14px;color:#6b7280;line-height:1.7;margin:0}`],
})
export class DoctorProfileComponent {}
