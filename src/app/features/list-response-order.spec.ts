import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppointmentService } from '../core/services/appointment.service';
import { DoctorService } from '../core/services/doctor.service';
import { MedicalRecordService } from '../core/services/medical-record.service';
import { NotificationService } from '../core/services/notification.service';
import { AdminAppointmentsComponent } from './admin/pages/appointments/admin-appointments.component';
import { DoctorAppointmentsComponent } from './doctor/pages/appointments/doctor-appointments.component';
import { PatientAppointmentsComponent } from './patient/pages/appointments/patient-appointments.component';
import { PatientMedicalRecordsComponent } from './patient/pages/medical-records/patient-medical-records.component';
import { PatientNotificationsComponent } from './patient/pages/notifications/patient-notifications.component';

for (const kind of ['admin appointments','doctor appointments','patient appointments','medical records','notifications']) {
  describe(`Response order for ${kind}`, () => {
    let component: any;
    let old: Subject<any>;
    let latest: Subject<any>;
    let load: () => void;
    let items: () => {id:number}[];
    beforeEach(() => {
      old = new Subject<any>(); latest = new Subject<any>();
      const get = jasmine.createSpy('list').and.returnValues(old,latest);
      const snack = jasmine.createSpyObj<MatSnackBar>('snack',['open']);
      const dialog = jasmine.createSpyObj<MatDialog>('dialog',['open']);
      const router = {url:'/patient/notifications'} as Router;
      if (kind === 'admin appointments') component = new AdminAppointmentsComponent({getAdminAppointments:get} as unknown as AppointmentService,snack,dialog);
      if (kind === 'doctor appointments') component = new DoctorAppointmentsComponent({getDoctorAppointments:get} as unknown as AppointmentService,{} as DoctorService,snack);
      if (kind === 'patient appointments') component = new PatientAppointmentsComponent({getMine:get} as unknown as AppointmentService,dialog,snack,router);
      if (kind === 'medical records') component = new PatientMedicalRecordsComponent({getMine:get} as unknown as MedicalRecordService);
      if (kind === 'notifications') component = new PatientNotificationsComponent({getMine:get,changed:new Subject<void>()} as unknown as NotificationService,router);
      load = () => kind === 'patient appointments' ? component.loadAppointments() : component.load();
      items = () => component.appointments ?? component.records ?? component.items;
    });
    const page = (id:number) => ({code:1000,message:'',data:{content:[{id}],totalElements:1,page:0,size:10,totalPages:1,last:true}});
    it('keeps the newest page when the earlier response arrives last', () => {
      load(); load(); latest.next(page(2)); old.next(page(1));
      expect(items().map(x=>x.id)).toEqual([2]);
    });
    it('does not replace a successful newer page with an earlier network error', () => {
      load(); load(); latest.next(page(2)); old.error({error:{message:'Lỗi của lần tải cũ'}});
      expect(items().map(x=>x.id)).toEqual([2]);
      expect(!!(component.hasError || component.error)).toBeFalse();
    });
  });
}
