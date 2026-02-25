import { Component } from '@angular/core';
import { UserListItem } from '../../../../models';

/**
 * ViewModel: users list (MVVM).
 */
@Component({
  selector: 'app-admin-users-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Users & Identity';
  readonly pageSubtitle = 'Manage users, roles (CLIENT, AGENT, SELLER, INSURER, ADMIN), and KYC.';

  readonly users: UserListItem[] = [
    { id: 1, name: 'Amadou Kone', email: 'amadou.kone@email.com', role: 'CLIENT', roleClass: 'bg-blue-50 text-[#135bec]', cin: '12345678', city: 'Tunis', viewRoute: '/admin/users/1', editRoute: '/admin/users/edit/1' },
    { id: 2, name: 'Mariem Said', email: 'mariem.said@email.com', role: 'AGENT', roleClass: 'bg-amber-50 text-amber-700', cin: '87654321', city: 'Sfax', viewRoute: '/admin/users/2', editRoute: '/admin/users/edit/2' },
    { id: 3, name: 'Alex Johnson', email: 'alex@finix.com', role: 'ADMIN', roleClass: 'bg-gray-100 text-gray-700', cin: '—', city: 'Tunis', viewRoute: '/admin/users/3', editRoute: '/admin/users/edit/3' },
    { id: 4, name: 'AutoPlus Sfax', email: 'contact@autoplus-sfax.tn', role: 'SELLER', roleClass: 'bg-emerald-50 text-emerald-700', cin: '—', city: 'Sfax', viewRoute: '/admin/users/4', editRoute: '/admin/users/edit/4' },
    { id: 5, name: 'Assurance Tunisie', email: 'partenariat@assurance-tunisie.tn', role: 'INSURER', roleClass: 'bg-violet-50 text-violet-700', cin: '—', city: 'Tunis', viewRoute: '/admin/users/5', editRoute: '/admin/users/edit/5' },
  ];
}
