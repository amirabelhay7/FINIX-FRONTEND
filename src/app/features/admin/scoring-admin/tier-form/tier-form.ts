import { Component } from '@angular/core';
import { AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin tier form (MVVM).
 * All labels, placeholders, options, and routes in VM; view only binds.
 */
@Component({
  selector: 'app-tier-form',
  standalone: false,
  templateUrl: './tier-form.html',
  styleUrl: './tier-form.css',
})
export class TierForm {
  readonly pageTitle = 'User Tier';
  readonly pageSubtitle = 'Create or edit a tier (score range, benefits, status).';
  readonly backRoute = '/admin/scoring/tiers';

  readonly labelTierName = 'Tier name';
  readonly labelMinScore = 'Min score';
  readonly labelMaxScore = 'Max score';
  readonly labelTierColor = 'Tier color (CSS)';
  readonly labelBenefits = 'Benefits (JSON or text)';
  readonly labelNextTierMin = 'Next tier min score';
  readonly labelStatus = 'Status';

  readonly placeholderTierName = 'e.g. BRONZE, SILVER, GOLD';
  readonly placeholderMinScore = '0';
  readonly placeholderMaxScore = '999';
  readonly placeholderTierColor = 'e.g. #CD7F32';
  readonly placeholderBenefits = 'e.g. Lower rates, priority support';
  readonly placeholderNextTier = 'Score needed for next tier';

  readonly statusOptions: AdminFilterOption[] = [
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'INACTIVE', label: 'INACTIVE' },
  ];

  readonly saveLabel = 'Save';
  readonly cancelLabel = 'Cancel';
  readonly cancelRoute = '/admin/scoring/tiers';
}
