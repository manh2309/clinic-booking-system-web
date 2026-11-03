import {Component,Input,Output,EventEmitter,OnInit,OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {Subscription} from 'rxjs';
import {DoctorService} from '../../../core/services/doctor.service';
import {DoctorResponse} from '../../../core/models/domain.model';
@Component({selector:'app-doctor-picker',standalone:true,imports:[CommonModule,FormsModule,MatButtonModule],template:`
 <div class="picker"><label>Tìm bác sĩ<input [(ngModel)]="keyword" maxlength="100" placeholder="Tên hoặc chuyên khoa" (keydown.enter)="$event.preventDefault();search()" /></label><button mat-button (click)="search()" [disabled]="loading">Tìm</button>
 <label>Bác sĩ<select [ngModel]="value" (ngModelChange)="valueChange.emit($event)"><option [ngValue]="null">Tất cả bác sĩ</option><option *ngFor="let d of options" [ngValue]="d.id">{{d.fullName}} · {{d.specialtyName}}</option></select></label>
 <button mat-button (click)="load(page-1)" [disabled]="loading||page===0">Trước</button><span>Trang {{page+1}}</span><button mat-button (click)="load(page+1)" [disabled]="loading||last">Sau</button><p role="alert" *ngIf="error">{{error}}</p></div>
 `,styles:[`.picker{display:flex;gap:8px;align-items:end;flex-wrap:wrap}label{display:grid;gap:7px;font-size:13px}input,select{font:inherit;padding:11px;border:1px solid #cbd5e1;border-radius:8px;background:white;max-width:100%;box-sizing:border-box}p{color:#b91c1c}@media(max-width:600px){label{width:100%}}`]})
export class DoctorPickerComponent implements OnInit,OnDestroy {
 @Input() value:number|null=null;@Output() valueChange=new EventEmitter<number|null>();
 options:DoctorResponse[]=[];keyword='';applied='';page=0;last=true;loading=false;error='';private request?:Subscription;private selected?:DoctorResponse;
 constructor(private service:DoctorService){}ngOnInit(){this.load(0);}ngOnDestroy(){this.request?.unsubscribe();}
 search(){this.applied=this.keyword.trim();this.load(0);}
 load(page:number){this.selected=this.options.find(d=>d.id===this.value)||this.selected;this.request?.unsubscribe();this.loading=true;this.error='';this.request=this.service.getAllForAdmin(page,20,this.applied).subscribe({next:r=>{this.options=r.data.content;if(this.selected?.id===this.value&&!this.options.some(d=>d.id===this.value))this.options=[this.selected,...this.options];this.page=page;this.last=r.data.last;this.loading=false;},error:()=>{this.loading=false;this.error='Không tải được bác sĩ. Hãy thử lại.'}});}
}
