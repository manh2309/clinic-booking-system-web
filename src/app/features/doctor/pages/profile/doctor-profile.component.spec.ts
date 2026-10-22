import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { DoctorService } from '../../../../core/services/doctor.service';
import { DoctorProfileComponent } from './doctor-profile.component';

describe('Doctor self profile', () => {
  let service: jasmine.SpyObj<DoctorService>;
  beforeEach(async () => {
    service = jasmine.createSpyObj<DoctorService>('DoctorService', ['getMine']);
    service.getMine.and.returnValue(of({code:1000, message:'Success', data:{id:1, fullName:'Bác sĩ thực tế', specialtyName:'Tim mạch', qualification:'Chuyên khoa', description:'Nội dung hồ sơ '.repeat(100), active:false}}));
    await TestBed.configureTestingModule({imports:[DoctorProfileComponent, RouterTestingModule], providers:[{provide:DoctorService,useValue:service}]}).compileComponents();
  });
  for (const width of [390,1440]) {
    it(`reads the self profile and wraps long content at ${width}px`, () => {
      const fixture = TestBed.createComponent(DoctorProfileComponent);
      const host = fixture.nativeElement as HTMLElement; host.style.display='block';host.style.width=width+'px';fixture.detectChanges();
      expect(host.textContent).toContain('Bác sĩ thực tế'); expect(host.textContent).toContain('Ngừng hoạt động');
      expect(host.textContent).not.toContain('đang phát triển'); expect(host.querySelector('form')).toBeNull();
      expect(host.scrollWidth).toBeLessThanOrEqual(host.clientWidth+1); fixture.destroy();
    });
  }
  it('shows a load error and allows retry without displaying a false profile', () => {
    service.getMine.and.returnValue(throwError(() => new Error('offline')));
    const fixture = TestBed.createComponent(DoctorProfileComponent);fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mat-card')).toBeNull();
    service.getMine.and.returnValue(of({code:1000,message:'Success',data:{id:1,fullName:'Bác sĩ mới',active:true}}));
    fixture.nativeElement.querySelector('button').click();fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Bác sĩ mới');fixture.destroy();
  });
});
