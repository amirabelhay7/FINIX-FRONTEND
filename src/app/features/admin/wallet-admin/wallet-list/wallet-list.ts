import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { WalletAdminRow, WalletApi } from '../../../../models';
import { WalletService } from '../../../../core/wallet/wallet.service';

@Component({
  selector: 'app-wallet-list',
  standalone: false,
  templateUrl: './wallet-list.html',
  styleUrl: './wallet-list.css',
})
export class WalletList implements OnInit {
  readonly pageTitle = 'All Wallets';

  wallets: WalletAdminRow[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.walletService.getAllWalletsAdmin().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (list) => {
        try {
          const arr = Array.isArray(list) ? list : [];
          this.wallets = arr.map((w: WalletApi) => {
            const clientDeleted = !!w.clientDeleted;
            const status = clientDeleted ? 'Deleted' : (w.isActive ? 'Active' : 'Inactive');
            const statusClass = clientDeleted ? 'bg-red-50 text-red-700' : (w.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600');
            return {
              id: w.id,
              account: w.accountNumber ? `**${w.accountNumber.slice(-4)}` : '—',
              clientEmail: w.clientEmail ?? '—',
              balance: w.balance.toFixed(2) + ' TND',
              status,
              statusClass,
              viewRoute: '/admin/wallet/wallets/' + w.id,
            };
          });
        } catch (e) {
          this.error = (e instanceof Error ? e.message : 'Invalid response') as string;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load wallets';
      },
    });
  }
}
