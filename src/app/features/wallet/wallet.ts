import { Component, OnInit } from '@angular/core';
import {
  WalletMetric,
  WalletTransaction,
} from '../../core/mock-data/wallet.mock';
import { WalletService } from '../../core/services/wallet.service';

@Component({
  selector: 'app-wallet',
  standalone: false,
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss',
})
export class Wallet implements OnInit {
  metrics: WalletMetric[] = [];
  transactions: WalletTransaction[] = [];

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.getMetrics().subscribe((m) => (this.metrics = m));
    this.walletService.getTransactions().subscribe((t) => (this.transactions = t));
  }
}

