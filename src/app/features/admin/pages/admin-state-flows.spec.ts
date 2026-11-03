import { DirectoryService } from '../../../core/services/directory.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { AdminService } from '../../../core/services/admin.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { SpecialtyService } from '../../../core/services/specialty.service';
import { AdminDoctorsComponent } from './doctors/admin-doctors.component';
import { AdminSpecialtiesComponent } from './specialties/admin-specialties.component';

for (const kind of ['doctor', 'specialty'] as const) {
  describe(`Admin ${kind} state changes`, () => {
    let fixture: ComponentFixture<any>;
    let response: Subject<any>;
    let admin: jasmine.SpyObj<AdminService>;
    let specialties: jasmine.SpyObj<SpecialtyService>;
    let snackBar: jasmine.SpyObj<MatSnackBar>;
    let record: any;
    beforeEach(async () => {
      record = {id: 2, fullName: 'Bác sĩ kiểm thử', name: 'Chuyên khoa thử', specialtyId: 1, active: true};
      response = new Subject<any>();
      admin = jasmine.createSpyObj('admin', ['updateDoctorStatus', 'createDoctor', 'updateDoctor']);
      admin.updateDoctorStatus.and.returnValue(response);
      admin.createDoctor.and.returnValue(response);
      admin.updateDoctor.and.returnValue(response);
      specialties = jasmine.createSpyObj('specialties', ['getAll', 'getAllForAdmin', 'updateStatus', 'create', 'update']);
      specialties.getAll.and.returnValue(of({code:1000,message:'',data:[]}));
      specialties.getAllForAdmin.and.returnValue(of({code:1000,message:'',data:[record]}));
      specialties.updateStatus.and.returnValue(response);
      specialties.create.and.returnValue(response);
      specialties.update.and.returnValue(response);
      snackBar = jasmine.createSpyObj('snackBar', ['open']);
      const component = kind === 'doctor' ? AdminDoctorsComponent : AdminSpecialtiesComponent;
      await TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers: [
          {provide:DirectoryService,useValue:{search:()=>of({data:{content:[record],totalElements:1}})}},
          {provide: AdminService, useValue: admin},
          {provide: SpecialtyService, useValue: specialties},
          {provide: DoctorService, useValue: {getAllForAdmin: () => of({data:{content:[record],totalElements:1}})}},
        ],
      }).overrideComponent(component, {add:{providers:[{provide:MatSnackBar,useValue:snackBar}]}}).compileComponents();
      fixture = TestBed.createComponent<any>(component);
      fixture.detectChanges();
    });
    const click = (f: ComponentFixture<any>) => {
      f.debugElement.query(By.directive(MatSlideToggle)).nativeElement.querySelector('button').click();
      f.detectChanges();
    };
    const control = (f: ComponentFixture<any>): MatSlideToggle => f.debugElement.query(By.directive(MatSlideToggle)).componentInstance;

    for (const active of [true, false]) {
      it(`preserves ${active ? 'active' : 'inactive'} status if the server rejects the change`, () => {
        record.active = active; fixture.detectChanges();
        click(fixture);
        expect(control(fixture).checked).toBe(active);
        expect(control(fixture).disabled).toBeTrue();
        response.error({error:{message:'Không thể thay đổi trạng thái'}});
        fixture.detectChanges();
        expect(record.active).toBe(active);
        expect(control(fixture).checked).toBe(active);
        expect(control(fixture).disabled).toBeFalse();
        expect(snackBar.open).toHaveBeenCalledWith('Không thể thay đổi trạng thái','Đóng',jasmine.any(Object));
      });
    }
    it('sends one update and changes the visible switch only after success', () => {
      click(fixture); click(fixture);
      expect(kind === 'doctor' ? admin.updateDoctorStatus : specialties.updateStatus).toHaveBeenCalledTimes(1);
      expect(record.active).toBeTrue();
      response.next({code:1000,message:'Success'}); response.complete(); fixture.detectChanges();
      expect(record.active).toBeFalse(); expect(control(fixture).checked).toBeFalse(); expect(control(fixture).disabled).toBeFalse();
    });
    it('keeps the original form and prevents another submission while saving', () => {
      const component = fixture.componentInstance;
      component.openAddForm();
      if (kind === 'doctor') {
        component.doctorForm.setValue({fullName:'Bác sĩ thử',username:'qa_test',email:'qa@example.invalid',password:'qa_password',specialtyId:1,qualification:'',description:'',phone:''});
      } else {
        component.specialtyForm.setValue({name:'Chuyên khoa thử',description:''});
      }
      component.onSubmit(); component.onSubmit(); component.startEdit(record);
      expect(kind === 'doctor' ? admin.createDoctor : specialties.create).toHaveBeenCalledTimes(1);
      expect(component.editMode).toBeFalse();
      response.error({error:{message:'Chưa lưu được'}}); fixture.detectChanges();
      expect(component.isSaving).toBeFalse(); expect(component.isFormOpen).toBeTrue();
      expect(kind === 'doctor' ? component.doctorForm.value.fullName : component.specialtyForm.value.name).toContain('thử');
    });
    if (kind === 'doctor') {
      it('reports a failed specialty lookup and recovers when retried', () => {
        const c = fixture.componentInstance as AdminDoctorsComponent;
        specialties.getAll.and.returnValue(throwError(()=>new Error('offline')));
        c.openAddForm(); c.loadSpecialties(); fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Không tải được danh sách chuyên khoa');
        specialties.getAll.and.returnValue(of({code:1000,message:'',data:[]})); c.loadSpecialties();
        expect(c.specialtiesError).toBe('');
      });
      it('does not send an invalid doctor edit', () => {
        const c = fixture.componentInstance as AdminDoctorsComponent;
        c.startEdit(record); c.doctorForm.patchValue({fullName:''}); c.onSubmit();
        expect(admin.updateDoctor).not.toHaveBeenCalled(); expect(c.isSaving).toBeFalse();
      });
    }
  });
}
