import { Component } from '@angular/core';
import { InsurancePolicy } from '../../../models';

/**
 * ViewModel: my policies (MVVM).
 */
@Component({
  selector: 'app-my-policies',
  standalone: false,
  templateUrl: './my-policies.html',
  styleUrl: './my-policies.css',
})
export class MyPolicies {
  readonly pageTitle = 'My Policies';
  readonly pageSubtitle = 'Your active and past insurance policies.';
  readonly activeSectionTitle = 'Active policies';
  readonly pastSectionTitle = 'Past policies';

  readonly activePolicies: InsurancePolicy[] = [
    { id: 1, productName: 'Moto Cover', policyNumber: 'POL-2026-0012', detail: 'Active until Dec 15, 2026 · 25 TND/month · Next due Mar 15', route: '/insurance/policy/1', icon: 'two_wheeler', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    { id: 2, productName: 'Health Micro', policyNumber: 'POL-2026-0048', detail: 'Active until Aug 20, 2026 · 38 TND/month · Next due Mar 20', route: '/insurance/policy/2', icon: 'health_and_safety', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
  ];

  readonly pastPolicies: (InsurancePolicy & { statusLabel: string })[] = [
    { id: 3, productName: 'Home Shield', policyNumber: 'POL-2024-0892', detail: 'Expired Dec 31, 2025 · Was 45 TND/month', route: '', icon: 'home', iconBgClass: 'bg-gray-100', iconColorClass: 'text-gray-500', statusLabel: 'Expired' },
    { id: 4, productName: 'Moto Cover', policyNumber: 'POL-2024-0122', detail: 'Cancelled Jun 10, 2025', route: '', icon: 'two_wheeler', iconBgClass: 'bg-gray-100', iconColorClass: 'text-gray-500', statusLabel: 'Cancelled' },
  ];
}
