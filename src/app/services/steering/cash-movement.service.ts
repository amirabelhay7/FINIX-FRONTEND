import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CashMovement {
  id?: number;
  treasuryAccountId: number;
  movementDirection: 'INFLOW' | 'OUTFLOW';
  description: string;
  amount: number;
  movementDate?: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CashMovementService {
  private url = `${environment.apiUrl}/steering/cash-movements`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<CashMovement[]> {
    return this.http.get<CashMovement[]>(`${this.url}/all`);
  }

  getByAccount(accountId: number): Observable<CashMovement[]> {
    return this.http.get<CashMovement[]>(`${this.url}/by-account/${accountId}`);
  }

  add(request: CashMovement): Observable<CashMovement> {
    return this.http.post<CashMovement>(`${this.url}/add`, request);
  }

  update(id: number, request: { description?: string; movementDate?: string }): Observable<CashMovement> {
    return this.http.put<CashMovement>(`${this.url}/update/${id}`, request);
  }
}
