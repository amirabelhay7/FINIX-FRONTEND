import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { AdminUserApi, AdminUserService } from '../../../../services/user/admin-user.service';

interface UserRow {
  id?: number;
  name: string;
  email: string;
  role: string;
  roleClass: string;
  status: 'ACTIVE' | 'INACTIVE';
  statusClass: string;
  cin: string;
  city: string;
  viewRoute: string;
  editRoute: string;
}

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  readonly pageTitle = 'Users & Identity';
  readonly pageSubtitle =
    'Manage users, roles (CLIENT, AGENT, SELLER, INSURER, ADMIN), and KYC.';

  searchTerm = '';
  selectedRole = '';

  loading = false;
  errorMessage = '';
  actionMessage = '';
  users: UserRow[] = [];

  constructor(
    private adminUser: AdminUserService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminUser
      .getAll()
      .pipe(
        catchError(() => {
          this.errorMessage = 'Unable to load users right now. Please try again.';
          return of([] as AdminUserApi[]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((rows) => {
        this.users = (rows as AdminUserApi[]).map((u) => this.mapUser(u));
        this.cdr.detectChanges();
      });
  }

  isCurrentUser(user: UserRow): boolean {
    const me = this.auth.getPayload()?.userId;
    if (me == null || user.id == null) return false;
    return Number(user.id) === Number(me);
  }

  get filteredUsers(): UserRow[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.users.filter((u) => {
      const roleMatch = !this.selectedRole || u.role === this.selectedRole;
      const searchMatch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.cin.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q);
      return roleMatch && searchMatch;
    });
  }

  get roleOptions(): string[] {
    return [...new Set(this.users.map((u) => u.role).filter(Boolean))].sort();
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0 || !!this.selectedRole;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
  }

  deactivateUser(user: UserRow): void {
    if (!user.id || user.status === 'INACTIVE') return;
    const ok = confirm(`Deactivate ${user.name}? They will no longer be active.`);
    if (!ok) return;

    this.actionMessage = '';
    this.adminUser
      .deactivate(user.id)
      .pipe(
        catchError((err) => {
          this.actionMessage = err?.error?.message || 'Unable to deactivate user right now.';
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (!res) {
          this.cdr.detectChanges();
          return;
        }
        this.users = this.users.map((u) =>
          u.id === user.id ? { ...u, status: 'INACTIVE', statusClass: 'b-pending' } : u,
        );
        this.actionMessage = `${user.name} deactivated.`;
        this.cdr.detectChanges();
      });
  }

  private mapUser(u: AdminUserApi): UserRow {
    const first = this.asText(u.firstName);
    const last = this.asText(u.lastName);
    const name = `${first} ${last}`.trim() || '—';

    const role = this.asText(u.role).toUpperCase() || 'CLIENT';
    const status = this.normalizeStatus(u.active);
    const id = u.id;

    return {
      id,
      name,
      email: this.asText(u.email) || '—',
      role,
      roleClass: this.roleClass(role),
      status,
      statusClass: status === 'INACTIVE' ? 'b-pending' : 'b-green',
      cin: this.asText(u.cin) || '—',
      city: this.asText(u.city) || '—',
      viewRoute: `/admin/users/${id ?? ''}`,
      editRoute: `/admin/users/edit/${id ?? ''}`,
    };
  }

  private normalizeStatus(value: unknown): 'ACTIVE' | 'INACTIVE' {
    const v = this.asText(value).toUpperCase();
    return v === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }

  private asText(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }

  private roleClass(role: string): string {
    switch (role) {
      case 'AGENT':
        return 'b-orange';
      case 'SELLER':
        return 'b-green';
      case 'INSURER':
        return 'b-purple';
      case 'ADMIN':
        return 'b-pending';
      case 'CLIENT':
      default:
        return 'b-blue';
    }
  }
}
