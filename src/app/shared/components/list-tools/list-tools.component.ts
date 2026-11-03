import {Component,Input,Output,EventEmitter} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatPaginatorModule,PageEvent,MatPaginatorIntl} from '@angular/material/paginator';
export interface ListFilters {keyword:string;active:string;from:string;to:string;}
export function vietnamesePaginator():MatPaginatorIntl {
  const p=new MatPaginatorIntl();p.itemsPerPageLabel='Số dòng mỗi trang';p.nextPageLabel='Trang sau';p.previousPageLabel='Trang trước';p.firstPageLabel='Trang đầu';p.lastPageLabel='Trang cuối';
  p.getRangeLabel=(page,size,total)=>total===0?'0 / 0':`${page*size+1}–${Math.min((page+1)*size,total)} / ${total}`;return p;
}
@Component({selector:'app-list-tools',standalone:true,imports:[FormsModule,NgIf,MatButtonModule,MatPaginatorModule],template:`
  <form *ngIf="!paginatorOnly" class="list-filters" (ngSubmit)="submit()">
    <label class="keyword">{{label}}<input name="keyword" [(ngModel)]="filters.keyword" maxlength="100" placeholder="Nhập từ khóa..." /></label>
    <label *ngIf="showActive">Trạng thái<select name="active" [(ngModel)]="filters.active"><option value="">Tất cả</option><option value="true">Đang hoạt động</option><option value="false">Ngừng hoạt động</option></select></label>
    <label *ngIf="showDates">Từ ngày<input name="from" type="date" [(ngModel)]="filters.from" /></label>
    <label *ngIf="showDates">Đến ngày<input name="to" type="date" [(ngModel)]="filters.to" [min]="filters.from" /></label>
    <button mat-flat-button color="primary" type="submit" [disabled]="busy || !!(filters.from && filters.to && filters.from > filters.to)">Tìm kiếm</button>
    <button mat-button type="button" (click)="clear()" [disabled]="busy">Xóa lọc</button>
  </form>
  <mat-paginator *ngIf="paginatorOnly" [length]="total" [pageIndex]="page" [pageSize]="size" [pageSizeOptions]="[10,20,50]" [showFirstLastButtons]="true" [disabled]="busy" (page)="pageChange.emit($event)"></mat-paginator>
`,styles:[`:host{display:block}.list-filters{display:flex;flex-wrap:wrap;align-items:end;gap:12px;margin:16px 0;padding:16px;background:white;border:1px solid #dbe5ee;border-radius:12px}label{display:flex;flex-direction:column;gap:7px;font-size:13px;color:#334155}.keyword{flex:1;min-width:200px}input,select{box-sizing:border-box;padding:11px;border:1px solid #cbd5e1;border-radius:8px;font:inherit;background:white;min-height:42px}button{min-height:42px}@media(max-width:600px){label{flex:1;min-width:130px}.keyword{flex-basis:100%}}`]})
export class ListToolsComponent {
 @Input() label='Tìm kiếm';@Input() showDates=false;@Input() showActive=false;@Input() paginatorOnly=false;@Input() busy=false;
 @Input() total=0;@Input() page=0;@Input() size=10;
 @Output() search=new EventEmitter<ListFilters>();@Output() pageChange=new EventEmitter<PageEvent>();
 filters:ListFilters={keyword:'',active:'',from:'',to:''};
 submit(){this.search.emit({...this.filters});}clear(){this.filters={keyword:'',active:'',from:'',to:''};this.submit();}
}
