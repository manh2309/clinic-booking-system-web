import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ApiResponse} from '../models/api-response.model';
export interface OwnContact {username:string;email:string;phone:string|null;}
@Injectable({providedIn:'root'})
export class OwnAccountService {
 private url=`${environment.apiBaseUrl}/me/account`;
 constructor(private http:HttpClient){}
 get(){return this.http.get<ApiResponse<OwnContact>>(this.url);}
 update(phone:string){return this.http.patch<ApiResponse<OwnContact>>(this.url,{phone});}
 password(currentPassword:string,newPassword:string,confirmPassword:string){return this.http.post<ApiResponse<void>>(`${this.url}/password`,{currentPassword,newPassword,confirmPassword});}
}
