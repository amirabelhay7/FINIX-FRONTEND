import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { WalletService, WalletApi } from '../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-wallet-list',
  standalone: false,
  templateUrl: './wallet-list.html',
  styleUrl: './wallet-list.css',
})
export class WalletList implements OnInit {
  readonly pageTitle = 'All Wallets';
  wallets: WalletApi[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.walletService.getAllWalletsAdmin()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data: WalletApi[]) => {
          try {
            const arr = Array.isArray(data) ? data : [];
            this.wallets = arr;
          } catch (e) {
            this.error = (e instanceof Error ? e.message : 'Invalid response') as string;
          }
        },
        error: (err) => this.error = err?.error?.message || 'Failed to sync ledger records',
      });
  }

  formatBalance(w: WalletApi): string {
    return (w.balance ?? 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ' + (w.currency || 'TND');
  }
}
