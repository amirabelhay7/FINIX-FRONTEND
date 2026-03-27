import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AdminUserApi, AdminLoginHistoryEntry, AdminUserService } from '../../../../services/user/admin-user.service';
import { AdminUserDetailData } from '../../../../models';

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetail implements OnInit {
  loading = true;
  errorMessage = '';
  vm: AdminUserDetailData | null = null;

  constructor(
    private route: ActivatedRoute,
    private adminUser: AdminUserService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : NaN;
    if (!Number.isFinite(id) || id < 1) {
      this.loading = false;
      this.errorMessage = 'Invalid user id.';
      return;
    }

    forkJoin({
      user: this.adminUser.getById(id).pipe(
        catchError(() => {
          this.errorMessage = 'Unable to load user.';
          return of(null);
        }),
      ),
      history: this.adminUser.getLoginHistory(id).pipe(
        catchError(() => of([] as AdminLoginHistoryEntry[])),
      ),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe(({ user, history }) => {
        if (!user) return;
        this.vm = this.buildVm(user, history ?? []);
        this.cdr.detectChanges();
      });
  }

  private buildVm(u: AdminUserApi, history: AdminLoginHistoryEntry[]): AdminUserDetailData {
    const role = String(u.role ?? 'CLIENT').toUpperCase();
    const status = this.normalizeStatus(u.status, u.active);
    const name = `${String(u.firstName ?? '').trim()} ${String(u.lastName ?? '').trim()}`.trim() || '—';
    const onboarding =
      String(u.onboardingStatus ?? '').toUpperCase() === 'PENDING_INVITE' || u.mustSetPassword === true
        ? 'PENDING INVITE'
        : 'ACTIVE';

    const identityFields: { label: string; value: string; valueClass?: string }[] = [
      { label: 'First name', value: String(u.firstName ?? '').trim() || '—' },
      { label: 'Last name', value: String(u.lastName ?? '').trim() || '—' },
      { label: 'Email', value: String(u.email ?? '').trim() || '—' },
      {
        label: 'Phone',
        value: u.phoneNumber != null && u.phoneNumber !== undefined ? String(u.phoneNumber) : '—',
      },
      { label: 'CIN', value: u.cin != null && u.cin !== undefined ? String(u.cin) : '—' },
      { label: 'Address', value: String(u.address ?? '').trim() || '—' },
      { label: 'City', value: String(u.city ?? '').trim() || '—' },
      { label: 'Role', value: role, valueClass: this.roleBadgeClass(role) },
      { label: 'Status', value: status, valueClass: this.statusBadgeClass(status) },
      { label: 'Onboarding', value: onboarding },
    ];

    if (u.invitedBy) {
      identityFields.push({ label: 'Invited by', value: String(u.invitedBy) });
    }

    const loginHistoryItems = (history ?? []).map((h) => ({
      date: this.formatLoginDate(h.loginDate),
      ip: h.ipAddress ? `IP ${h.ipAddress}` : '—',
      action: h.action ? String(h.action) : 'LOGIN',
    }));

    return {
      backRoute: '/admin/users',
      pageTitle: `User #${u.id}`,
      pageSubtitle: `${name} · ${role}`,
      editLabel: 'Edit',
      editRoute: `/admin/users/edit/${u.id}`,
      identityTitle: 'Identity',
      identityFields,
      loginHistoryTitle: 'Login activity',
      loginHistoryItems,
    };
  }

  private normalizeStatus(statusValue: unknown, activeValue: unknown): string {
    const s = String(statusValue ?? '').toUpperCase();
    if (s === 'ACTIVE' || s === 'INACTIVE' || s === 'DELETED') return s;
    const a = String(activeValue ?? '').toUpperCase();
    if (a === 'INACTIVE') return 'INACTIVE';
    if (a === 'DELETED') return 'DELETED';
    return 'ACTIVE';
  }

  private formatLoginDate(raw: string | null | undefined): string {
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return raw;
      return d.toLocaleString();
    } catch {
      return raw;
    }
  }

  private roleBadgeClass(role: string): string {
    switch (role) {
      case 'AGENT':
        return 'px-2 py-0.5 rounded text-xs bg-orange-50 text-orange-800';
      case 'SELLER':
        return 'px-2 py-0.5 rounded text-xs bg-green-50 text-green-800';
      case 'INSURER':
        return 'px-2 py-0.5 rounded text-xs bg-purple-50 text-purple-800';
      case 'ADMIN':
        return 'px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-800';
      case 'CLIENT':
      default:
        return 'px-2 py-0.5 rounded text-xs bg-blue-50 text-[#135bec]';
    }
  }

  private statusBadgeClass(status: string): string {
    switch (status) {
      case 'INACTIVE':
        return 'px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-800';
      case 'DELETED':
        return 'px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700';
      case 'ACTIVE':
      default:
        return 'px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-800';
    }
  }
}
