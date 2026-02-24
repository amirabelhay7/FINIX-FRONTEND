import { Component } from '@angular/core';
import { PolicyDetailItem } from '../../../models';

/**
 * ViewModel: policy detail (MVVM).
 */
@Component({
  selector: 'app-policy-detail',
  standalone: false,
  templateUrl: './policy-detail.html',
  styleUrl: './policy-detail.css',
})
export class PolicyDetail {
  readonly pageTitle = 'Policy POL-2025-0012';
  readonly pageSubtitle = 'Moto Cover · Active until Dec 15, 2025';
  readonly backRoute = '/insurance/my-policies';
  readonly detailsTitle = 'Details';
  readonly nextPaymentTitle = 'Next payment';
  readonly nextPaymentAmount = '8.00 TND';
  readonly nextPaymentDue = 'Due Mar 15, 2025';
  readonly payFromWalletLabel = 'Pay from wallet →';
  readonly payFromWalletRoute = '/wallet';
  readonly claimsTitle = 'Claims';
  readonly fileClaimLabel = 'File a claim';
  readonly fileClaimRoute = '/insurance/file-claim';
  readonly noClaimsText = 'No claims filed for this policy.';

  readonly details: PolicyDetailItem[] = [
    { label: 'Product', value: 'Moto Cover' },
    { label: 'Premium', value: '8 TND / month' },
    { label: 'Coverage', value: '2,000 TND' },
    { label: 'Start date', value: 'Dec 15, 2024' },
    { label: 'End date', value: 'Dec 15, 2025' },
  ];
}
