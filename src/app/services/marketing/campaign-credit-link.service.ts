import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CampaignCreditLink } from '../../models/marketing.model';

@Injectable({ providedIn: 'root' })
export class CampaignCreditLinkService {

  private url = `${environment.apiUrl}/marketing/campaign-credits`;

  constructor(private http: HttpClient) {}

  getByCampaign(campaignId: number): Observable<CampaignCreditLink[]> {
    return this.http.get<CampaignCreditLink[]>(`${this.url}/by-campaign/${campaignId}`);
  }

  add(request: any): Observable<CampaignCreditLink> {
    return this.http.post<CampaignCreditLink>(`${this.url}/add`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/delete/${id}`);
  }
}
