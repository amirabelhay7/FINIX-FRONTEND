import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  WALLET_METRICS,
  WALLET_TRANSACTIONS,
  WalletMetric,
  WalletTransaction,
} from '../mock-data/wallet.mock';

@Injectable({
  providedIn: 'root',
})
export class WalletService {
  getMetrics(): Observable<WalletMetric[]> {
    return of(WALLET_METRICS);
  }

  getTransactions(): Observable<WalletTransaction[]> {
    return of(WALLET_TRANSACTIONS);
  }
}

