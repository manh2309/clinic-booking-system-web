import { of,throwError } from 'rxjs';
import { DoctorLeavesComponent } from './doctor-leaves.component';
import { SchedulePlanningService } from '../../../../core/services/schedule-planning.service';
describe('Leave date and 24-hour input',()=>{
 let c:DoctorLeavesComponent;let service:jasmine.SpyObj<SchedulePlanningService>;
 beforeEach(()=>{service=jasmine.createSpyObj('planning',['request','mine']);service.mine.and.returnValue(of({code:1000,message:'',data:[]}));c=new DoctorLeavesComponent(service);c.startDate='2090-10-26';c.endDate=c.startDate;c.reason='Nghỉ';});
 it('distinguishes noon from midnight and prevents reversed interval',()=>{c.endTime='00:00';c.submit();expect(c.error).toContain('kết thúc phải sau');expect(service.request).not.toHaveBeenCalled();});
 it('explains a past start instead of reporting a generic failure',()=>{c.startDate='2020-01-01';c.endDate=c.startDate;c.submit();expect(c.error).toContain('phải ở tương lai');expect(service.request).not.toHaveBeenCalled();});
 it('rejects incomplete dates and unsupported minutes',()=>{c.startDate='';c.submit();expect(c.error).toContain('Chọn đủ');c.startDate=c.endDate;c.startTime='08:20';c.submit();expect(c.error).toContain('mốc 30 phút');expect(service.request).not.toHaveBeenCalled();});
 it('sends clinic civil time with noon preserved and retains values on failure',()=>{service.request.and.returnValue(throwError(()=>({error:{message:'Chưa gửi được'}})));c.submit();expect(service.request).toHaveBeenCalledWith({startAt:'2090-10-26T08:00:00',endAt:'2090-10-26T12:00:00',reason:'Nghỉ'});expect(c.endTime).toBe('12:00');expect(c.startDate).toBe('2090-10-26');expect(c.error).toBe('Chưa gửi được');expect(c.busy).toBeFalse();});
 it('copies the first selected start date into the empty end date',()=>{c.endDate='';c.changeStartDate('2090-10-27');expect(c.endDate).toBe('2090-10-27');expect(c.times.length).toBe(48);expect(c.times).toContain('12:00');});
});
