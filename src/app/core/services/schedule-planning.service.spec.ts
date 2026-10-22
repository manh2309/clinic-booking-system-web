import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SchedulePlanningService } from './schedule-planning.service';
import { environment } from '../../../environments/environment';
describe('Schedule planning contract', () => {
    let service: SchedulePlanningService;
    let http: HttpTestingController;
    beforeEach(() => { TestBed.configureTestingModule({ imports: [HttpClientTestingModule] }); service = TestBed.inject(SchedulePlanningService); http = TestBed.inject(HttpTestingController); });
    afterEach(() => http.verify());
    it('sends explicit cancellation confirmation for leave approval', () => {
        service.review(7, { decision: 'APPROVED', reason: 'Duyệt nghỉ', confirmCancellation: true }).subscribe();
        const req = http.expectOne(environment.apiBaseUrl + '/admin/leaves/7/review');
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body.confirmCancellation).toBeTrue();
        req.flush({ data: {} });
    });
    it('uses a separate owned route for withdrawing a pending request', () => { service.withdraw(9).subscribe(); const req = http.expectOne(environment.apiBaseUrl + '/doctors/me/leaves/9/withdraw'); expect(req.request.method).toBe('PATCH'); req.flush({ data: {} }); });
    it('applies the whole weekly pattern through one batch endpoint',()=>{
      const body={daysOfWeek:[1,2,3,4,5],windows:[{startTime:'08:00',endTime:'12:00'},{startTime:'13:00',endTime:'17:00'}],effectiveFrom:'2030-01-01',effectiveTo:'2030-03-01'};
      service.addWeeklyBatch(1,body).subscribe();const req=http.expectOne(environment.apiBaseUrl+'/admin/doctors/1/weekly-schedules/batch');expect(req.request.body).toEqual(body);expect(req.request.method).toBe('POST');req.flush({data:{}});
    });
});
