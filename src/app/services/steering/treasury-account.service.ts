import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TreasuryAccount } from '../../models/steering.model';

@Injectable({ providedIn: 'root' })
export class TreasuryAccountService {

  private url = `${environment.apiUrl}/steering/treasury-accounts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<TreasuryAccount[]> {
    return this.http.get<TreasuryAccount[]>(`${this.url}/all`);
  }

  add(request: TreasuryAccount): Observable<TreasuryAccount> {
    return this.http.post<TreasuryAccount>(`${this.url}/add`, request);
  }

  update(id: number, request: any): Observable<TreasuryAccount> {
    return this.http.put<TreasuryAccount>(`${this.url}/update/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }
}
