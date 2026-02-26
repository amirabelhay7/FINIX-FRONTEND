import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  INSURANCE_METRICS,
  INSURANCE_POLICIES,
  InsuranceMetric,
  InsurancePolicy,
} from '../mock-data/insurance.mock';

@Injectable({
  providedIn: 'root',
})
export class InsuranceService {
  getMetrics(): Observable<InsuranceMetric[]> {
    return of(INSURANCE_METRICS);
  }

  getPolicies(): Observable<InsurancePolicy[]> {
    return of(INSURANCE_POLICIES);
  }
}

