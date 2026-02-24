import { Component } from '@angular/core';
import { Campaign } from '../../../../models';

/**
 * ViewModel: campaigns list (MVVM).
 */
@Component({
  selector: 'app-campaigns-list',
  standalone: false,
  templateUrl: './campaigns-list.html',
  styleUrl: './campaigns-list.css',
})
export class CampaignsList {
  readonly pageTitle = 'Campaigns';
  readonly pageSubtitle = 'Marketing campaigns.';

  readonly campaigns: Campaign[] = [
    { id: 1, name: 'Spring loan promo', channel: 'SMS', segment: 'Gold tier clients', status: 'ACTIVE', statusClass: 'bg-green-50 text-green-700', startEnd: 'Feb 1 – Mar 31, 2026' },
    { id: 2, name: 'Micro-insurance Q1 push', channel: 'Email', segment: 'Silver tier clients', status: 'ACTIVE', statusClass: 'bg-green-50 text-green-700', startEnd: 'Jan 15 – Mar 15, 2026' },
    { id: 3, name: 'Wallet top-up reminder', channel: 'In-app', segment: 'New clients (30d)', status: 'SCHEDULED', statusClass: 'bg-amber-50 text-amber-700', startEnd: 'Mar 1 – Mar 7, 2026' },
    { id: 4, name: 'Vehicle financing offer', channel: 'SMS + Email', segment: 'Vehicle loan holders', status: 'ENDED', statusClass: 'bg-gray-100 text-gray-600', startEnd: 'Dec 1 – Dec 31, 2025' },
    { id: 5, name: 'Re-engagement inactive', channel: 'SMS', segment: 'Inactive 90 days', status: 'DRAFT', statusClass: 'bg-blue-50 text-blue-700', startEnd: '—' },
  ];

  onAddCampaign(): void {}
  onEditCampaign(c: Campaign): void {}
  onDeleteCampaign(c: Campaign): void {}
}
