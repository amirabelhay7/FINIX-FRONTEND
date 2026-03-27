import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import {
  AdminUserApi,
  AdminUserCreateResponse,
  AdminUserService,
  AdminUserUpsertPayload,
} from '../../../../services/user/admin-user.service';

type Role = 'CLIENT' | 'AGENT' | 'SELLER' | 'INSURER' | 'ADMIN';

interface UserFormModel {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cin: string;
  role: Role;
  address: string;
  city: string;
  password: string;
}

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  readonly roles: Role[] = ['CLIENT', 'AGENT', 'SELLER', 'INSURER', 'ADMIN'];
  readonly backRoute = '/admin/users';

  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  editingUserId: number | null = null;

  form: UserFormModel = this.createEmptyForm();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminUser: AdminUserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.editingUserId = idParam ? Number(idParam) : null;

    if (this.editingUserId) {
      this.loadUser(this.editingUserId);
    }
  }

  get pageTitle(): string {
    return this.editingUserId ? 'Edit user' : 'Create user';
  }

  get pageSubtitle(): string {
    return this.editingUserId
      ? 'Update user identity and access details.'
      : 'Add a new account and assign a role. Leave password empty to email an invitation (Brevo) so the user sets their own password.';
  }

  get submitLabel(): string {
    return this.saving ? 'Saving...' : this.editingUserId ? 'Save changes' : 'Create user';
  }

  get isValid(): boolean {
    const hasRequired =
      !!this.form.firstName.trim() &&
      !!this.form.lastName.trim() &&
      !!this.form.email.trim() &&
      !!this.form.role;
    return hasRequired;
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.isValid) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    const cin = this.form.cin.trim();
    if (cin && !/^\d+(\.\d+)?$/.test(cin)) {
      this.errorMessage = 'CIN must be numeric.';
      return;
    }

    const payload = this.toPayload(this.form);
    this.saving = true;

    const request$ = this.editingUserId
      ? this.adminUser.update(this.editingUserId, payload)
      : this.adminUser.create(payload);

    request$
      .pipe(
        catchError((err) => {
          this.errorMessage =
            err?.error?.message ||
            err?.message ||
            `Unable to save user right now (HTTP ${err?.status ?? 'error'}).`;
          return of(null);
        }),
        finalize(() => {
          this.saving = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((res) => {
        if (!res) return;
        if (this.editingUserId) {
          this.successMessage = 'User updated successfully.';
        } else {
          const r = res as AdminUserCreateResponse & Record<string, unknown>;
          this.successMessage =
            typeof r.message === 'string'
              ? r.message
              : 'User created successfully.';
        }
        setTimeout(() => this.router.navigate(['/admin/users']), 1200);
      });
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminUser
      .getById(id)
      .pipe(
        catchError(() => {
          this.errorMessage = 'Unable to load user details.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((u) => {
        if (!u) return;
        this.form = this.fromApi(u);
        this.cdr.detectChanges();
      });
  }

  private createEmptyForm(): UserFormModel {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      cin: '',
      role: 'CLIENT',
      address: '',
      city: '',
      password: '',
    };
  }

  private fromApi(u: AdminUserApi): UserFormModel {
    const role = (String(u.role ?? 'CLIENT').toUpperCase() as Role);
    return {
      firstName: String(u.firstName ?? '').trim(),
      lastName: String(u.lastName ?? '').trim(),
      email: String(u.email ?? '').trim(),
      phoneNumber: u.phoneNumber == null ? '' : String(u.phoneNumber),
      cin: u.cin == null ? '' : String(u.cin),
      role: this.roles.includes(role) ? role : 'CLIENT',
      address: String(u.address ?? '').trim(),
      city: String(u.city ?? '').trim(),
      password: '',
    };
  }

  private toPayload(form: UserFormModel): AdminUserUpsertPayload {
    const payload: AdminUserUpsertPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
    };

    const cin = form.cin.trim();
    if (cin) payload.cin = Number(cin);

    const phone = form.phoneNumber.trim();
    if (phone && !Number.isNaN(Number(phone))) payload.phoneNumber = Number(phone);

    const password = form.password.trim();
    if (password) payload.password = password;

    return payload;
  }
}
