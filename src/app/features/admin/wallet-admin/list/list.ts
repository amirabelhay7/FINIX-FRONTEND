import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { WalletService } from '../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  readonly pageTitle = 'Wallet & Ledger Hub';
  readonly pageSubtitle = 'Central treasury management, client wallets, and audit trails.';

  stats = {
    totalWallets: 0,
    totalTransactions: 0,
    totalBalance: 0
  };

  loading = true;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.walletService.adminGetAllWallets().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (list) => {
        try {
          const arr = Array.isArray(list) ? list : [];
          this.stats.totalWallets = arr.length;
          this.stats.totalBalance = arr.reduce((acc, w) => acc + (w.balance || 0), 0);
        } catch (e) {
          this.error = (e instanceof Error ? e.message : 'Invalid wallet data') as string;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load wallet statistics';
      }
    });

    this.walletService.adminGetAllTransactions().subscribe({
      next: (list) => {
        try {
          const arr = Array.isArray(list) ? list : [];
          this.stats.totalTransactions = arr.length;
        } catch (e) {
          console.error('Failed to process transactions:', e);
        }
      },
      error: (err) => {
        console.error('Failed to load transactions:', err);
      }
    });
  }

  readonly cards = [
    { 
      title: 'Client Wallets', 
      subtitle: 'Manage account balances and status', 
      route: '/admin/wallet/wallets', 
      icon: 'group', 
      bgClass: 'bg-blue-50', 
      iconClass: 'text-[#135bec]' 
    },
    { 
      title: 'Global Ledger', 
      subtitle: 'Full immutable transaction audit log', 
      route: '/admin/wallet/transactions', 
      icon: 'history_edu', 
      bgClass: 'bg-green-50', 
      iconClass: 'text-green-600' 
    },
    { 
      title: 'Treasury Settings', 
      subtitle: 'Configure currency and limits', 
      route: '/admin/settings', 
      icon: 'tune', 
      bgClass: 'bg-gray-50', 
      iconClass: 'text-gray-500' 
    },
  ];
}
