import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AdminPlanningComponent } from './admin-planning.component';
import { DoctorService } from '../../../../core/services/doctor.service';
import { SchedulePlanningService } from '../../../../core/services/schedule-planning.service';
describe('Leave review screen', () => {
    beforeEach(async () => { await TestBed.configureTestingModule({ imports: [AdminPlanningComponent, NoopAnimationsModule], providers: [{ provide: DoctorService, useValue: { getAllForAdmin: () => of({ data: { content: [], last: true } }) } }, { provide: SchedulePlanningService, useValue: { all: () => of({ data: [] }) } }] }).compileComponents(); });
    for (const width of [390, 1440])
        it('requires acknowledgement of affected appointments at ' + width + 'px', () => {
            const fixture = TestBed.createComponent(AdminPlanningComponent);
            fixture.detectChanges();
            const c = fixture.componentInstance;
            c.selected = { id: 1, doctorId: 1, doctorName: 'Doctor', startAt: '2030-01-01T08:00:00', endAt: '2030-01-01T12:00:00', reason: 'Nghỉ', status: 'PENDING' };
            c.affected = [{ appointmentId: 2, patientAccountId: 3, patientName: 'Tên bệnh nhân rất dài '.repeat(8), startAt: '2030-01-01T09:00:00', status: 'PENDING' }];
            c.reviewReason = 'Đồng ý nghỉ';
            const host = fixture.nativeElement as HTMLElement;
            host.style.display = 'block';
            host.style.width = width + 'px';
            fixture.detectChanges();
            const approve = Array.from(host.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Duyệt nghỉ')!;
            expect(approve.disabled).toBeTrue();
            c.confirmCancellation = true;
            fixture.detectChanges();
            expect(approve.disabled).toBeFalse();
            expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth + 1);
            fixture.destroy();
        });
    for(const width of [390,1440]) it('renders multi-day and two-window form at '+width+'px',async()=>{
      const fixture=TestBed.createComponent(AdminPlanningComponent);fixture.detectChanges();fixture.componentInstance.doctorId=1;
      const host=fixture.nativeElement as HTMLElement;host.style.display='block';host.style.width=width+'px';fixture.detectChanges();await fixture.whenStable();fixture.detectChanges();
      expect(host.querySelectorAll('.day-choice input[type=checkbox]').length).toBe(7);
      expect(host.querySelectorAll('.time-row').length).toBe(2);
      expect(host.textContent).toContain('Áp dụng lịch tuần');expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth+1);fixture.destroy();
    });
});

describe('Weekly batch submission',()=>{
 let service:jasmine.SpyObj<SchedulePlanningService>;let component:AdminPlanningComponent;
 beforeEach(()=>{service=jasmine.createSpyObj('planning',['addWeeklyBatch','weekly']);service.weekly.and.returnValue(of({code:1000,message:'',data:[]}));component=new AdminPlanningComponent(service,{} as DoctorService);component.doctorId=1;});
 it('submits weekdays and both windows once and reports skipped templates',()=>{
  service.addWeeklyBatch.and.returnValue(of({code:1000,message:'',data:{added:9,skipped:1,created:40,conflicts:[]}}));component.add();
  expect(service.addWeeklyBatch).toHaveBeenCalledTimes(1);const request=service.addWeeklyBatch.calls.mostRecent().args[1];
  expect(request.daysOfWeek).toEqual([1,2,3,4,5]);expect(request.windows).toEqual([{startTime:'08:00',endTime:'12:00'},{startTime:'13:00',endTime:'17:00'}]);expect(component.message).toContain('bỏ qua 1');
 });
 it('rejects overlapping windows without sending requests',()=>{component.windows=[{startTime:'08:00',endTime:'12:00'},{startTime:'11:00',endTime:'15:00'}];component.add();expect(service.addWeeklyBatch).not.toHaveBeenCalled();expect(component.error).toContain('không được trùng');});
 it('requires at least one day',()=>{component.selectedDays=[];component.add();expect(service.addWeeklyBatch).not.toHaveBeenCalled();expect(component.error).toContain('ít nhất');});
});
