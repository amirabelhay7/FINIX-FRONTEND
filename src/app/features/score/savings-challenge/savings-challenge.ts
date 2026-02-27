import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import {
  SavingsChallengeApi,
  SavingsEnrollmentApi,
  SavingsMonthRow,
  SavingsPeriodPaymentApi
} from '../../../models';

@Component({
  selector: 'app-savings-challenge',
  standalone: false,
  templateUrl: './savings-challenge.html',
  styleUrl: './savings-challenge.css',
})
export class SavingsChallenge implements OnInit {
  readonly pageTitle = 'Savings Challenge';
  readonly pageSubtitle = 'Save regularly to earn points — use savings as down payment for vehicle credit. No penalty if you withdraw early.';
  readonly backRoute = '/score/dashboard';
  readonly backLabel = 'Back to score';
  readonly joinLabel = 'Join this challenge';
  readonly payPeriodLabel = 'Pay this period';
  readonly withdrawLabel = 'Withdraw to wallet';
  readonly leaveChallengeLabel = 'Leave challenge';
  readonly leaveChallengeConfirmTitle = 'Leave savings challenge?';
  readonly leaveChallengeConfirmMessage = 'Your current balance will be returned to your wallet (no penalty). You will no longer be in this challenge and can join another one later.';
  readonly noPenaltyNote = 'You can withdraw your savings anytime with no penalty. Points are only awarded after each period ends (money left in the challenge).';
  readonly monthlyHistoryTitle = 'Period history';
  readonly tipText = 'Pay each period from your wallet. Points are added to your score only after the period ends. No penalty if you withdraw early.';
  readonly pointsNote = 'Awarded only after period end (when challenge is completed for that period).';
  readonly notEnrolledTitle = 'Choose a challenge';
  readonly notEnrolledSubtitle = 'Join one challenge. You pay the amount each period from your wallet and earn points. Withdraw anytime — no penalty.';

  loading = true;
  loadingAction = false;
  error: string | null = null;
  showPayModal = false;
  payModalMessage = '';
  showLeaveModal = false;
  challenges: SavingsChallengeApi[] = [];
  enrollment: SavingsEnrollmentApi | null = null;
  monthlyHistory: SavingsMonthRow[] = [];

