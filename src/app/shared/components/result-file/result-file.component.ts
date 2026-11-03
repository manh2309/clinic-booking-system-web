import {Subscription} from 'rxjs';
import {Component,Input,OnDestroy} from '@angular/core';
import {NgIf} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import {environment} from '../../../../environments/environment';
@Component({selector:'app-result-file',standalone:true,imports:[NgIf,MatButtonModule],template:`<div class="file-actions"><button mat-stroked-button (click)="get(false)" [disabled]="busy">Tải phiếu PDF</button><button mat-button (click)="get(true)" [disabled]="busy">Mở bản in A4</button><span *ngIf="busy" role="status">Đang tạo phiếu...</span><span *ngIf="error" role="alert">{{error}}</span></div>`,styles:[`.file-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:14px 0}[role=alert]{color:#b91c1c}`]})
export class ResultFileComponent implements OnDestroy {
 @Input() appointmentId!:number;@Input() doctor=false;busy=false;error='';private urls:string[]=[];private request?:Subscription;private pendingTab:Window|null=null;
 constructor(private http:HttpClient){}
 get(print:boolean){if(this.busy)return;const tab=print?window.open('about:blank','_blank'):null;if(print&&!tab){this.error='Cho phép mở cửa sổ mới hoặc dùng nút Tải phiếu PDF.';return;}if(tab)tab.opener=null;this.pendingTab=tab;this.busy=true;this.error='';const url=this.doctor?`/doctors/me/appointments/${this.appointmentId}/medical-record/pdf`:`/patient/me/medical-records/${this.appointmentId}/pdf`;
  this.request=this.http.get(environment.apiBaseUrl+url,{responseType:'blob'}).subscribe({next:blob=>{this.pendingTab=null;this.busy=false;const objectUrl=URL.createObjectURL(blob);this.urls.push(objectUrl);if(tab){tab.location.href=objectUrl;}else{const a=document.createElement('a');a.href=objectUrl;a.download=`ket-qua-kham-${this.appointmentId}.pdf`;a.click();}},error:()=>{this.busy=false;tab?.close();this.error='Không tải được phiếu. Vui lòng thử lại.'}});}
 ngOnDestroy(){this.request?.unsubscribe();this.pendingTab?.close();this.urls.forEach(url=>URL.revokeObjectURL(url));}
}
