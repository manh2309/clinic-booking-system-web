import { of, throwError } from 'rxjs';
import { PatientMedicalRecordsComponent } from './patient-medical-records.component';
import { MedicalRecordService } from '../../../../core/services/medical-record.service';

describe('Patient result list', () => {
  it('keeps loading errors distinct from an empty result list', () => {
    const service = jasmine.createSpyObj<MedicalRecordService>('MedicalRecordService', ['getMine']);
    service.getMine.and.returnValue(throwError(() => new Error('offline')));
    const component = new PatientMedicalRecordsComponent(service); component.load();
    expect(component.loading).toBeFalse(); expect(component.error).not.toBe('');
  });
  it('uses the requested page and total from the server', () => {
    const service = jasmine.createSpyObj<MedicalRecordService>('MedicalRecordService', ['getMine']);
    service.getMine.and.returnValue(of({code:1000, message:'Success', data:{content:[], page:1, size:10, totalElements:15, totalPages:2, last:true}}));
    const component = new PatientMedicalRecordsComponent(service);
    component.changePage({pageIndex:1, pageSize:10, length:15});
    expect(service.getMine).toHaveBeenCalledOnceWith(1, 10); expect(component.total).toBe(15);
  });
});
