import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PenaltyTierConfig {
  tier: string;
  label: string;
  minDays: number;
  maxDays: number;
  rate: number;
  relanceFee: number;
  active: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface PenaltyTierUpdateDTO {
  label: string;
  minDays: number;
  maxDays: number;
  rate: number;
  relanceFee: number;
  active: boolean;
  updatedBy: string;
}

@Injectable({ providedIn: 'root' })
export class PenaltyTierService {
  private base = 'http://localhost:8081/api/penalty-tiers';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PenaltyTierConfig[]> {
    return this.http.get<PenaltyTierConfig[]>(this.base);
  }

  update(tier: string, dto: PenaltyTierUpdateDTO): Observable<PenaltyTierConfig> {
    return this.http.put<PenaltyTierConfig>(`${this.base}/${tier}`, dto);
  }
}
