import { Component, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { WalletService, WalletApi, TransactionApi } from '../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-wallet-detail',
  standalone: false,
  templateUrl: './wallet-detail.html',
  styleUrl: './wallet-detail.css',
})
export class WalletDetail implements OnInit, OnChanges {
  wallet: WalletApi | null = null;
  transactions: TransactionApi[] = [];
  loading = true;
  error: string | null = null;
  
  creditAmount: number | null = null;
  creditDescription = '';
  creditLoading = false;
  
  freezeLoading = false;
  invalidateLoading = false;
  unfreezeLoading = false;
  
  // Transaction Limits
  limitsLoading = false;
  limitForm = {
    dailyLimit: undefined as number | undefined,
    monthlyLimit: undefined as number | undefined,
    transactionLimit: undefined as number | undefined
  };
  
  private currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Wallet detail - User ID from route:', userId);
    console.log('Is valid userId:', !isNaN(userId) && userId > 0);
    
    this.currentUserId = userId;
    this.loadData(userId);
  }

  loadData(userId: number): void {
    this.loading = true;
    console.log('Loading wallet data for user ID:', userId);
    this.walletService.adminGetWallet(userId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        this.wallet = w;
        console.log('Wallet loaded:', w);
        console.log('Current balance:', w?.balance);
        
        // Initialize limit form with current values
        this.limitForm = {
          dailyLimit: w.dailyLimit || undefined,
          monthlyLimit: w.monthlyLimit || undefined,
          transactionLimit: w.transactionLimit || undefined
        };
        
        this.walletService.adminGetUserTransactions(userId).subscribe({
          next: (txs) => {
            this.transactions = txs;
            console.log('Transactions loaded:', txs.length, 'entries');
          },
          error: () => { }
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Wallet not found';
        console.error('Error loading wallet:', err);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wallet']) {
      console.log('Wallet object changed:', changes['wallet'].currentValue);
    }
  }

  get currentBalance(): number {
    const balance = this.wallet?.balance ?? 0;
    console.log('Balance getter called, returning:', balance);
    return balance;
  }

  formatBalance(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '0.00 TND';
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ' + (this.wallet?.currency || 'TND');
  }

  isCredit(transactionType: string): boolean {
    return ['DEPOSIT', 'ADMIN_TOP_UP'].includes(transactionType?.toUpperCase());
  }

  applyCredit(): void {
    if (!this.creditAmount || this.creditAmount <= 0 || !this.currentUserId) return;
    this.creditLoading = true;
    console.log('Applying credit to USER ID:', this.currentUserId, 'not wallet ID:', this.wallet?.id);
    
    this.walletService.adminCredit(this.currentUserId, { 
      amount: this.creditAmount, 
      description: this.creditDescription || 'Admin adjustment' 
    }).pipe(
      finalize(() => {
        this.creditLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        // Update wallet with new balance immediately
        this.wallet = w;
        console.log('Credit successful - Updated wallet:', w);
        
        // Clear form
        this.creditAmount = null;
        this.creditDescription = '';
        
        // Only reload transactions, not the wallet (to avoid overwriting the updated balance)
        this.walletService.adminGetUserTransactions(this.currentUserId!).subscribe({
          next: (txs) => {
            this.transactions = txs;
            this.cdr.detectChanges();
          },
          error: () => { }
        });
      },
      error: (err) => {
        console.error('Credit failed:', err);
        alert(err?.error?.message || 'Credit failed');
      }
    });
  }

  freezeAccount(): void {
    if (!this.currentUserId || !confirm('Are you sure you want to freeze this account? This will disable all wallet operations.')) return;
    
    this.freezeLoading = true;
    console.log('Freezing account for USER ID:', this.currentUserId);
    
    this.walletService.adminFreezeAccount(this.currentUserId).pipe(
      finalize(() => {
        this.freezeLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        this.wallet = w;
        console.log('Account frozen successfully:', w);
        alert('Account has been frozen successfully.');
      },
      error: (err) => {
        console.error('Freeze failed:', err);
        alert(err?.error?.message || 'Failed to freeze account');
      }
    });
  }

  invalidateLedger(): void {
    if (!this.currentUserId || !confirm('Are you sure you want to invalidate the ledger? This will reset the balance to 0 TND.')) return;
    
    this.invalidateLoading = true;
    console.log('Invalidating ledger for USER ID:', this.currentUserId);
    
    this.walletService.adminInvalidateLedger(this.currentUserId).pipe(
      finalize(() => {
        this.invalidateLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        this.wallet = w;
        console.log('Ledger invalidated successfully:', w);
        alert('Ledger has been invalidated successfully. Balance reset to 0 TND.');
        // Reload transactions to show the invalidation record
        this.walletService.adminGetUserTransactions(this.currentUserId!).subscribe({
          next: (txs) => {
            this.transactions = txs;
            this.cdr.detectChanges();
          },
          error: () => { }
        });
      },
      error: (err) => {
        console.error('Invalidate failed:', err);
        alert(err?.error?.message || 'Failed to invalidate ledger');
      }
    });
  }

  unfreezeAccount(): void {
    if (!this.currentUserId || !confirm('Are you sure you want to unfreeze this account? This will restore all wallet operations.')) return;
    
    this.unfreezeLoading = true;
    console.log('Unfreezing account for USER ID:', this.currentUserId);
    
    this.walletService.adminUnfreezeAccount(this.currentUserId).pipe(
      finalize(() => {
        this.unfreezeLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        this.wallet = w;
        console.log('Account unfrozen successfully:', w);
        alert('Account has been unfrozen successfully. Wallet operations are now restored.');
      },
      error: (err) => {
        console.error('Unfreeze failed:', err);
        alert(err?.error?.message || 'Failed to unfreeze account');
      }
    });
  }

  saveTransactionLimits(): void {
    if (!this.currentUserId) return;
    
    console.log('=== SAVE TRANSACTION LIMITS START ===');
    console.log('Current User ID:', this.currentUserId);
    console.log('Limit Form:', this.limitForm);
    console.log('Form values:', JSON.stringify(this.limitForm));
    
    // Check if form has any values
    const hasAnyValue = this.limitForm.dailyLimit !== undefined || 
                      this.limitForm.monthlyLimit !== undefined || 
                      this.limitForm.transactionLimit !== undefined;
    
    console.log('Has any values:', hasAnyValue);
    
    if (!hasAnyValue) {
      alert('Please enter at least one limit value');
      return;
    }
    
    this.limitsLoading = true;
    console.log('Calling API...');
    
    this.walletService.adminSetTransactionLimits(this.currentUserId, this.limitForm).pipe(
      finalize(() => {
        this.limitsLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        console.log('✅ SUCCESS - Transaction limits saved:', w);
        this.wallet = w;
        alert('Transaction limits have been updated successfully.');
      },
      error: (err) => {
        console.error('❌ ERROR - Save limits failed:', err);
        console.error('Error details:', err?.error?.message || err?.message || 'Unknown error');
        alert('Failed to save transaction limits: ' + (err?.error?.message || err?.message || 'Unknown error'));
      }
    });
  }

  formatDate(d: string): string {
    return d ? new Date(d).toLocaleString() : '';
  }

  isPositive(t: TransactionApi): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'].includes(t.transactionType);
  }
}
