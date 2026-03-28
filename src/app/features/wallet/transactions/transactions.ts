import { Component, OnInit } from '@angular/core';
import { WalletService, TransactionApi } from '../../../services/wallet/wallet.service';

function formatAmount(amount: number, positive: boolean): string {
  return (positive ? '+' : '-') + Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' TND';
}

const ICON_MAP: Record<string, string> = {
  DEPOSIT: 'south_east', WITHDRAWAL: 'north_west',
  TRANSFER_OUT: 'swap_horiz', TRANSFER_IN: 'swap_horiz',
  AGENT_TOP_UP: 'storefront', ADMIN_TOP_UP: 'admin_panel_settings',
  TREASURY_OUT: 'account_balance',
};

@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  allTransactions: TransactionApi[] = [];
  filtered: TransactionApi[] = [];
  loading = true;
  error: string | null = null;
  filterType = 'ALL';

  readonly types = ['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_OUT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'];

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.getMyTransactions().subscribe({
      next: (list) => {
        this.allTransactions = list;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load transactions';
        this.loading = false;
      },
    });
  }

  setFilter(type: string): void {
    this.filterType = type;
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filtered = this.filterType === 'ALL'
      ? this.allTransactions
      : this.allTransactions.filter(t => t.transactionType === this.filterType);
  }

  isPositive(t: TransactionApi): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'].includes(t.transactionType);
  }

  formatAmt(t: TransactionApi): string {
    return formatAmount(t.amount, this.isPositive(t));
  }

  iconFor(t: TransactionApi): string {
    return ICON_MAP[t.transactionType] ?? 'receipt_long';
  }

  formatDate(d: string): string {
    return d ? new Date(d).toLocaleString() : '';
  }
}
