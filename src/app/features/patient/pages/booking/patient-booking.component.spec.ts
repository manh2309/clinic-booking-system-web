import { Subject, of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { SlotResponse } from '../../../../core/models/domain.model';
import { DoctorService } from '../../../../core/services/doctor.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PatientBookingComponent } from './patient-booking.component';

describe('Booking date changes', () => {
  let component: PatientBookingComponent;
  let doctor: jasmine.SpyObj<DoctorService>;
  let appointments: jasmine.SpyObj<AppointmentService>;

  beforeEach(() => {
    doctor = jasmine.createSpyObj<DoctorService>('DoctorService', ['getAvailableSlots','getAvailableDates']);
    appointments = jasmine.createSpyObj<AppointmentService>('AppointmentService', ['book']);
    component = new PatientBookingComponent({} as ActivatedRoute,
      jasmine.createSpyObj<Router>('Router', ['navigate']), doctor, appointments,
      jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']));
    component.doctor = {id:1,fullName:'Doctor',active:true};
  });

  afterEach(() => component.ngOnDestroy());

  it('keeps the selected day slots when an older request responds last', () => {
    const first = new Subject<ApiResponse<SlotResponse[]>>();
    const second = new Subject<ApiResponse<SlotResponse[]>>();
    doctor.getAvailableSlots.and.returnValues(first.asObservable(), second.asObservable());
    component.selectedDate = new Date(2030, 9, 17); component.onDateChange();
    component.selectedDate = new Date(2030, 9, 18); component.onDateChange();
    const slot = {id:2,startAt:'2030-10-18T09:00:00',endAt:'2030-10-18T09:30:00'};
    second.next({code:1000,message:'Success',data:[slot]});
    first.next({code:1000,message:'Success',data:[{...slot,id:1,startAt:'2030-10-17T09:00:00'}]});
    expect(component.slots).toEqual([slot]);
    expect(component.isLoadingSlots).toBeFalse();
  });

  it('clears old slots immediately while loading another day', () => {
    doctor.getAvailableSlots.and.returnValue(new Subject<ApiResponse<SlotResponse[]>>());
    component.slots = [{id:1,startAt:'2030-10-17T09:00:00',endAt:'2030-10-17T09:30:00'}];
    component.selectedSlot = component.slots[0];
    component.selectedDate = new Date(2030, 9, 18);
    component.onDateChange();
    expect(component.selectedSlot).toBeNull();
    expect(component.slots).toEqual([]);
    expect(component.isLoadingSlots).toBeTrue();
  });

  it('does not send a slot from a different date', () => {
    doctor.getAvailableSlots.and.returnValue(of({code:1000,message:'Success',data:[]}));
    component.selectedDate = new Date(2030, 9, 18);
    component.selectedSlot = {id:1,startAt:'2030-10-17T09:00:00',endAt:'2030-10-17T09:30:00'};
    component.confirmBooking();
    expect(appointments.book).not.toHaveBeenCalled();
    expect(component.selectedSlot).toBeNull();
  });
  it('automatically opens the earliest available day',()=>{
    doctor.getAvailableDates.and.returnValue(of({code:1000,message:'',data:[{date:'2090-10-26',availableSlots:8}]}));
    doctor.getAvailableSlots.and.returnValue(of({code:1000,message:'',data:[]}));component.loadAvailableDates(true);
    expect(component.selectedDate?.getFullYear()).toBe(2090);expect(component.selectedDate?.getDate()).toBe(26);
    expect(doctor.getAvailableSlots).toHaveBeenCalledWith(1,'2090-10-26');
  });
  it('does not overwrite a manually selected date when discovery responds late',()=>{
    const pending=new Subject<any>();doctor.getAvailableDates.and.returnValue(pending);
    doctor.getAvailableSlots.and.returnValue(of({code:1000,message:'',data:[]}));component.loadAvailableDates(true);
    component.chooseDate('2090-10-27');pending.next({data:[{date:'2090-10-26',availableSlots:8}]});
    expect(component.selectedDate?.getDate()).toBe(27);
  });
  it('keeps API errors separate from empty slots',()=>{
    doctor.getAvailableSlots.and.returnValue(throwError(()=>new Error('offline')));component.chooseDate('2090-10-26');
    expect(component.slotsError).toContain('Không tải được');expect(component.isLoadingSlots).toBeFalse();
  });
  it('does not choose an expired slot even if it remains cached',()=>{
    const slot={id:1,startAt:'2020-01-01T09:00:00',endAt:'2020-01-01T09:30:00'};component.slots=[slot];component.selectSlot(slot);expect(component.selectedSlot).toBeNull();
  });
});
