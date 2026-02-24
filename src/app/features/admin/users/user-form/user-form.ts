import { Component } from '@angular/core';
import { AdminUserFormLabels } from '../../../../models';

/**
 * ViewModel: admin user form (MVVM).
 * All labels, options, and static form values in VM; view only binds.
 */
@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm {
  readonly labels: AdminUserFormLabels = {
    pageTitle: 'Edit User',
    backRoute: '/admin/users',
    labelFirstName: 'First name',
    labelLastName: 'Last name',
    labelEmail: 'Email',
    labelPhone: 'Phone',
    labelCin: 'CIN',
    labelRole: 'Role',
    labelAddress: 'Address',
    labelCity: 'City',
    saveLabel: 'Save',
    cancelLabel: 'Cancel',
    cancelRoute: '/admin/users',
    roleOptions: [
      { value: 'CLIENT', label: 'CLIENT' },
      { value: 'AGENT', label: 'AGENT' },
      { value: 'SELLER', label: 'SELLER' },
      { value: 'INSURER', label: 'INSURER' },
      { value: 'ADMIN', label: 'ADMIN' },
    ],
  };

  readonly firstName = 'Amadou';
  readonly lastName = 'Kone';
  readonly email = 'amadou.kone@email.com';
  readonly phone = '+216 12 345 678';
  readonly cin = '12345678';
  readonly role = 'CLIENT';
  readonly address = '12 Rue de la République';
  readonly city = 'Tunis';
}
