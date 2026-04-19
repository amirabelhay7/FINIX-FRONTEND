import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HHIResult, SimulatorRequest } from '../../models/hhi.model';

@Injectable({ providedIn: 'root' })
export class HhiService {
  private base = 'http://localhost:8081/api/hhi';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('finix_access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  getAnalysis(): Observable<HHIResult> {
    return this.http.get<HHIResult>(`${this.base}/analysis`, {
      headers: this.getHeaders()
    });
  }

  simulate(req: SimulatorRequest): Observable<HHIResult> {
    return this.http.post<HHIResult>(`${this.base}/simulate`, req, {
      headers: this.getHeaders()
    });
  }
}
