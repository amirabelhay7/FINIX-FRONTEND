import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerSegment } from '../../models/marketing.model';

@Injectable({ providedIn: 'root' })
export class CustomerSegmentService {

  private url = `${environment.apiUrl}/marketing/segments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CustomerSegment[]> {
    return this.http.get<CustomerSegment[]>(`${this.url}/all`);
  }

  add(request: CustomerSegment): Observable<CustomerSegment> {
    return this.http.post<CustomerSegment>(`${this.url}/add`, request);
  }

  update(id: number, request: CustomerSegment): Observable<CustomerSegment> {
    return this.http.put<CustomerSegment>(`${this.url}/update/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }
}
