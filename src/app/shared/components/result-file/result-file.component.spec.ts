import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule,HttpTestingController} from '@angular/common/http/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ResultFileComponent} from './result-file.component';
import {environment} from '../../../../environments/environment';
describe('Result PDF actions',()=>{
 beforeEach(()=>TestBed.configureTestingModule({imports:[ResultFileComponent,HttpClientTestingModule,NoopAnimationsModule]}));
 it('prevents duplicate requests and recovers after a failed download',()=>{
  const f=TestBed.createComponent(ResultFileComponent);const c=f.componentInstance;c.appointmentId=8;
  const http=TestBed.inject(HttpTestingController);c.get(false);c.get(false);
  const request=http.expectOne(environment.apiBaseUrl+'/patient/me/medical-records/8/pdf');expect(request.request.responseType).toBe('blob');
  request.flush(new Blob(),{status:500,statusText:'Error'});expect(c.busy).toBeFalse();expect(c.error).toContain('Không tải được');http.verify();f.destroy();
 });
 it('cancels an in-flight private result when leaving the screen',()=>{
  const f=TestBed.createComponent(ResultFileComponent);f.componentInstance.appointmentId=3;f.componentInstance.doctor=true;f.componentInstance.get(false);
  const req=TestBed.inject(HttpTestingController).expectOne(environment.apiBaseUrl+'/doctors/me/appointments/3/medical-record/pdf');f.destroy();expect(req.cancelled).toBeTrue();
 });
});
