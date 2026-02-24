import { Component } from '@angular/core';
import { AdminUserDetailData } from '../../../../models';

/**
 * ViewModel: admin user detail (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetail {
  readonly vm: AdminUserDetailData = {
    backRoute: '/admin/users',
    pageTitle: 'User #1',
    pageSubtitle: 'Amadou Kone · CLIENT',
    editLabel: 'Edit',
    editRoute: '/admin/users/edit/1',
    identityTitle: 'Identity',
    identityFields: [
      { label: 'First name', value: 'Amadou' },
      { label: 'Last name', value: 'Kone' },
      { label: 'Email', value: 'amadou.kone@email.com' },
      { label: 'Phone', value: '+216 12 345 678' },
      { label: 'CIN', value: '12345678' },
      { label: 'Date of birth', value: '1990-05-15' },
      { label: 'Address', value: '12 Rue de la République' },
      { label: 'City', value: 'Tunis' },
      { label: 'Role', value: 'CLIENT', valueClass: 'px-2 py-0.5 rounded text-xs bg-blue-50 text-[#135bec]' },
    ],
    loginHistoryTitle: 'Login history',
    loginHistoryItems: [
      { date: '2025-02-24 10:32', ip: 'IP 192.168.1.1' },
      { date: '2025-02-23 14:20', ip: 'IP 192.168.1.1' },
    ],
  };

}
