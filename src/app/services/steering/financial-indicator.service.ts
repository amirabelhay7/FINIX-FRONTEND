import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FinancialIndicator } from '../../models/steering.model';

@Injectable({ providedIn: 'root' })
export class FinancialIndicatorService {

  private url = `${environment.apiUrl}/steering/financial-indicators`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FinancialIndicator[]> {
    return this.http.get<FinancialIndicator[]>(`${this.url}/all`);
  }

  getById(id: number): Observable<FinancialIndicator> {
    return this.http.get<FinancialIndicator>(`${this.url}/get/${id}`);
  }

  add(request: FinancialIndicator): Observable<FinancialIndicator> {
    return this.http.post<FinancialIndicator>(`${this.url}/add`, request);
  }

  getByReference(ref: string): Observable<FinancialIndicator[]> {
    return this.http.get<FinancialIndicator[]>(`${this.url}/by-reference/${ref}`);
  }
}
