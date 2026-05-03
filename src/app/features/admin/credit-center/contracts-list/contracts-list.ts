import { Component } from '@angular/core';
import { ContractListItem } from '../../../../models';

/**
 * ViewModel: loan contracts list (MVVM).
 */
@Component({
  selector: 'app-contracts-list',
  standalone: false,
  templateUrl: './contracts-list.html',
  styleUrl: './contracts-list.css',
})
export class ContractsList {
  readonly pageTitle = 'Loan contracts';
  readonly pageSubtitle = 'Active and closed loan contracts.';

  readonly contracts: ContractListItem[] = [
    { contractNumber: 'FIN-2025-0842', clientName: 'Amadou Kone', principal: '5,000 TND', status: 'ACTIVE', statusClass: 'bg-green-50 text-green-700' },
    { contractNumber: 'FIN-2026-0102', clientName: 'Mariem Said', principal: '3,200 TND', status: 'ACTIVE', statusClass: 'bg-green-50 text-green-700' },
    { contractNumber: 'FIN-2026-0098', clientName: 'Karim Ben Ali', principal: '12,000 TND', status: 'PENDING_SIGNATURE', statusClass: 'bg-amber-50 text-amber-700' },
    { contractNumber: 'FIN-2023-4521', clientName: 'Amadou Kone', principal: '6,200 TND', status: 'CLOSED', statusClass: 'bg-gray-100 text-gray-600' },
  ];

  onViewContract(c: ContractListItem): void {}
}
