import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DoctorService } from '../../../../core/services/doctor.service';
import { DoctorResponse } from '../../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector:'app-doctor-profile', standalone:true,
  imports:[NgIf, MatCardModule, MatButtonModule, PageHeaderComponent, LoadingComponent],
  template:`<app-page-header title="Hồ sơ chuyên môn" subtitle="Thông tin bác sĩ do quản trị viên quản lý"></app-page-header>
    <app-loading *ngIf="loading" message="Đang tải hồ sơ bác sĩ..."></app-loading>
    <p *ngIf="!loading && error" role="alert">{{ error }} <button mat-button (click)="load()">Thử lại</button></p>
    <mat-card *ngIf="!loading && !error && profile">
      <mat-card-content>
        <h2>{{ profile.fullName }}</h2>
        <dl>
          <dt>Chuyên khoa</dt><dd>{{ profile.specialtyName || 'Chưa cập nhật' }}</dd>
          <dt>Bằng cấp / học vị</dt><dd>{{ profile.qualification || 'Chưa cập nhật' }}</dd>
          <dt>Giới thiệu</dt><dd class="description">{{ profile.description || 'Chưa cập nhật' }}</dd>
          <dt>Trạng thái hồ sơ</dt><dd>{{ profile.active === true ? 'Đang hoạt động' : profile.active === false ? 'Ngừng hoạt động' : 'Chưa xác định' }}</dd>
        </dl>
        <p *ngIf="profile.active === false" role="status">Bạn vẫn xem được lịch sử. Các thao tác tiếp nhận khám đang tạm khóa.</p>
        <p>Liên hệ quản trị viên nếu cần điều chỉnh thông tin chuyên môn.</p>
      </mat-card-content>
    </mat-card>`,
  styles:[`h2{font-size:20px;} dl{display:grid;grid-template-columns:170px minmax(0,1fr);gap:16px;} dt{color:#64748b;} dd{margin:0;overflow-wrap:anywhere;}.description{white-space:pre-wrap;} @media(max-width:600px){dl{grid-template-columns:1fr;gap:8px;}dd{margin-bottom:12px;}}`],
})
export class DoctorProfileComponent implements OnInit {
  profile: DoctorResponse | null = null;
  loading = false; error = '';
  constructor(private doctorService: DoctorService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.doctorService.getMine().subscribe({
      next: res => { this.profile = res.data; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Không thể tải hồ sơ bác sĩ. Vui lòng thử lại.'; },
    });
  }
}
