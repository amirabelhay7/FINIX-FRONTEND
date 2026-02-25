import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { ScoreConfigApi } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-rules-list',
  standalone: false,
  templateUrl: './rules-list.html',
  styleUrl: './rules-list.css',
})
export class RulesList implements OnInit {
  readonly pageTitle = 'Scoring Rules';
  readonly pageSubtitle = 'Configure score rules: document verification, profile, wallet, guarantees.';
  readonly addRuleLabel = 'Add Rule';
  readonly addRuleRoute = '/admin/scoring/rules/new';
  readonly searchPlaceholder = 'Search rules...';
  readonly typeFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DOCUMENT_VERIFICATION', label: 'DOCUMENT_VERIFICATION' },
    { value: 'PROFILE_COMPLETION', label: 'PROFILE_COMPLETION' },
    { value: 'WALLET_DEPOSIT', label: 'WALLET_DEPOSIT' },
    { value: 'GUARANTEE_RECEIVED', label: 'GUARANTEE_RECEIVED' },
  ];
  readonly editLabel = 'Edit';
  readonly deleteLabel = 'Delete';

  loading = true;
  error: string | null = null;
  rules: ScoreConfigApi[] = [];
  searchText = '';
  typeFilter = '';

  constructor(
    private scoreService: ScoreService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRules();
  }

  loadRules() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getRules().pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (list) => { this.rules = list ?? []; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load rules';
        this.cdr.detectChanges();
      }
    });
  }

  get activeRulesCount(): number {
    return (this.rules ?? []).filter(r => r.isActive).length;
  }

  get filteredRows() {
    let list = this.rules;
    if (this.searchText.trim()) {
      const q = this.searchText.trim().toLowerCase();
      list = list.filter(r =>
        (r.ruleName || '').toLowerCase().includes(q) ||
        (r.ruleType || '').toLowerCase().includes(q)
      );
    }
    if (this.typeFilter) {
      list = list.filter(r => r.ruleType === this.typeFilter);
    }
    return list.map(r => ({
      id: r.id,
      ruleName: r.ruleName,
      type: r.ruleType,
      points: String(r.points ?? 0),
      status: r.isActive ? 'Active' : 'Inactive',
      statusClass: r.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600',
      editRoute: `/admin/scoring/rules/edit/${r.id}`,
      actionLabel: r.isActive ? 'Deactivate' : 'Activate',
      actionButtonClass: r.isActive ? 'text-red-600' : 'text-green-600',
    }));
  }

  deleteRule(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm('Delete this rule?')) return;
    this.scoreService.deleteRule(id).subscribe({
      next: () => this.loadRules(),
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Delete failed';
        this.cdr.detectChanges();
      }
    });
  }
}
