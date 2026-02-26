import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminUserApi, AdminCreateUserRequest, AdminUserFormLabels, AdminFilterOption } from '../../../../models';
import { AdminUserService } from '../../../../core/user/admin-user.service';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  readonly labels: AdminUserFormLabels = {
    pageTitle: 'Create user',
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
      { value: 'CLIENT', label: 'Client' },
      { value: 'AGENT', label: 'Agent' },
      { value: 'SELLER', label: 'Seller' },
      { value: 'INSURER', label: 'Insurer' },
      { value: 'ADMIN', label: 'Admin' },
    ],
  };

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phoneNumber: number | null = null;
  dateOfBirth = '';
  cin: number | null = null;
  role = 'CLIENT';
  address = '';
  city = '';

  loading = true;
  saving = false;
  error: string | null = null;
  isEdit = false;
  editId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminUser: AdminUserService,
    private cdr: ChangeDetectorRef,
  ) {}

  get passwordRequired(): boolean {
    return !this.isEdit;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = +id;
      this.labels.pageTitle = 'Edit user';
      this.adminUser.getById(this.editId).pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      ).subscribe({
        next: (u) => {
          this.firstName = u.firstName ?? '';
          this.lastName = u.lastName ?? '';
          this.email = u.email ?? '';
          this.phoneNumber = u.phoneNumber ?? null;
          this.dateOfBirth = u.dateOfBirth ? u.dateOfBirth.toString().slice(0, 10) : '';
          this.cin = u.cin ?? null;
          this.role = u.role ?? 'CLIENT';
          this.address = u.address ?? '';
          this.city = u.city ?? '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load user';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  submit(): void {
    this.error = null;
    if (this.passwordRequired && !this.password.trim()) {
      this.error = 'Password is required.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim()) {
      this.error = 'First name, last name and email are required.';
      this.cdr.detectChanges();
      return;
    }
    this.saving = true;
    if (this.isEdit && this.editId != null) {
      const payload: Partial<AdminUserApi> & { password?: string } = {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        phoneNumber: this.phoneNumber ?? undefined,
        dateOfBirth: this.dateOfBirth || undefined,
        cin: this.cin ?? undefined,
        role: this.role,
        address: this.address.trim() || undefined,
        city: this.city.trim() || undefined,
      };
      if (this.password.trim()) payload.password = this.password;
      this.adminUser.update(this.editId, payload).pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }),
      ).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to update user';
          this.cdr.detectChanges();
        },
      });
    } else {
      const payload: AdminCreateUserRequest = {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim(),
        password: this.password,
        phoneNumber: this.phoneNumber ?? undefined,
        dateOfBirth: this.dateOfBirth || undefined,
        cin: this.cin ?? undefined,
        role: this.role,
        address: this.address.trim() || undefined,
        city: this.city.trim() || undefined,
      };
      this.adminUser.create(payload).pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }),
      ).subscribe({
        next: () => this.router.navigate(['/admin/users']),
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to create user';
          this.cdr.detectChanges();
        },
      });
    }
  }
}
