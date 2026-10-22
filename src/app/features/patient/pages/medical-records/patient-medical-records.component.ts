import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MedicalRecordService, MedicalRecordResponse } from '../../../../core/services/medical-record.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector:'app-patient-medical-records', standalone:true,
  imports:[NgIf, NgFor, DatePipe, MatButtonModule, MatCardModule, MatPaginatorModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template:`<app-page-header title="Kết quả khám" subtitle="Kết luận và hướng dẫn của bác sĩ sau mỗi lần khám"></app-page-header>
    <app-loading *ngIf="loading" message="Đang tải kết quả khám..."></app-loading>
    <div *ngIf="!loading && error" role="alert">{{ error }} <button mat-button (click)="load()">Thử lại</button></div>
    <ng-container *ngIf="!loading && !error">
      <app-empty-state *ngIf="!records.length" icon="folder_shared" title="Chưa có kết quả khám" message="Kết quả sẽ xuất hiện khi bác sĩ hoàn thành ca khám."></app-empty-state>
      <mat-card *ngFor="let record of records" class="record-card">
        <mat-card-content>
          <h2>Lịch hẹn #{{ record.appointmentId }} · {{ record.startAt | date:'dd/MM/yyyy HH:mm' }}</h2>
          <p>Bác sĩ {{ record.doctorName }}</p>
          <h3>Chẩn đoán</h3><p class="record-text">{{ record.diagnosis }}</p>
          <ng-container *ngIf="record.examinationNotes"><h3>Ghi nhận khi khám</h3><p class="record-text">{{ record.examinationNotes }}</p></ng-container>
          <ng-container *ngIf="record.treatmentAdvice"><h3>Hướng dẫn điều trị</h3><p class="record-text">{{ record.treatmentAdvice }}</p></ng-container>
        </mat-card-content>
      </mat-card>
      <mat-paginator *ngIf="total > pageSize" [length]="total" [pageIndex]="page" [pageSize]="pageSize" (page)="changePage($event)"></mat-paginator>
    </ng-container>`,
  styles:[`.record-card { margin-bottom:16px; } h2 {font-size:18px;} h3 {font-size:15px;margin-bottom:4px;} .record-text {white-space:pre-wrap;overflow-wrap:anywhere;}`],
})
export class PatientMedicalRecordsComponent implements OnInit {
  records: MedicalRecordResponse[] = [];
  loading = false; error = ''; page = 0; pageSize = 10; total = 0;
  constructor(private service: MedicalRecordService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.service.getMine(this.page, this.pageSize).subscribe({
      next: res => { this.records = res.data.content; this.total = res.data.totalElements; this.loading = false; },
      error: () => { this.loading = false; this.error = 'Không thể tải kết quả khám. Vui lòng thử lại.'; },
    });
  }
  changePage(event: PageEvent): void { this.page = event.pageIndex; this.pageSize = event.pageSize; this.load(); }
}
