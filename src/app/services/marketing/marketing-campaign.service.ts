import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MarketingCampaign } from '../../models/marketing.model';

@Injectable({ providedIn: 'root' })
export class MarketingCampaignService {

  private url = `${environment.apiUrl}/marketing/campaigns`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MarketingCampaign[]> {
    return this.http.get<MarketingCampaign[]>(`${this.url}/all`);
  }

  getById(id: number): Observable<MarketingCampaign> {
    return this.http.get<MarketingCampaign>(`${this.url}/get/${id}`);
  }

  add(request: MarketingCampaign): Observable<MarketingCampaign> {
    return this.http.post<MarketingCampaign>(`${this.url}/add`, request);
  }

  update(id: number, request: MarketingCampaign): Observable<MarketingCampaign> {
    return this.http.put<MarketingCampaign>(`${this.url}/update/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }
  getActive(): Observable<MarketingCampaign[]> {
  return this.http.get<MarketingCampaign[]>(`${this.url}/active`);
}
}
