import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientSearchService, ClientSearchResult } from '../../../services/client/client-search.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { AgentService, AgentStats } from '../../../services/agent/agent.service';

interface Client extends ClientSearchResult {}

interface VerificationStatus {
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'pending';
}

interface Transaction {
  id: string;
  clientName: string;
  amount: number;
  type: 'cash' | 'bank' | 'check';
  status: 'completed' | 'pending' | 'failed';
  time: string;
}

interface DailySummary {
  topUps: number;
  totalAmount: number;
  commission: number;
  clientsServed: number;
}

/**
 * Enhanced Agent Top-Up Component with full cash management features
 */
@Component({
  selector: 'app-top-up-enhanced',
  standalone: false,
  templateUrl: './top-up-enhanced.html',
  styleUrls: ['./top-up.css']
})
export class TopUpEnhanced {
  
  constructor(
    private clientSearchService: ClientSearchService,
    private walletService: WalletService,
    private agentService: AgentService
  ) {
    this.loadAgentStats();
  }
  
  // Form Data
  searchQuery = '';
  selectedClient: Client | null = null;
  verificationStatus: VerificationStatus | null = null;
  topUpAmount: number | null = null;
  paymentMethod = 'cash';
  referenceNumber = '';
  transactionNotes = '';
  uploadedFiles: File[] = [];
  processing = false;

  // Configuration
  readonly minTopUpAmount = 10;
  readonly maxTopUpAmount = 10000;

  // Dynamic Data (loaded from API)
  agentCashBalance = 0;
  todaysSummary: DailySummary = {
    topUps: 0,
    totalAmount: 0,
    commission: 0,
    clientsServed: 0
  };

  recentTransactions: Transaction[] = [];

  // Load Agent Statistics
  loadAgentStats(): void {
    this.agentService.getTodayStats().subscribe({
      next: (stats: AgentStats) => {
        this.agentCashBalance = stats.cashBalance;
        this.todaysSummary = {
          topUps: stats.topUps,
          totalAmount: stats.totalAmount,
          commission: stats.commission,
          clientsServed: stats.clientsServed
        };
      },
      error: (error: any) => {
        console.error('Failed to load agent stats:', error);
        // Set default values on error
        this.agentCashBalance = 0;
        this.todaysSummary = {
          topUps: 0,
          totalAmount: 0,
          commission: 0,
          clientsServed: 0
        };
      }
    });

    // Load recent transactions
    this.loadRecentTransactions();
  }

  loadRecentTransactions(): void {
    this.agentService.getRecentTransactions(5).subscribe({
      next: (transactions: any[]) => {
        this.recentTransactions = transactions.map(txn => ({
          id: txn.id || `TXN${Date.now()}`,
          clientName: txn.clientName || 'Unknown',
          amount: txn.amount || 0,
          type: txn.type || 'cash',
          status: txn.status || 'completed',
          time: txn.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }));
      },
      error: (error: any) => {
        console.error('Failed to load recent transactions:', error);
        this.recentTransactions = [];
      }
    });
  }

  // Client Search
  searchClient(): void {
    if (!this.searchQuery.trim()) {
      this.selectedClient = null;
      this.verificationStatus = null;
      return;
    }

    this.processing = true;
    this.verificationStatus = {
      title: 'Searching...',
      message: 'Looking up client information...',
      type: 'pending'
    };

    this.clientSearchService.searchClients({
      query: this.searchQuery,
      limit: 10
    }).subscribe({
      next: (clients: ClientSearchResult[]) => {
        this.processing = false;
        
        if (clients.length > 0) {
          // Take the first match for now, later we can show a selection UI
          this.selectedClient = clients[0];
          this.verificationStatus = {
            title: 'Client Verified',
            message: `Found ${clients.length} client(s). Selected: ${clients[0].name}`,
            type: 'success'
          };
        } else {
          this.selectedClient = null;
          this.verificationStatus = {
            title: 'Client Not Found',
            message: 'No client found with the provided search criteria',
            type: 'error'
          };
        }
      },
      error: (error: any) => {
        this.processing = false;
        this.selectedClient = null;
        this.verificationStatus = {
          title: 'Search Error',
          message: 'Failed to search for clients. Please try again.',
          type: 'error'
        };
        console.error('Client search error:', error);
      }
    });
  }

