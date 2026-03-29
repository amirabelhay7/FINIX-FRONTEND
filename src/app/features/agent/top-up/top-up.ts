import { Component } from '@angular/core';

/**
 * ViewModel: agent wallet top-up (MVVM).
 */
@Component({
  selector: 'app-top-up',
  standalone: false,
  templateUrl: './top-up.html',
  styleUrls: ['./top-up.css']
})
export class TopUp {
  
  // UI Text Properties
  readonly pageTitle = 'Wallet top-up';
  readonly pageSubtitle = "Load a client's wallet after receiving cash.";
  readonly clientLabel = 'Client (phone or CIN)';
  readonly amountLabel = 'Amount (TND)';
  readonly clientPlaceholder = 'Enter client phone, email, or CIN';
  readonly amountPlaceholder = '0.00';
  readonly confirmNote = 'Confirm you received the cash from the client before loading.';
  readonly submitLabel = 'Load wallet';
  
  // Form State
  searchFocused = false;
  amount = '';
  selectedClient = null;
  paymentMethod = 'cash';
  
  // Mock Data for UI Demo
  readonly agentStats = {
    topUps: 12,
    totalAmount: 45000,
    commission: 450,
    clientsServed: 8
  };
  
  readonly recentActivity = [
    {
      clientName: 'Mohamed Ali',
      amount: 5000,
      method: 'Cash',
      time: '10:30 AM',
      color: 'green'
    },
    {
      clientName: 'Sarra Ben',
      amount: 2500,
      method: 'Bank',
      time: '09:45 AM',
      color: 'blue'
    },
    {
      clientName: 'Karim Tounsi',
      amount: 7500,
      method: 'Cash',
      time: '09:15 AM',
      color: 'orange'
    }
  ];
  
  // Quick Amount Buttons
  quickAmounts = [100, 500, 1000, 5000];
  
  // Methods
  setQuickAmount(amount: number): void {
    this.amount = amount.toString();
  }
  
  selectPaymentMethod(method: string): void {
    this.paymentMethod = method;
  }
  
  processTopUp(): void {
    // Handle top-up processing
    console.log('Processing top-up:', {
      client: this.selectedClient,
      amount: this.amount,
      method: this.paymentMethod
    });
  }
}
