import { Component } from '@angular/core';
import { InsuranceOption } from '../../../models';

/**
 * ViewModel: file a claim (MVVM).
 */
@Component({
  selector: 'app-file-claim',
  standalone: false,
  templateUrl: './file-claim.html',
  styleUrl: './file-claim.css',
})
export class FileClaim {
  readonly pageTitle = 'File a Claim';
  readonly pageSubtitle = 'Submit your claim for review.';
  readonly backRoute = '/insurance/my-policies';
  readonly policyLabel = 'Policy';
  readonly claimTypeLabel = 'Claim type';
  readonly amountLabel = 'Amount claimed (TND)';
  readonly descriptionLabel = 'Description';
  readonly descriptionPlaceholder = 'Describe what happened...';
  readonly submitLabel = 'Submit claim';

  readonly policies: InsuranceOption[] = [
    { value: 'pol-0012', label: 'POL-2025-0012 · Moto Cover' },
  ];

  readonly claimTypes: InsuranceOption[] = [
    { value: 'theft', label: 'Theft' },
    { value: 'damage', label: 'Damage' },
    { value: 'other', label: 'Other' },
  ];
}
