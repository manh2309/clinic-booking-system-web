import {Injectable} from '@angular/core';
import {HttpClient,HttpParams} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {ApiResponse,PageResponse} from '../models/api-response.model';
import {ListFilters} from '../../shared/components/list-tools/list-tools.component';
@Injectable({providedIn:'root'})
export class DirectoryService {
 constructor(private http:HttpClient){}
 search<T>(kind:'accounts'|'doctors'|'specialties',page:number,size:number,filters?:ListFilters){
   let params=new HttpParams().set('page',page).set('size',size).set('keyword',filters?.keyword||'');
   if(filters?.active)params=params.set('active',filters.active);
   return this.http.get<ApiResponse<PageResponse<T>>>(`${environment.apiBaseUrl}/admin/directory/${kind}`,{params});
 }
}
