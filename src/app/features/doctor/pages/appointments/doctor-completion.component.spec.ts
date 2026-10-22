import { of, Subject, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { AppointmentResponse } from '../../../../core/models/domain.model';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { DoctorAppointmentsComponent } from './doctor-appointments.component';

describe('Doctor records and completion', () => {
  let component: DoctorAppointmentsComponent;
  let service: jasmine.SpyObj<AppointmentService>;
  const appt: AppointmentResponse = {id:1, doctorId:1, status:'CONFIRMED',
    startAt:new Date(Date.now()-60000).toISOString(), endAt:new Date(Date.now()+60000).toISOString()};
  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['complete', 'updateStatus', 'getDoctorRecord', 'getDoctorAppointments']);
    component = new DoctorAppointmentsComponent(service, jasmine.createSpyObj<DoctorService>('DoctorService', ['getMine']),
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']));
    component.doctorActive = true;
  });
  it('opens the result form instead of using the old status update', () => {
    component.updateStatus(appt, 'COMPLETED');
    expect(component.recordTarget?.id).toBe(1);
    expect(service.updateStatus).not.toHaveBeenCalled();
  });
  it('requires non-blank diagnosis and prevents two simultaneous submissions', () => {
    service.complete.and.returnValue(new Subject<ApiResponse<AppointmentResponse>>());
    component.openCompletion(appt);
    component.recordForm.controls.diagnosis.setValue('   ');
    component.submitCompletion();
    expect(service.complete).not.toHaveBeenCalled();
    component.recordForm.controls.diagnosis.setValue('  Kết quả kiểm thử  ');
    component.submitCompletion(); component.submitCompletion();
    expect(service.complete).toHaveBeenCalledOnceWith(1, {diagnosis:'Kết quả kiểm thử', examinationNotes:'', treatmentAdvice:''});
  });
  it('retains entered results after a failed save', () => {
    service.complete.and.returnValue(throwError(() => new Error('offline')));
    component.openCompletion(appt); component.recordForm.controls.diagnosis.setValue('Nội dung đã nhập');
    component.submitCompletion();
    expect(component.recordForm.controls.diagnosis.value).toBe('Nội dung đã nhập');
    expect(component.recordError).not.toBe('');
    expect(component.updatingIds.size).toBe(0);
  });
  it('keeps inactive doctors from recording results', () => {
    component.doctorActive = false; component.openCompletion(appt);
    expect(component.recordTarget).toBeNull();
  });
  it('does not show a late result after the panel has been closed', () => {
    const request = new Subject<any>(); service.getDoctorRecord.and.returnValue(request);
    component.viewRecord({...appt, status:'COMPLETED'}); component.closeRecord();
    request.next({code:1000, data:{diagnosis:'Old response'}});
    expect(component.recordView).toBeNull(); expect(component.recordTarget).toBeNull();
  });
});