  // File Upload
  onReceiptUpload(event: any): void {
    const files = event.target.files;
    if (files) {
      this.uploadedFiles = [...this.uploadedFiles, ...Array.from(files) as File[]];
    }
  }

  removeFile(file: File): void {
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
  }

  // Transaction Processing
  processTopUp(): void {
    if (!this.canSubmit()) return;

    this.processing = true;
    this.verificationStatus = {
      title: 'Processing...',
      message: 'Processing top-up transaction...',
      type: 'pending'
    };

    // Prepare transaction request
    const transactionRequest = {
      amount: this.topUpAmount!,
      description: this.transactionNotes || `Top-up via ${this.paymentMethod}`,
      targetEmail: this.selectedClient!.email,
      paymentMethod: this.paymentMethod,
      referenceNumber: this.referenceNumber,
      receiptFiles: this.uploadedFiles.map(file => file.name)
    };

    // Call real API
    this.walletService.agentTopUp(transactionRequest).subscribe({
      next: (response) => {
        // Add to recent transactions
        const newTransaction: Transaction = {
          id: response.id || `TXN${Date.now()}`,
          clientName: this.selectedClient?.name || 'Unknown',
          amount: this.topUpAmount || 0,
          type: this.paymentMethod as any,
          status: 'completed',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        this.recentTransactions.unshift(newTransaction);

        // Update statistics
        this.todaysSummary.topUps++;
        this.todaysSummary.totalAmount += this.topUpAmount!;
        this.todaysSummary.commission += (this.topUpAmount! * 0.01); // 1% commission
        this.todaysSummary.clientsServed++;

        // Show success message
        this.verificationStatus = {
          title: 'Transaction Successful',
          message: `Successfully loaded ${this.topUpAmount} TND to ${this.selectedClient?.name}'s wallet`,
          type: 'success'
        };

        // Reset form
        this.resetForm();
        this.processing = false;
      },
      error: (error: any) => {
        this.processing = false;
        this.verificationStatus = {
          title: 'Transaction Failed',
          message: error.error?.message || 'Failed to process transaction. Please try again.',
          type: 'error'
        };
        console.error('Transaction processing error:', error);
      }
    });
  }

  // Form Validation
  canSubmit(): boolean {
    return !!(
      this.selectedClient &&
      this.topUpAmount &&
      this.topUpAmount >= this.minTopUpAmount &&
      this.topUpAmount <= this.maxTopUpAmount &&
      !this.processing
    );
  }

  resetForm(): void {
    this.selectedClient = null;
    this.verificationStatus = null;
    this.topUpAmount = null;
    this.paymentMethod = 'cash';
    this.referenceNumber = '';
    this.transactionNotes = '';
    this.uploadedFiles = [];
    this.searchQuery = '';
  }

  // UI Helper Methods
  getVerificationStatusClass(): string {
    if (!this.verificationStatus) return '';
    return `cfm-verification-${this.verificationStatus.type}`;
  }

  getVerificationIcon(): string {
    if (!this.verificationStatus) return '';
    switch (this.verificationStatus.type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '';
    }
  }

  getTransactionIcon(type: string): string {
    switch (type) {
      case 'cash': return '💵';
      case 'bank': return '🏦';
      case 'check': return '📄';
      default: return '💰';
    }
  }

  getTransactionIconClass(type: string): string {
    return `cfm-transaction-icon-${type}`;
  }

  getTransactionStatusClass(status: string): string {
    return `cfm-transaction-status-${status}`;
  }
}
