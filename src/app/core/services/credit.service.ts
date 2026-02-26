import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  CREDIT_METRICS,
  CREDIT_PRODUCTS,
  CREDIT_REQUESTS,
  CreditMetric,
  CreditProduct,
  CreditRequest,
} from '../mock-data/credit.mock';

@Injectable({
  providedIn: 'root',
})
export class CreditService {
  getMetrics(): Observable<CreditMetric[]> {
    return of(CREDIT_METRICS);
  }

  getProducts(): Observable<CreditProduct[]> {
    return of(CREDIT_PRODUCTS);
  }

  getRecentRequests(): Observable<CreditRequest[]> {
    return of(CREDIT_REQUESTS);
  }
}

