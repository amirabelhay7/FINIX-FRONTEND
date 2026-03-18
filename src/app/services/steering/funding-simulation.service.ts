import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FundingSimulation } from '../../models/steering.model';

@Injectable({ providedIn: 'root' })
export class FundingSimulationService {

  private url = `${environment.apiUrl}/steering/funding-simulations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FundingSimulation[]> {
    return this.http.get<FundingSimulation[]>(`${this.url}/all`);
  }

  add(request: FundingSimulation): Observable<FundingSimulation> {
    return this.http.post<FundingSimulation>(`${this.url}/add`, request);
  }
}
