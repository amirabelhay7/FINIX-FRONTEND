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
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  statusClass: string;
  onboarding: 'PENDING_INVITE' | 'ACTIVE';
  onboardingClass: string;
  cin: string;
  city: string;
  deletedAt?: string;
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
  showDeleted = false;

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
      .getAll(this.showDeleted)
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

  toggleShowDeleted(): void {
    this.showDeleted = !this.showDeleted;
    this.loadUsers();
  }

  onIncludeDeletedChange(): void {
    this.loadUsers();
  }

  deactivateUser(user: UserRow): void {
    if (!user.id || user.status !== 'ACTIVE') return;
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
      .subscribe(() => {
        this.users = this.users.map((u) =>
          u.id === user.id ? { ...u, status: 'INACTIVE', statusClass: this.statusClass('INACTIVE') } : u,
        );
        this.actionMessage = `${user.name} deactivated.`;
        this.cdr.detectChanges();
      });
  }

  softDeleteUser(user: UserRow): void {
    if (!user.id || user.status === 'DELETED') return;
    const ok = confirm(`Soft delete ${user.name}? The account will be blocked but kept for audit.`);
    if (!ok) return;

    this.actionMessage = '';
    const deletedBy = this.auth.getPayload()?.sub || this.auth.getUserName();
    this.adminUser
      .softDelete(user.id, deletedBy, 'Soft deleted by admin')
      .pipe(
        catchError((err) => {
          this.actionMessage = err?.error?.message || 'Unable to soft delete user right now.';
          return of(null);
        }),
      )
      .subscribe(() => {
        this.showDeleted = true;
        this.users = this.users
          .map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  status: 'DELETED' as 'DELETED',
                  statusClass: this.statusClass('DELETED'),
                }
              : u,
          )
          .filter((u) => this.showDeleted || u.status !== 'DELETED');
        this.actionMessage = `${user.name} soft deleted and moved to DELETED status.`;
        this.cdr.detectChanges();
      });
  }

  restoreUser(user: UserRow): void {
    if (!user.id || user.status !== 'INACTIVE') return;
    const ok = confirm(`Restore ${user.name} and reactivate login?`);
    if (!ok) return;

    this.actionMessage = '';
    this.adminUser
      .restore(user.id)
      .pipe(
        catchError((err) => {
          this.actionMessage = err?.error?.message || 'Unable to restore user right now.';
          return of(null);
        }),
      )
      .subscribe(() => {
        this.users = this.users.map((u) =>
          u.id === user.id ? { ...u, status: 'ACTIVE', statusClass: this.statusClass('ACTIVE') } : u,
        );
        this.actionMessage = `${user.name} restored.`;
        this.cdr.detectChanges();
      });
  }

  private mapUser(u: AdminUserApi): UserRow {
    const first = this.asText(u.firstName);
    const last = this.asText(u.lastName);
    const name = `${first} ${last}`.trim() || '—';

    const role = this.asText(u.role).toUpperCase() || 'CLIENT';
    const status = this.normalizeStatus(u.status, u.active);
    const id = u.id;

    const pendingInvite =
      this.asText(u.onboardingStatus).toUpperCase() === 'PENDING_INVITE' || u.mustSetPassword === true;
    const onboarding: 'PENDING_INVITE' | 'ACTIVE' = pendingInvite ? 'PENDING_INVITE' : 'ACTIVE';

    return {
      id,
      name,
      email: this.asText(u.email) || '—',
      role,
      roleClass: this.roleClass(role),
      status,
      statusClass: this.statusClass(status),
      onboarding,
      onboardingClass: this.onboardingClass(onboarding),
      cin: this.asText(u.cin) || '—',
      city: this.asText(u.city) || '—',
      deletedAt: this.asText(u.deletedAt) || undefined,
      viewRoute: `/admin/users/${id ?? ''}`,
      editRoute: `/admin/users/edit/${id ?? ''}`,
    };
  }

  private onboardingClass(onboarding: 'PENDING_INVITE' | 'ACTIVE'): string {
    return onboarding === 'PENDING_INVITE' ? 'b-warning' : 'b-green';
  }

  resendInvite(user: UserRow): void {
    if (!user.id || user.onboarding !== 'PENDING_INVITE') return;
    const ok = confirm(`Resend invitation email to ${user.email}?`);
    if (!ok) return;
    this.actionMessage = '';
    this.adminUser
      .resendInvite(user.id)
      .pipe(
        catchError((err) => {
          this.actionMessage = err?.error?.message || err?.message || 'Unable to resend invite.';
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (!res) return;
        this.actionMessage = res.message || 'Invitation email resent.';
        this.cdr.detectChanges();
      });
  }

  private normalizeStatus(statusValue: unknown, activeValue: unknown): 'ACTIVE' | 'INACTIVE' | 'DELETED' {
    const status = this.asText(statusValue).toUpperCase();
    if (status === 'ACTIVE' || status === 'INACTIVE' || status === 'DELETED') return status;
    const active = this.asText(activeValue).toUpperCase();
    if (active === 'INACTIVE') return 'INACTIVE';
    if (active === 'DELETED') return 'DELETED';
    return 'ACTIVE';
  }

  private statusClass(status: 'ACTIVE' | 'INACTIVE' | 'DELETED'): string {
    switch (status) {
      case 'INACTIVE':
        return 'b-pending';
      case 'DELETED':
        return 'b-purple';
      case 'ACTIVE':
      default:
        return 'b-green';
    }
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
