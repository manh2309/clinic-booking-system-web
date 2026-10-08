import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-patient-medical-records',
  standalone: true,
  imports: [MatCardModule, MatIconModule, PageHeaderComponent],
  template: `
    <div>
      <app-page-header title="Hồ sơ bệnh án" subtitle="Lịch sử khám bệnh và kết quả xét nghiệm"></app-page-header>
      <mat-card class="placeholder-card">
        <mat-card-content>
          <div class="placeholder-content">
            <mat-icon class="placeholder-icon">folder_shared</mat-icon>
            <h3>Hồ sơ bệnh án</h3>
            <p>Chức năng đang phát triển — Xem hồ sơ khám bệnh, đơn thuốc, kết quả xét nghiệm.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`.placeholder-card{border-radius:12px}.placeholder-content{display:flex;flex-direction:column;align-items:center;padding:48px 24px;gap:12px;text-align:center}.placeholder-icon{font-size:56px;width:56px;height:56px;color:#90caf9}h3{font-size:18px;font-weight:600;color:#374151;margin:0}p{font-size:14px;color:#6b7280;line-height:1.7;margin:0}`],
})
export class PatientMedicalRecordsComponent {}
