import { Component } from '@angular/core';

/**
 * ViewModel: agent wallet top-up (MVVM).
 */
@Component({
  selector: 'app-top-up',
  standalone: false,
  templateUrl: './top-up.html',
  styleUrl: './top-up.css',
})
export class TopUp {
  readonly pageTitle = 'Wallet top-up';
  readonly pageSubtitle = "Load a client's wallet after receiving cash.";
  readonly clientLabel = 'Client (phone or CIN)';
  readonly clientPlaceholder = 'Search client...';
  readonly amountLabel = 'Amount (TND)';
  readonly amountPlaceholder = '0.00';
  readonly confirmNote = 'Confirm you received the cash from the client before loading.';
  readonly submitLabel = 'Load wallet';
}
