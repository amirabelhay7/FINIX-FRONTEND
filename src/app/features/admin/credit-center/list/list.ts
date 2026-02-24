import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: credit center hub (MVVM).
 */
@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Credit Center';
  readonly pageSubtitle = 'Loan requests, approvals, contracts, documents.';

  readonly cards: AdminHubCard[] = [
    { title: 'Loan requests', subtitle: 'Approve / reject', route: '/admin/credit/requests', icon: 'assignment', iconColorClass: 'text-[#135bec]' },
    { title: 'Contracts', subtitle: 'Loan contracts', route: '/admin/credit/contracts', icon: 'description', iconColorClass: 'text-green-600' },
  ];
}
