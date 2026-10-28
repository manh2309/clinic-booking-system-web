import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DoctorService } from '../../../../core/services/doctor.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DoctorAppointmentsComponent } from './doctor-appointments.component';

describe('Doctor appointment activity permissions', () => {
  let component: DoctorAppointmentsComponent;
  let doctorService: jasmine.SpyObj<DoctorService>;

  beforeEach(() => {
    doctorService = jasmine.createSpyObj<DoctorService>('DoctorService', ['getMine']);
    component = new DoctorAppointmentsComponent(
      jasmine.createSpyObj<AppointmentService>('AppointmentService', ['updateStatus']),
      doctorService,
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open'])
    );
  });

  it('requires a started visit as well as the start time and stops the clock on destroy', fakeAsync(() => {
    spyOn(component, 'refresh');
    const appt = {id: 1, doctorId: 2, status: 'CONFIRMED' as const,
      visit:{id:1,status:'IN_PROGRESS' as const,checkedInAt:new Date().toISOString()},
      startAt: new Date(Date.now() + 2000).toISOString(),
      endAt: new Date(Date.now() + 1802000).toISOString()};
    component.ngOnInit();
    expect(component.canComplete(appt)).toBeFalse();
    tick(2000);
    expect(component.canComplete(appt)).toBeTrue();
    expect(component.canMarkNoShow(appt)).toBeFalse();
    component.ngOnDestroy();
    const stopped = component.now;
    tick(2000);
    expect(component.now).toBe(stopped);
  }));

  it('keeps write actions unavailable until doctor status is known', () => {
    expect(component.canAct('PENDING')).toBeFalse();
  });

  it('filters on the server and resets pagination when status changes', () => {
    const appointments = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['getDoctorAppointments']);
    appointments.getDoctorAppointments.and.returnValue(of({code:1000, message:'Success', data:{
      content:[], page:0, size:10, totalElements:0, totalPages:0, last:true,
    }}));
    component = new DoctorAppointmentsComponent(appointments, doctorService,
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']));
    component.currentPage = 4;
    component.setStatusFilter('EXPIRED');
    expect(appointments.getDoctorAppointments).toHaveBeenCalledOnceWith(0, 10, 'EXPIRED');
  });

  it('returns to the preceding page if an update removes the last result on a page', () => {
    const appointments = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['getDoctorAppointments']);
    const page = {code:1000, message:'Success', data:{
      content:[], page:1, size:10, totalElements:10, totalPages:1, last:true,
    }};
    appointments.getDoctorAppointments.and.returnValues(of(page), of({...page, data:{...page.data, page:0}}));
    component = new DoctorAppointmentsComponent(appointments, doctorService,
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']));
    component.currentPage = 1;
    component.load();
    expect(component.currentPage).toBe(0);
    expect(appointments.getDoctorAppointments.calls.allArgs()).toEqual([[1, 10, undefined], [0, 10, undefined]]);
  });

  it('allows active doctors to process pending appointments but not finished ones', () => {
    doctorService.getMine.and.returnValue(of({
      code: 1000, message: 'Success', data: { id: 1, fullName: 'Doctor', active: true }
    }));
    component.loadActivity();
    expect(component.canAct('PENDING')).toBeTrue();
    expect(component.canAct('COMPLETED')).toBeFalse();
  });

  it('keeps inactive doctors in read-only mode', () => {
    doctorService.getMine.and.returnValue(of({
      code: 1000, message: 'Success', data: { id: 1, fullName: 'Doctor', active: false }
    }));
    component.loadActivity();
    expect(component.doctorActive).toBeFalse();
    expect(component.canAct('CONFIRMED')).toBeFalse();
  });

  it('revokes local write actions when refreshing status fails', () => {
    component.doctorActive = true;
    doctorService.getMine.and.returnValue(throwError(() => new Error('offline')));
    component.loadActivity();
    expect(component.activityError).toBeTrue();
    expect(component.canAct('PENDING')).toBeFalse();
  });

  it('does not offer completion or no-show for a future appointment', () => {
    component.doctorActive = true;
    const appt = {id: 1, doctorId: 2, status: 'CONFIRMED' as const,
      startAt: new Date(Date.now() + 3600000).toISOString(), endAt: new Date(Date.now() + 5400000).toISOString()};
    expect(component.canComplete(appt)).toBeFalse();
    expect(component.canMarkNoShow(appt)).toBeFalse();
    expect(component.canAct(appt.status, appt)).toBeFalse();
  });

  it('offers no-show only after the slot ends and labels closed states correctly', () => {
    const appt = {id: 1, doctorId: 2, status: 'CONFIRMED' as const,
      startAt: new Date(Date.now() - 3600000).toISOString(), endAt: new Date(Date.now() - 1800000).toISOString()};
    expect(component.canMarkNoShow(appt)).toBeTrue();
    expect(component.mapStatus('NO_SHOW')).toBe('no-show');
    expect(component.mapStatus('EXPIRED')).toBe('expired');
    component.doctorActive = true;
    expect(component.canAct('EXPIRED')).toBeFalse();
  });
});
