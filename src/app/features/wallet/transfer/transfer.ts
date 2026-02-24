import { Component } from '@angular/core';

/**
 * ViewModel: P2P transfer (MVVM).
 */
@Component({
  selector: 'app-transfer',
  standalone: false,
  templateUrl: './transfer.html',
  styleUrl: './transfer.css',
})
export class Transfer {
  readonly pageTitle = 'P2P Transfer';
  readonly pageSubtitle = 'Send money instantly to any FINIX user.';
  readonly balanceLabel = 'Your Balance';
  readonly balanceAmount = '2,840.50 TND';
  readonly recipientLabel = 'Recipient';
  readonly recipientPlaceholder = 'Search by CIN, phone, or name...';
  readonly recipientName = 'Sarah Sidibe';
  readonly recipientMeta = 'CIN: 12345678 · Gold Tier';
  /** Avatar URL for recipient (static UI). */
  readonly recipientAvatarUrl = 'https://ui-avatars.com/api/?name=Sarah+Sidibe&background=135bec&color=fff';
  readonly amountLabel = 'Amount';
  readonly amountHint = 'Max: 2,840.50 TND — Transfer fee: 0.00 TND (free)';
  readonly noteLabel = 'Note (Optional)';
  readonly notePlaceholder = 'e.g. Rent payment...';
  readonly summaryTransfer = 'Transfer Amount';
  readonly summaryFee = 'Platform Fee';
  readonly summaryFeeValue = 'Free';
  readonly summaryTotal = 'Total Deducted';
  readonly summaryAmount = '200.00 TND';
  readonly confirmLabel = 'Confirm Transfer';
  readonly backLabel = 'Back to Wallet';

  readonly quickAmounts: string[] = ['50', '100', '200', '500'];
}
