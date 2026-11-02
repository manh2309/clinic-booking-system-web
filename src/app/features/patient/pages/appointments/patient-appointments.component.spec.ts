import { of, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PatientAppointmentsComponent } from './patient-appointments.component';

describe('Patient appointment filters and cancellation', () => {
  let service: jasmine.SpyObj<AppointmentService>;
  let component: PatientAppointmentsComponent;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    service = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['getMine', 'cancel']);
    service.getMine.and.returnValue(of({code:1000, message:'Success', data:{
      content:[], page:0, size:10, totalElements:0, totalPages:0, last:true
    }}));
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    component = new PatientAppointmentsComponent(service,
      dialog,
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']),
      jasmine.createSpyObj<Router>('Router', ['navigate']));
  });

  it('starts the filtered query at page zero instead of filtering the current page locally', () => {
    component.currentPage = 4;
    component.setStatusFilter('EXPIRED');
    expect(service.getMine).toHaveBeenCalledOnceWith(0, component.pageSize, 'EXPIRED');
  });

  it('does not allow patients to cancel an appointment that already started', () => {
    expect(component.canCancel({id:1, doctorId:2, status:'CONFIRMED',
      startAt:new Date(Date.now() - 60000).toISOString(), endAt:new Date(Date.now() + 60000).toISOString()})).toBeFalse();
  });

  it('shows expired and no-show appointments as closed states', () => {
    expect(component.mapStatus('EXPIRED')).toBe('expired');
    expect(component.mapStatus('NO_SHOW')).toBe('no-show');
  });

  it('opens one confirmation and sends one cancellation while pending, preserving status on error', () => {
    const appointment: any = {id:7,doctorId:2,status:'CONFIRMED',startAt:'2099-01-01T08:00:00',endAt:'2099-01-01T08:30:00'};
    const confirmation = new Subject<boolean>(); const response = new Subject<any>();
    dialog.open.and.returnValue({afterClosed:()=>confirmation} as any); service.cancel.and.returnValue(response);
    component.cancelAppointment(appointment); component.cancelAppointment(appointment);
    expect(dialog.open).toHaveBeenCalledTimes(1);
    confirmation.next(true); component.cancelAppointment(appointment);
    expect(service.cancel).toHaveBeenCalledOnceWith(7);
    expect(component.cancelingIds.has(7)).toBeTrue();
    response.error({error:{message:'Bệnh nhân đã tiếp nhận'}});
    expect(appointment.status).toBe('CONFIRMED'); expect(component.cancelingIds.size).toBe(0);
    expect(service.getMine).toHaveBeenCalled();
  });

  it('rechecks reception after confirmation and skips an invalid cancellation', () => {
    const appointment: any = {id:7,doctorId:2,status:'CONFIRMED',startAt:'2099-01-01T08:00:00',endAt:'2099-01-01T08:30:00'};
    const confirmation = new Subject<boolean>();
    dialog.open.and.returnValue({afterClosed:()=>confirmation} as any);
    component.cancelAppointment(appointment); appointment.visit = {status:'WAITING'}; confirmation.next(true);
    expect(service.cancel).not.toHaveBeenCalled(); expect(component.cancelingIds.size).toBe(0);
  });

  it('releases the pending flag when the patient keeps the appointment', () => {
    const appointment: any = {id:7,doctorId:2,status:'PENDING',startAt:'2099-01-01T08:00:00',endAt:'2099-01-01T08:30:00'};
    dialog.open.and.returnValue({afterClosed:()=>of(false)} as any);
    component.cancelAppointment(appointment);
    expect(service.cancel).not.toHaveBeenCalled(); expect(component.cancelingIds.size).toBe(0);
  });
});
