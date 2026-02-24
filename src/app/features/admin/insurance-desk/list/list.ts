import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: insurance desk hub (MVVM).
 */
@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Insurance desk';
  readonly pageSubtitle = 'Products, policies, claims.';

  readonly cards: AdminHubCard[] = [
    { title: 'Products', subtitle: 'Insurance products', route: '/admin/insurance/products', icon: 'inventory_2', iconColorClass: 'text-[#135bec]' },
    { title: 'Policies', subtitle: 'Active policies', route: '/admin/insurance/policies', icon: 'verified_user', iconColorClass: 'text-green-600' },
    { title: 'Claims', subtitle: 'Review claims', route: '/admin/insurance/claims', icon: 'report', iconColorClass: 'text-amber-500' },
  ];
}
