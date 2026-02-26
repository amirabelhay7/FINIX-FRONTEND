import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { UserListItem } from '../../../../models';
import { AdminUserService } from '../../../../core/user/admin-user.service';
import { AuthService } from '../../../../core/auth/auth.service';

const ROLE_CLASS: Record<string, string> = {
  CLIENT: 'role-client',
  AGENT: 'role-agent',
  SELLER: 'role-seller',
  INSURER: 'role-insurer',
  ADMIN: 'role-admin',
};

function apiToListItem(u: { id: number; firstName: string; lastName: string; email: string; role: string; cin?: number; city?: string }): UserListItem {
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
  const role = u.role || '—';
  return {
    id: u.id,
    name,
    email: u.email || '—',
    role,
    roleClass: ROLE_CLASS[role] ?? 'role-default',
    cin: u.cin != null ? String(u.cin) : '—',
    city: u.city || '—',
    viewRoute: '/admin/users/' + u.id,
    editRoute: '/admin/users/edit/' + u.id,
  };
}

@Component({
  selector: 'app-admin-users-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  readonly pageTitle = 'Users & Identity';
  readonly pageSubtitle = 'Manage users, roles (CLIENT, AGENT, SELLER, INSURER, ADMIN), and invite new users.';

  users: UserListItem[] = [];
  searchQuery = '';
  roleFilter = '';
  loading = true;
  error: string | null = null;
  deletingId: number | null = null;
  /** User selected for delete confirmation (opens custom confirm dialog). */
  userToDelete: UserListItem | null = null;
  confirmDialogOpen = false;
  confirmDeleteLoading = false;

  constructor(
    private adminUser: AdminUserService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  /** Current logged-in user (to highlight "your" account in the list). */
  get currentUser(): { id: number; email: string } | null {
    const u = this.auth.getCurrentUser();
    if (!u || u.id == null) return null;
    return { id: u.id, email: u.email };
  }

  isCurrentUser(user: UserListItem): boolean {
    const cu = this.currentUser;
    if (!cu) return false;
    return user.id === cu.id || user.email === cu.email;
  }

  get filteredUsers(): UserListItem[] {
    let list = this.users;
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.cin.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      );
    }
    if (this.roleFilter) {
      list = list.filter((u) => u.role === this.roleFilter);
    }
    return list;
  }

  readonly roleOptions: { value: string; label: string }[] = [
    { value: '', label: 'All roles' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'AGENT', label: 'Agent' },
    { value: 'SELLER', label: 'Seller' },
    { value: 'INSURER', label: 'Insurer' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  ngOnInit(): void {
    this.adminUser.getAll().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (list) => {
        this.users = (list || []).map(apiToListItem);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load users';
        this.cdr.detectChanges();
      },
    });
  }

  /** Opens the confirm dialog for deleting a user. */
  deleteUser(user: UserListItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.userToDelete = user;
    this.confirmDialogOpen = true;
  }

  get confirmDeleteMessage(): string {
    const u = this.userToDelete;
    if (!u) return '';
    return `Delete user "${u.name}" (${u.email})? This cannot be undone.`;
  }

  onConfirmDelete(): void {
    const user = this.userToDelete;
    if (!user) return;
    this.confirmDeleteLoading = true;
    this.adminUser.delete(user.id).pipe(
      finalize(() => {
        // Defer all state updates to next tick to avoid NG0103 infinite change detection
        setTimeout(() => {
          this.confirmDeleteLoading = false;
          this.userToDelete = null;
          this.confirmDialogOpen = false;
          this.deletingId = null;
          this.cdr.detectChanges();
        }, 0);
      }),
    ).subscribe({
      next: () => {
        this.users = this.users.filter((u) => u.id !== user.id);
        if (this.isCurrentUser(user)) {
          this.auth.logout();
        }
      },
      error: (err) => {
        const message = err?.error?.message || err?.message || 'Failed to delete user';
        setTimeout(() => {
          this.error = message;
          this.cdr.detectChanges();
        }, 0);
      },
    });
  }

  onCancelConfirm(): void {
    this.userToDelete = null;
    this.confirmDialogOpen = false;
  }
}
