import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Client {
  id: string;
  name: string;
  email: string;
  initials: string;
  isActive: boolean;
  walletBalance?: number;
}

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

  // Mock Data (replace with real API calls)
  readonly agentCashBalance = 5000;
  readonly todaysSummary: DailySummary = {
    topUps: 12,
    totalAmount: 45000,
    commission: 450,
    clientsServed: 8
  };

  readonly recentTransactions: Transaction[] = [
    {
      id: 'TXN001',
      clientName: 'Mohamed Ali',
      amount: 5000,
      type: 'cash',
      status: 'completed',
      time: '10:30 AM'
    },
    {
      id: 'TXN002',
      clientName: 'Sarra Ben',
      amount: 2500,
      type: 'bank',
      status: 'completed',
      time: '09:45 AM'
    },
    {
      id: 'TXN003',
      clientName: 'Karim Tounsi',
      amount: 7500,
      type: 'cash',
      status: 'pending',
      time: '09:15 AM'
    }
  ];

  // Client Search
  searchClient(): void {
    if (!this.searchQuery.trim()) return;

    // Simulate client search (replace with actual API call)
    this.processing = true;
    
    setTimeout(() => {
      if (this.searchQuery.toLowerCase().includes('mohamed')) {
        this.selectedClient = {
          id: 'CLT001',
          name: 'Mohamed Ali',
          email: 'mohamed.ali@email.com',
          initials: 'MA',
          isActive: true,
          walletBalance: 15000
        };
        this.verificationStatus = {
          title: 'Client Verified',
          message: 'Client identity confirmed and wallet located',
          type: 'success'
        };
      } else if (this.searchQuery.toLowerCase().includes('sarra')) {
        this.selectedClient = {
          id: 'CLT002',
          name: 'Sarra Ben',
          email: 'sarra.ben@email.com',
          initials: 'SB',
          isActive: true,
          walletBalance: 8500
        };
        this.verificationStatus = {
          title: 'Client Verified',
          message: 'Client identity confirmed and wallet located',
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
      this.processing = false;
    }, 1000);
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

    // Simulate transaction processing (replace with actual API call)
    setTimeout(() => {
      // Add to recent transactions
      const newTransaction: Transaction = {
        id: `TXN${Date.now()}`,
        clientName: this.selectedClient?.name || 'Unknown',
        amount: this.topUpAmount || 0,
        type: this.paymentMethod as any,
        status: 'completed',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      this.recentTransactions.unshift(newTransaction);

      // Show success message
      this.verificationStatus = {
        title: 'Transaction Successful',
        message: `Successfully loaded ${this.topUpAmount} TND to ${this.selectedClient?.name}'s wallet`,
        type: 'success'
      };

      // Reset form
      this.resetForm();
      this.processing = false;
    }, 2000);
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
