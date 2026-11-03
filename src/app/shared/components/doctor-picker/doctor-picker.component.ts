import {Component,Input,Output,EventEmitter,OnInit,OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {Subscription} from 'rxjs';
import {DoctorService} from '../../../core/services/doctor.service';
import {DoctorResponse} from '../../../core/models/domain.model';
@Component({selector:'app-doctor-picker',standalone:true,imports:[CommonModule,FormsModule,MatButtonModule],template:`
 <div class="field-label">Bác sĩ</div><details #picker><summary>{{selectedName}}</summary><div class="picker">
 <label>Tìm bác sĩ<input [(ngModel)]="keyword" maxlength="100" placeholder="Tên hoặc chuyên khoa" (keydown.enter)="$event.preventDefault();search()" /></label><button mat-button type="button" (click)="search()" [disabled]="loading">Tìm</button>
 <select aria-label="Chọn bác sĩ" [ngModel]="value" (ngModelChange)="choose($event);picker.open=false"><option [ngValue]="null">Tất cả bác sĩ</option><option *ngFor="let d of options" [ngValue]="d.id">{{d.fullName}} · {{d.specialtyName}}</option></select>
 <div class="pages"><button mat-button type="button" (click)="load(page-1)" [disabled]="loading||page===0">Trước</button><span>Trang {{page+1}}</span><button mat-button type="button" (click)="load(page+1)" [disabled]="loading||last">Sau</button></div><p role="alert" *ngIf="error">{{error}}</p></div></details>

 `,styles:[`:host{display:block;min-width:0;position:relative}.field-label,label{font-size:13px;color:#475569}.field-label{margin-bottom:8px}summary{min-height:44px;box-sizing:border-box;padding:12px;border:1px solid #cbd5e1;border-radius:9px;background:white;font-size:13px;cursor:pointer;overflow-wrap:anywhere}.picker{position:absolute;z-index:20;top:100%;left:0;width:320px;max-width:calc(100vw - 70px);box-sizing:border-box;display:flex;gap:8px;flex-wrap:wrap;padding:14px;background:white;border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 12px 30px #0f172a20}label{display:grid;gap:7px;flex:1;min-width:0}input,select{font:inherit;padding:10px;border:1px solid #cbd5e1;border-radius:8px;background:white;width:100%;box-sizing:border-box}select{font-size:13px}.pages{display:flex;align-items:center;justify-content:space-between;width:100%;font-size:12px}p{color:#b91c1c}`]})export class DoctorPickerComponent implements OnInit,OnDestroy {
 @Input() value:number|null=null;@Output() valueChange=new EventEmitter<number|null>();
 options:DoctorResponse[]=[];keyword='';applied='';page=0;last=true;loading=false;error='';private request?:Subscription;private selected?:DoctorResponse;
 get selectedName(){return this.options.find(d=>d.id===this.value)?.fullName || (this.value ? 'Bác sĩ #'+this.value : 'Tất cả bác sĩ');}
 choose(value:number|null){this.value=value;this.valueChange.emit(value);}
 constructor(private service:DoctorService){}ngOnInit(){this.load(0);}ngOnDestroy(){this.request?.unsubscribe();}
 search(){this.applied=this.keyword.trim();this.load(0);}
 load(page:number){this.selected=this.options.find(d=>d.id===this.value)||this.selected;this.request?.unsubscribe();this.loading=true;this.error='';this.request=this.service.getAllForAdmin(page,10,this.applied).subscribe({next:r=>{this.options=r.data.content;if(this.selected?.id===this.value&&!this.options.some(d=>d.id===this.value))this.options=[this.selected,...this.options];this.page=page;this.last=r.data.last;this.loading=false;},error:()=>{this.loading=false;this.error='Không tải được bác sĩ. Hãy thử lại.'}});}
}
