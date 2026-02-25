import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { GuaranteeApi } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-guarantees-list',
  standalone: false,
  templateUrl: './guarantees-list.html',
  styleUrl: './guarantees-list.css',
})
export class GuaranteesList implements OnInit {
  readonly pageTitle = 'Guarantees';
  readonly pageSubtitle = 'All guarantees: guarantor, beneficiary, points, acceptance status.';
  readonly searchPlaceholder = 'Search by guarantor or beneficiary...';
  readonly statusFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All status' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'pending', label: 'Pending' },
  ];
  readonly viewLabel = 'View';

  loading = true;
  error: string | null = null;
  guarantees: GuaranteeApi[] = [];
  searchText = '';
  statusFilter = '';

  constructor(
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadGuarantees();
  }

  loadGuarantees() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getGuarantees().pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (list) => { this.guarantees = list ?? []; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load guarantees';
        this.cdr.detectChanges();
      }
    });
  }

  get acceptedCount(): number {
    return (this.guarantees ?? []).filter(g => g.isAccepted).length;
  }

  get pendingCount(): number {
    return (this.guarantees ?? []).filter(g => !g.isAccepted).length;
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString();
  }

  get filteredRows() {
    let list = this.guarantees;
    if (this.searchText.trim()) {
      const q = this.searchText.trim().toLowerCase();
      list = list.filter(g =>
        (g.guarantorName || '').toLowerCase().includes(q) ||
        (g.beneficiaryName || '').toLowerCase().includes(q)
      );
    }
    if (this.statusFilter === 'accepted') list = list.filter(g => g.isAccepted);
    if (this.statusFilter === 'pending') list = list.filter(g => !g.isAccepted);
    return list.map(g => ({
      id: g.id,
      guarantor: g.guarantorName,
      beneficiary: g.beneficiaryName,
      points: String(g.pointsOffered ?? 0),
      created: this.formatDate(g.createdAt),
      accepted: g.isAccepted ? 'Yes' : 'Pending',
      acceptedClass: g.isAccepted ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700',
      viewRoute: `/admin/scoring/guarantees/${g.id}`,
    }));
  }
}
