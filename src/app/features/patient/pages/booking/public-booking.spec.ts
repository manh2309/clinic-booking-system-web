import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PatientBookingComponent } from './patient-booking.component';

describe('Public booking handoff', () => {
  let auth: any, router: any, doctors: any, appointments: any, component: PatientBookingComponent;
  const slot = {id: 12, startAt: '2090-10-26T09:00:00', endAt: '2090-10-26T09:30:00'};
  function setup(restored = true, available = true) {
    auth = jasmine.createSpyObj('auth', ['isAuthenticated', 'hasRole', 'redirectToHome']);
    auth.isAuthenticated.and.returnValue(false);
    router = jasmine.createSpyObj('router', ['navigate']);
    doctors = {getById: () => of({data: {id: 1, fullName: 'Doctor'}}), getAvailableDates: () => of({data: []}), getAvailableSlots: jasmine.createSpy().and.returnValue(of({data: available ? [slot] : []}))};
    appointments = jasmine.createSpyObj('appointments', ['book']);
    const route = {snapshot: {paramMap: {get: () => '1'}, queryParams: restored ? {date: '2090-10-26', slotId: '12'} : {}}};
    component = new PatientBookingComponent(route as unknown as ActivatedRoute, router, doctors, appointments, jasmine.createSpyObj('snack', ['open']), auth as AuthService);
    component.ngOnInit();
  }
  afterEach(() => component.ngOnDestroy());
  it('refetches a saved selection without booking and sends guests to login', () => {
    setup();
    expect(doctors.getAvailableSlots).toHaveBeenCalledWith(1, '2090-10-26');
    expect(component.selectedSlot?.id).toBe(12);
    expect(appointments.book).not.toHaveBeenCalled();
    component.confirmBooking();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {queryParams: {returnUrl: '/patient/booking/1?date=2090-10-26&slotId=12'}});
    expect(appointments.book).not.toHaveBeenCalled();
  });
  it('explains a slot taken during login and clears the selection', () => {
    setup(true, false);
    expect(component.selectedSlot).toBeNull();
    expect(component.bookingNotice).toContain('không còn trống');
    expect(appointments.book).not.toHaveBeenCalled();
  });
  it('requires explicit confirmation after patient login', () => {
    setup(); auth.isAuthenticated.and.returnValue(true); auth.hasRole.and.returnValue(true);
    appointments.book.and.returnValue(of({data: {}}));
    expect(appointments.book).not.toHaveBeenCalled();
    component.confirmBooking(); expect(appointments.book).toHaveBeenCalledOnceWith({slotId: 12});
  });
  it('takes staff to their workspace without booking', () => {
    setup(); auth.isAuthenticated.and.returnValue(true); auth.hasRole.and.returnValue(false);
    component.confirmBooking(); expect(auth.redirectToHome).toHaveBeenCalled(); expect(appointments.book).not.toHaveBeenCalled();
  });
});
