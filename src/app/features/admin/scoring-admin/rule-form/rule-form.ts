import { Component } from '@angular/core';
import { AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin scoring rule form (MVVM).
 * All labels, placeholders, options, and routes in VM; view only binds.
 */
@Component({
  selector: 'app-rule-form',
  standalone: false,
  templateUrl: './rule-form.html',
  styleUrl: './rule-form.css',
})
export class RuleForm {
  readonly pageTitle = 'Scoring Rule';
  readonly pageSubtitle = 'Create or edit a scoring rule (ScoreConfig).';
  readonly backRoute = '/admin/scoring/rules';

  readonly labelRuleName = 'Rule name';
  readonly labelRuleType = 'Rule type';
  readonly labelPoints = 'Points';
  readonly labelDescription = 'Description';
  readonly labelDepositThreshold = 'Deposit threshold (optional)';
  readonly labelMaxGuarantees = 'Max guarantees per user (optional)';

  readonly placeholderRuleName = 'e.g. CIN verification';
  readonly placeholderType = 'Select type';
  readonly placeholderPoints = 'e.g. 50';
  readonly placeholderDescription = 'Short description of the rule';
  readonly placeholderDeposit = 'For WALLET_DEPOSIT';
  readonly placeholderMaxGuarantees = 'For GUARANTEE_RECEIVED';

  readonly typeOptions: AdminFilterOption[] = [
    { value: '', label: 'Select type' },
    { value: 'DOCUMENT_VERIFICATION', label: 'DOCUMENT_VERIFICATION' },
    { value: 'PROFILE_COMPLETION', label: 'PROFILE_COMPLETION' },
    { value: 'WALLET_DEPOSIT', label: 'WALLET_DEPOSIT' },
    { value: 'GUARANTEE_RECEIVED', label: 'GUARANTEE_RECEIVED' },
  ];

  readonly saveLabel = 'Save';
  readonly cancelLabel = 'Cancel';
  readonly cancelRoute = '/admin/scoring/rules';
}
