import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CampaignSegmentLinkService {

  private url = `${environment.apiUrl}/marketing/campaign-segments`;

  constructor(private http: HttpClient) {}

  assign(campaignId: number, segmentId: number): Observable<void> {
    return this.http.post<void>(`${this.url}/assign`, { campaignId, segmentId });
  }

  unassign(campaignId: number, segmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/unassign`, {
      params: { campaignId: campaignId.toString(), segmentId: segmentId.toString() }
    });
  }

  getSegmentIdsByCampaign(campaignId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.url}/segments/${campaignId}`);
  }
}