  constructor(
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    forkJoin({
      challenges: this.scoreService.getSavingsChallenges(),
      enrollment: this.scoreService.getMySavingsChallenge(),
    }).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: ({ challenges: list, enrollment: en }) => {
        this.challenges = list || [];
        this.enrollment = en;
        this.buildMonthlyHistory();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load';
        this.cdr.detectChanges();
      },
    });
  }

  buildMonthlyHistory(): void {
    if (!this.enrollment?.periodHistory?.length) {
      this.monthlyHistory = [];
      return;
    }
    this.monthlyHistory = this.enrollment.periodHistory.map((p: SavingsPeriodPaymentApi) => {
      const detail = `${p.amount} TND saved` + (p.periodCompleted ? ` · +${p.pointsEarned} pts` : ' · points after period end');
      const statusLabel = p.periodCompleted ? 'Done' : (p.periodEndAt ? 'Ends ' + this.formatShortDate(p.periodEndAt) : 'In progress');
      const statusClass = p.periodCompleted ? 'sc-status-done' : 'sc-status-pending';
      return { month: this.formatMonth(p.paidAt), detail, statusLabel, statusClass };
    });
  }

  formatShortDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatMonth(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  joinChallenge(challenge: SavingsChallengeApi): void {
    this.loadingAction = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.enrollSavingsChallenge(challenge.id).pipe(
      finalize(() => { this.loadingAction = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (en) => {
        this.enrollment = en;
        this.buildMonthlyHistory();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = (err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message) || 'Enroll failed';
        this.cdr.detectChanges();
      },
    });
  }

  payPeriod(): void {
    if (!this.enrollment) return;
    this.loadingAction = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.paySavingsPeriod().pipe(
      finalize(() => { this.loadingAction = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (en) => {
        this.enrollment = en;
        this.buildMonthlyHistory();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = (err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message) || 'Payment failed.';
        const isBalance = /insufficient|balance/i.test(msg);
        this.payModalMessage = isBalance
          ? 'Not enough balance in your wallet. Add funds from Wallet → Deposit, then try again.'
          : msg;
        this.showPayModal = true;
        this.cdr.detectChanges();
      },
    });
  }

  closePayModal(): void {
    this.showPayModal = false;
    this.payModalMessage = '';
    this.cdr.detectChanges();
  }

  withdraw(): void {
    if (!this.enrollment || (this.enrollment.balance ?? 0) <= 0) return;
    this.loadingAction = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.withdrawSavingsChallenge().pipe(
      finalize(() => { this.loadingAction = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (en) => {
        this.enrollment = en;
        this.buildMonthlyHistory();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = (err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || err?.message) || 'Withdraw failed';
        this.cdr.detectChanges();
      },
    });
  }

  get commitmentAmount(): string {
    if (!this.enrollment?.challenge) return '—';
    return `${this.enrollment.challenge.amountTnd} TND`;
  }

  get commitmentUnit(): string {
    if (!this.enrollment?.challenge) return '';
    return `/ ${this.enrollment.challenge.periodMonths} months`;
  }

  get commitmentNote(): string {
    if (!this.enrollment?.challenge) return '';
    const pts = this.enrollment.challenge.pointsPerPeriod ?? 0;
    return `+${pts} points per period, awarded after the period ends (keep money in). No penalty if you withdraw early.`;
  }

  get progressPercent(): number {
    if (!this.enrollment?.challenge) return 0;
    const periodMonths = this.enrollment.challenge.periodMonths || 1;
    const completed = this.enrollment.periodsCompleted ?? 0;
    return Math.min(100, (completed / Math.max(1, periodMonths)) * 100);
  }

  get progressText(): string {
    const completed = this.enrollment?.periodsCompleted ?? 0;
    return `${completed} period(s) paid`;
  }

  get totalSavedAmount(): string {
    const total = this.enrollment?.totalDeposited ?? 0;
    return `${total} TND`;
  }

  get pointsEarnedAmount(): string {
    if (!this.enrollment?.periodHistory) return '+0';
    const pts = this.enrollment.periodHistory
      .filter((p: SavingsPeriodPaymentApi) => p.periodCompleted)
      .reduce((sum: number, p: SavingsPeriodPaymentApi) => sum + (p.pointsEarned ?? 0), 0);
    return `+${pts}`;
  }

  get canWithdraw(): boolean {
    return (this.enrollment?.balance ?? 0) > 0;
  }

  /** True when the user is allowed to pay the next period (no cooldown or cooldown passed). */
  get canPayNextPeriod(): boolean {
    const dueAt = this.enrollment?.nextPeriodDueAt;
    if (!dueAt) return true;
    return new Date(dueAt).getTime() <= Date.now();
  }

  /** Message when Pay is disabled because next period is not yet due. */
  get nextPeriodDueMessage(): string {
    const dueAt = this.enrollment?.nextPeriodDueAt;
    if (!dueAt || this.canPayNextPeriod) return '';
    const d = new Date(dueAt);
    return `Next payment available after ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`;
  }

  openLeaveModal(): void {
    this.showLeaveModal = true;
    this.cdr.detectChanges();
  }

  closeLeaveModal(): void {
    this.showLeaveModal = false;
    this.cdr.detectChanges();
  }

  confirmLeaveChallenge(): void {
    if (!this.enrollment) return;
    this.loadingAction = true;
    this.error = null;
    this.closeLeaveModal();
    this.cdr.detectChanges();
    this.scoreService.leaveSavingsChallenge().pipe(
      finalize(() => { this.loadingAction = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.enrollment = null;
        this.monthlyHistory = [];
        this.load();
      },
      error: (err) => {
        this.error = (err?.error?.message || err?.message) || 'Could not leave challenge';
        this.cdr.detectChanges();
      },
    });
  }
}
