import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminUserDetailData } from '../../../../models';
import { AdminUserService } from '../../../../core/user/admin-user.service';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetail implements OnInit {
  vm: AdminUserDetailData = {
    backRoute: '/admin/users',
    pageTitle: 'User',
    pageSubtitle: '—',
    editLabel: 'Edit',
    editRoute: '/admin/users',
    identityTitle: 'Identity',
    identityFields: [],
    loginHistoryTitle: 'Login history',
    loginHistoryItems: [],
  };
  loading = true;
  error: string | null = null;
  deleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminUser: AdminUserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const numId = id ? +id : 0;
    if (!numId) {
      this.loading = false;
      this.error = 'Invalid user id';
      this.cdr.detectChanges();
      return;
    }
    this.adminUser.getById(numId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (u) => {
        const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || '—';
        const role = u.role || '—';
        const roleClass = role === 'ADMIN' ? 'badge-admin' : role === 'CLIENT' ? 'badge-client' : role === 'AGENT' ? 'badge-agent' : role === 'SELLER' ? 'badge-seller' : role === 'INSURER' ? 'badge-insurer' : 'badge-default';
        this.vm = {
          backRoute: '/admin/users',
          pageTitle: name,
          pageSubtitle: role,
          editLabel: 'Edit',
          editRoute: '/admin/users/edit/' + u.id,
          identityTitle: 'Identity',
          identityFields: [
            { label: 'First name', value: u.firstName ?? '—' },
            { label: 'Last name', value: u.lastName ?? '—' },
            { label: 'Email', value: u.email ?? '—' },
            { label: 'Phone', value: u.phoneNumber != null ? String(u.phoneNumber) : '—' },
            { label: 'CIN', value: u.cin != null ? String(u.cin) : '—' },
            { label: 'Date of birth', value: u.dateOfBirth ? new Date(u.dateOfBirth).toLocaleDateString() : '—' },
            { label: 'Address', value: u.address ?? '—' },
            { label: 'City', value: u.city ?? '—' },
            { label: 'Role', value: role, valueClass: roleClass },
          ],
          loginHistoryTitle: 'Login history',
          loginHistoryItems: [],
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load user';
        this.cdr.detectChanges();
      },
    });
  }

  deleteUser(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const numId = id ? +id : 0;
    if (!numId || !confirm('Delete this user? This cannot be undone.')) return;
    this.deleting = true;
    this.adminUser.delete(numId).pipe(
      finalize(() => {
        this.deleting = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to delete user';
        this.cdr.detectChanges();
      },
    });
  }
}
