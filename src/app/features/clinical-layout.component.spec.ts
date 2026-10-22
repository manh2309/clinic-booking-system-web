import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject } from 'rxjs';
import { DoctorAppointmentsComponent } from './doctor/pages/appointments/doctor-appointments.component';
import { PatientMedicalRecordsComponent } from './patient/pages/medical-records/patient-medical-records.component';
import { PatientNotificationsComponent } from './patient/pages/notifications/patient-notifications.component';
import { AppointmentService } from '../core/services/appointment.service';
import { DoctorService } from '../core/services/doctor.service';
import { MedicalRecordService } from '../core/services/medical-record.service';
import { NotificationService } from '../core/services/notification.service';

const result = {id:1, appointmentId:1, doctorId:1, doctorName:'Bác sĩ kiểm thử', startAt:'2030-01-01T10:00:00',
  diagnosis:'Nội dung kiểm thử '.repeat(100), examinationNotes:'Ghi nhận khi khám', treatmentAdvice:'Hướng dẫn kiểm thử', createdAt:'2030-01-01T10:30:00'};
const page = (content: any[]) => ({code:1000, message:'Success', data:{content, page:0, size:10, totalElements:content.length, totalPages:1, last:true}});

describe('Clinical screen rendering at content widths', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[DoctorAppointmentsComponent, PatientMedicalRecordsComponent, PatientNotificationsComponent, NoopAnimationsModule, RouterTestingModule],
      providers:[
        {provide:AppointmentService, useValue:{getDoctorAppointments:() => of(page([]))}},
        {provide:DoctorService, useValue:{getMine:() => of({data:{active:true}})}},
        {provide:MedicalRecordService, useValue:{getMine:() => of(page([result]))}},
        {provide:NotificationService, useValue:{getMine:() => of(page([{id:1, appointmentId:1, type:'APPOINTMENT_COMPLETED',
          title:'Đã có kết quả khám', message:'Thông báo kiểm thử '.repeat(100), read:false, createdAt:result.createdAt}])), changed:new Subject<void>()}},
        {provide:MatSnackBar, useValue:{open:() => undefined}},
      ],
    }).compileComponents();
  });
  for (const width of [390, 1440]) {
    it(`renders the result form without horizontal overflow at ${width}px`, () => {
      const fixture = TestBed.createComponent(DoctorAppointmentsComponent);
      const host = fixture.nativeElement as HTMLElement; host.style.display='block'; host.style.width=width+'px';
      fixture.detectChanges();
      fixture.componentInstance.openCompletion({id:1, doctorId:1, status:'CONFIRMED', startAt:new Date(Date.now()-60000).toISOString(), endAt:new Date(Date.now()+60000).toISOString()});
      fixture.detectChanges();
      expect(host.querySelectorAll('textarea').length).toBe(3);
      expect(host.textContent).toContain('Lưu kết quả và hoàn thành');
      expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth+1);
      fixture.destroy();
    });
    it(`renders long patient results and notifications at ${width}px`, () => {
      const records = TestBed.createComponent(PatientMedicalRecordsComponent);
      const host = records.nativeElement as HTMLElement; host.style.display='block'; host.style.width=width+'px'; records.detectChanges();
      expect(host.textContent).toContain('Ghi nhận khi khám'); expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth+1); records.destroy();
      const notices = TestBed.createComponent(PatientNotificationsComponent);
      const element = notices.nativeElement as HTMLElement; element.style.display='block'; element.style.width=width+'px'; notices.detectChanges();
      expect(element.textContent).toContain('Đánh dấu đã đọc'); expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth+1); notices.destroy();
    });
  }
});
