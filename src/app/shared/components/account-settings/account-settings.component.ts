import {Component,OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {OwnAccountService,OwnContact} from '../../../core/services/own-account.service';
import {AuthService} from '../../../core/services/auth.service';
@Component({selector:'app-account-settings',standalone:true,imports:[FormsModule,NgIf,MatButtonModule],template:`
 <section><h2>Thông tin tài khoản</h2><p *ngIf="!contact && !error">Đang tải...</p><p *ngIf="error" role="alert">{{error}} <button mat-button (click)="load()">Thử lại</button></p>
 <form *ngIf="contact" (ngSubmit)="save()"><p>Tên đăng nhập: <strong>{{contact.username}}</strong></p><p>Email: {{contact.email || 'Chưa cập nhật'}} — liên hệ quản trị viên nếu cần thay đổi.</p>
 <label>Số điện thoại<input name="phone" [(ngModel)]="phone" maxlength="20" type="tel" /></label><button mat-flat-button color="primary" [disabled]="busy">Lưu liên hệ</button></form><p role="status">{{message}}</p></section>
 <section><h2>Đổi mật khẩu</h2><p>Đổi thành công sẽ đăng xuất tất cả phiên cũ. Hãy đăng nhập lại bằng mật khẩu mới.</p>
 <form #passwordForm="ngForm" (ngSubmit)="change()">
 <label>Mật khẩu hiện tại<input type="password" name="currentPassword" [(ngModel)]="current" required autocomplete="current-password" /></label>
 <label>Mật khẩu mới<input type="password" name="newPassword" [(ngModel)]="next" required minlength="8" maxlength="64" autocomplete="new-password" /></label>
 <label>Nhập lại mật khẩu mới<input type="password" name="confirmation" [(ngModel)]="confirm" required autocomplete="new-password" /></label>
 <p *ngIf="passwordError" role="alert">{{passwordError}}</p><button mat-flat-button color="primary" [disabled]="busy || passwordForm.invalid || next !== confirm || next === current">Đổi mật khẩu và đăng xuất</button></form></section>
`,styles:[`section{background:white;border:1px solid #dbe5ee;border-radius:12px;padding:22px;margin-top:18px}h2{font-size:19px;margin-top:0}form{display:grid;gap:14px;max-width:600px}label{display:flex;flex-direction:column;gap:8px}input{font:inherit;padding:12px;border:1px solid #cbd5e1;border-radius:8px}button{justify-self:start}p{overflow-wrap:anywhere}p[role=alert]{color:#b91c1c}`]})
export class AccountSettingsComponent implements OnInit {
 contact:OwnContact|null=null;phone='';current='';next='';confirm='';busy=false;error='';message='';passwordError='';
 constructor(private service:OwnAccountService,private auth:AuthService){}
 ngOnInit(){this.load();}load(){this.error='';this.service.get().subscribe({next:r=>{this.contact=r.data;this.phone=r.data.phone||''},error:()=>this.error='Không tải được tài khoản.'});}
 save(){if(this.busy)return;this.busy=true;this.message='';this.service.update(this.phone).subscribe({next:r=>{this.contact=r.data;this.busy=false;this.message='Đã lưu thông tin liên hệ.'},error:()=>{this.busy=false;this.message='Không lưu được. Kiểm tra số điện thoại và thử lại.'}});}
 change(){if(this.busy||this.next.length<8||this.next!==this.confirm||this.current===this.next)return;this.busy=true;this.passwordError='';this.service.password(this.current,this.next,this.confirm).subscribe({next:()=>{this.current=this.next=this.confirm='';this.auth.logout()},error:()=>{this.busy=false;this.passwordError='Không đổi được mật khẩu. Kiểm tra mật khẩu hiện tại, mật khẩu mới (8–64 ký tự, tối đa 72 byte) và thử lại.'}});}
}
