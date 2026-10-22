import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule,HttpTestingController } from '@angular/common/http/testing';
import { DoctorService } from './doctor.service';
import { environment } from '../../../environments/environment';
describe('Doctor available date contract',()=>{
 it('requests a bounded date range from the public doctor namespace',()=>{
  TestBed.configureTestingModule({imports:[HttpClientTestingModule]});const service=TestBed.inject(DoctorService);const http=TestBed.inject(HttpTestingController);
  service.getAvailableDates(4,'2030-01-01',30).subscribe();const req=http.expectOne(r=>r.url===environment.apiBaseUrl+'/doctors/4/available-dates');expect(req.request.params.get('from')).toBe('2030-01-01');expect(req.request.params.get('days')).toBe('30');expect(req.request.method).toBe('GET');req.flush({data:[]});http.verify();
 });
});
