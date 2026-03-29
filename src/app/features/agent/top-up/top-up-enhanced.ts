import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { ClientSearchService, ClientSearchResult } from '../../../services/client/client-search.service';
import { WalletService } from '../../../services/wallet/wallet.service';
import { AgentService, AgentStats } from '../../../services/agent/agent.service';
import { RealTimeService, RealTimeTransaction } from '../../../services/realtime/realtime.service';
import { FileUploadService, UploadResult } from '../../../services/file/file-upload.service';
import { FormValidationService, ValidationResult } from '../../../services/validation/form-validation.service';
import { Subscription } from 'rxjs';

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
    private agentService: AgentService,
    private realTimeService: RealTimeService,
    private fileUploadService: FileUploadService,
    private validationService: FormValidationService
  ) {
    this.loadAgentStats();
    this.subscribeToRealTimeUpdates();
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
  uploadedFileResults: UploadResult[] = [];
  uploadingFiles: { [key: string]: number } = {}; // Track upload progress
  processing = false;
  validationErrors: string[] = [];

  // Real-time subscriptions
  private transactionSubscription: Subscription | null = null;

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

  // Real-time updates
  subscribeToRealTimeUpdates(): void {
    this.transactionSubscription = this.realTimeService.getTransactionUpdates().subscribe({
      next: (transactions: RealTimeTransaction[]) => {
        // Update recent transactions with real-time data
        this.recentTransactions = transactions.map(txn => ({
          id: txn.id,
          clientName: txn.clientName,
          amount: txn.amount,
          type: txn.type,
          status: txn.status,
          time: txn.time
        }));
      },
      error: (error: any) => {
        console.error('Real-time update error:', error);
      }
    });
  }

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

  // Client Search with validation
  searchClient(): void {
    // Validate search query
    const validation = this.validationService.validateClientSearch(this.searchQuery);
    if (!validation.valid) {
      this.validationErrors = validation.errors;
      this.verificationStatus = {
        title: 'Search Error',
        message: validation.errors[0],
        type: 'error'
      };
      return;
    }

    this.validationErrors = [];
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
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      // Validate file before upload
      const validation = this.fileUploadService.validateFile(file);
      if (!validation.valid) {
        this.verificationStatus = {
          title: 'File Upload Error',
          message: `${file.name}: ${validation.error}`,
          type: 'error'
        };
        return;
      }

      // Add to local files list
      this.uploadedFiles = [...this.uploadedFiles, file];
      
      // Start upload
      this.uploadSingleFile(file);
    });
  }

  uploadSingleFile(file: File): void {
    const fileKey = `${file.name}_${Date.now()}`;
    this.uploadingFiles[fileKey] = 0;

    this.fileUploadService.uploadFile(file, 'receipts').subscribe({
      next: (event: HttpEvent<UploadResult>) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            const progress = Math.round(100 * event.loaded / event.total);
            this.uploadingFiles[fileKey] = progress;
          }
        } else if (event.type === HttpEventType.Response) {
          // Upload complete
          delete this.uploadingFiles[fileKey];
          
          if (event.body?.success) {
            this.uploadedFileResults.push(event.body);
            this.verificationStatus = {
              title: 'File Uploaded',
              message: `${file.name} uploaded successfully`,
              type: 'success'
            };
          } else {
            this.verificationStatus = {
              title: 'Upload Failed',
              message: event.body?.error || 'Failed to upload file',
              type: 'error'
            };
          }
        }
      },
      error: (error: any) => {
        delete this.uploadingFiles[fileKey];
        this.verificationStatus = {
          title: 'Upload Error',
          message: `Failed to upload ${file.name}: ${error.message}`,
          type: 'error'
        };
        console.error('File upload error:', error);
      }
    });
  }

  removeFile(file: File): void {
    // Remove from local files
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
    
    // Remove from upload results if exists
    this.uploadedFileResults = this.uploadedFileResults.filter(result => result.fileName !== file.name);
    
    // Remove from uploading progress
    Object.keys(this.uploadingFiles).forEach(key => {
      if (key.startsWith(file.name)) {
        delete this.uploadingFiles[key];
      }
    });
  }

  getUploadProgress(fileName: string): number {
    const key = Object.keys(this.uploadingFiles).find(k => k.startsWith(fileName));
    return key ? this.uploadingFiles[key] : 0;
  }

  isFileUploading(fileName: string): boolean {
    return Object.keys(this.uploadingFiles).some(k => k.startsWith(fileName));
  }

  // Transaction Processing with enhanced validation
  processTopUp(): void {
    const validation = this.validateForm();
    if (!validation.valid) {
      this.validationErrors = validation.errors;
      this.verificationStatus = {
        title: 'Validation Error',
        message: validation.errors[0],
        type: 'error'
      };
      return;
    }

    if (this.isAnyFileUploading()) {
      this.verificationStatus = {
        title: 'Files Uploading',
        message: 'Please wait for all files to finish uploading',
        type: 'warning'
      };
      return;
    }

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

  // Enhanced Form Validation
  validateForm(): ValidationResult {
    const formData = {
      selectedClient: this.selectedClient,
      topUpAmount: this.topUpAmount,
      paymentMethod: this.paymentMethod,
      referenceNumber: this.referenceNumber,
      transactionNotes: this.transactionNotes
    };
    
    return this.validationService.validateTopUpForm(formData);
  }

  getValidationHints(fieldName: string): string[] {
    const value = this.getFieldValue(fieldName);
    return this.validationService.getValidationHints(fieldName, value);
  }

  getFieldValue(fieldName: string): any {
    switch (fieldName) {
      case 'searchQuery': return this.searchQuery;
      case 'topUpAmount': return this.topUpAmount;
      case 'referenceNumber': return this.referenceNumber;
      case 'transactionNotes': return this.transactionNotes;
      default: return null;
    }
  }

  // Enhanced canSubmit with validation
  canSubmit(): boolean {
    const validation = this.validateForm();
    this.validationErrors = validation.errors;
    return validation.valid && !this.processing && !this.isAnyFileUploading();
  }

  isAnyFileUploading(): boolean {
    return Object.keys(this.uploadingFiles).length > 0;
  }

  resetForm(): void {
    this.selectedClient = null;
    this.verificationStatus = null;
    this.topUpAmount = null;
    this.paymentMethod = 'cash';
    this.referenceNumber = '';
    this.transactionNotes = '';
    this.uploadedFiles = [];
    this.uploadedFileResults = [];
    this.searchQuery = '';
    this.validationErrors = [];
    
    // Cancel any ongoing uploads
    Object.keys(this.uploadingFiles).forEach(key => {
      delete this.uploadingFiles[key];
    });
    
    // Refresh real-time data after reset
    this.realTimeService.refreshTransactions();
  }

  // Cleanup on component destroy
  ngOnDestroy(): void {
    if (this.transactionSubscription) {
      this.transactionSubscription.unsubscribe();
    }
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
