import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of,throwError } from 'rxjs';
import { DoctorService } from '../../../../core/services/doctor.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PatientBookingComponent } from './patient-booking.component';
describe('Booking date discovery rendering',()=>{
 let doctor:any;
 beforeEach(async()=>{doctor={getById:()=>of({data:{id:1,fullName:'Bác sĩ thử nghiệm',active:true}}),getAvailableDates:()=>of({data:[{date:'2090-10-26',availableSlots:8}]}),getAvailableSlots:()=>of({data:[{id:1,startAt:'2090-10-26T09:00:00',endAt:'2090-10-26T09:30:00'}]})};
 await TestBed.configureTestingModule({imports:[PatientBookingComponent,RouterTestingModule,NoopAnimationsModule],providers:[{provide:ActivatedRoute,useValue:{snapshot:{paramMap:{get:()=> '1'}}}},{provide:DoctorService,useValue:doctor},{provide:AppointmentService,useValue:{}}]}).compileComponents();});
 for(const width of [390,1440])it('shows the next date and slots at '+width+'px',async()=>{
  const fixture=TestBed.createComponent(PatientBookingComponent);const host=fixture.nativeElement as HTMLElement;host.style.display='block';host.style.width=width+'px';fixture.detectChanges();await fixture.whenStable();fixture.detectChanges();
  expect(host.textContent).toContain('1 chỗ');expect(host.textContent).toContain('09:00');expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth+1);fixture.destroy();
 });
 it('shows retry rather than no free slots when loading fails',()=>{doctor.getAvailableSlots=()=>throwError(()=>new Error('offline'));const fixture=TestBed.createComponent(PatientBookingComponent);fixture.detectChanges();expect(fixture.nativeElement.textContent).toContain('Không tải được khung giờ');expect(fixture.nativeElement.textContent).not.toContain('Không có khung giờ trống trong ngày này');fixture.destroy();});
});
