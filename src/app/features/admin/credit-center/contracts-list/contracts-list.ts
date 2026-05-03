import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of, Subject, takeUntil, timeout } from 'rxjs';
import { Credit } from '../../../../services/credit/credit.service';
import { LoanContractDetailsDto, LoanContractDto } from '../../../../models/credit.model';

@Component({
  selector: 'app-contracts-list',
  standalone: false,
  templateUrl: './contracts-list.html',
  styleUrl: './contracts-list.css',
})
export class ContractsList implements OnInit, OnDestroy {
  /** When true, hides the standalone page chrome (agent dashboard embed). */
  @Input() embeddedLayout = false;

  /** Optional overrides — used by agent IMF shell (French labels). */
  @Input() pageTitle = 'Loan contracts';
  @Input() pageSubtitle = 'All loan contracts (admin & IMF agent).';

  contracts: LoanContractDto[] = [];
  loading = false;
  error = '';

  page = 0;
  readonly pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  detailOpen = false;
  detailLoading = false;
  detailError = '';
  selectedDetail: LoanContractDetailsDto | null = null;

  pdfLoadingId: number | null = null;

  private readonly destroy$ = new Subject<void>();
  private loadPageFallbackTimer: ReturnType<typeof setTimeout> | null = null;
  private detailFallbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly credit: Credit,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPage(): void {
    this.clearLoadPageFallbackTimer();
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();
    this.loadPageFallbackTimer = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        if (!this.error) {
          this.error = 'Unable to finish loading contracts right now.';
        }
        this.cdr.detectChanges();
      }
    }, 12000);

    this.credit
      .getLoanContracts(this.page, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        timeout(15000),
        catchError((err: HttpErrorResponse) => {
          this.error =
            typeof err.error?.message === 'string'
              ? err.error.message
              : 'Unable to load contracts. Sign in as admin or agent and try again.';
          return of({ content: [], totalElements: 0, totalPages: 0 } as {
            content: LoanContractDto[];
            totalElements: number;
            totalPages: number;
          });
        }),
        finalize(() => {
          this.loading = false;
          this.clearLoadPageFallbackTimer();
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (p) => {
          this.contracts = p.content ?? [];
          this.totalElements = p.totalElements ?? 0;
          this.totalPages = p.totalPages ?? 0;
          this.loading = false;
          this.clearLoadPageFallbackTimer();
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.error =
            typeof err.error?.message === 'string'
              ? err.error.message
              : 'Unable to load contracts. Sign in as admin or agent and try again.';
          this.loading = false;
          this.clearLoadPageFallbackTimer();
          this.cdr.detectChanges();
        },
      });
  }

  prevPage(): void {
    if (this.page <= 0) return;
    this.page -= 1;
    this.loadPage();
  }

  nextPage(): void {
    if (this.page >= this.totalPages - 1) return;
    this.page += 1;
    this.loadPage();
  }

  clientName(c: LoanContractDto): string {
    const a = `${c.clientFirstName ?? ''}`.trim();
    const b = `${c.clientLastName ?? ''}`.trim();
    const joined = `${a} ${b}`.trim();
    return joined.length > 0 ? joined : `Request #${c.requestLoanId ?? '?'}`;
  }

  clientInitials(c: LoanContractDto): string {
    const first = (c.clientFirstName ?? '').trim().charAt(0);
    const last = (c.clientLastName ?? '').trim().charAt(0);
    const initials = `${first}${last}`.toUpperCase();
    return initials || 'CL';
  }

  formatPrincipal(montantCredit?: number | null): string {
    if (typeof montantCredit !== 'number' || Number.isNaN(montantCredit)) {
      return '—';
    }
    return `${montantCredit} TND`;
  }

  contractStatusDisplay(status?: string): string {
    return status ?? '—';
  }

  contractStatusClass(status?: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-600';
      case 'DEFAULTED':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  onViewContract(contract: LoanContractDto): void {
    this.clearDetailFallbackTimer();
    this.detailOpen = true;
    this.detailLoading = true;
    this.detailError = '';
    this.selectedDetail = null;
    this.cdr.detectChanges();
    this.detailFallbackTimer = setTimeout(() => {
      if (this.detailLoading) {
        this.detailLoading = false;
        if (!this.detailError) {
          this.detailError = 'Unable to finish loading contract details right now.';
        }
        this.cdr.detectChanges();
      }
    }, 12000);

    this.credit
      .getLoanContractDetails(contract.idContrat)
      .pipe(
        takeUntil(this.destroy$),
        timeout(15000),
        catchError((err: HttpErrorResponse) => {
          this.detailError =
            typeof err.error?.message === 'string'
              ? err.error.message
              : 'Unable to load contract details.';
          return of(null);
        }),
        finalize(() => {
          this.detailLoading = false;
          this.clearDetailFallbackTimer();
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (d) => {
          this.selectedDetail = d;
          this.detailLoading = false;
          this.clearDetailFallbackTimer();
          this.cdr.detectChanges();
        },
        error: () => {
          // Fallback handled by catchError/finalize.
        },
      });
  }

  closeDetail(): void {
    this.detailOpen = false;
    this.detailLoading = false;
    this.selectedDetail = null;
    this.detailError = '';
    this.clearDetailFallbackTimer();
    this.cdr.detectChanges();
  }

  onDownloadPdf(contract: LoanContractDto): void {
    this.pdfLoadingId = contract.idContrat;
    this.credit
      .downloadLoanContractPdf(contract.idContrat)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.pdfLoadingId = null;
        }),
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${contract.numeroContrat || 'contract'}.pdf`;
          anchor.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.error = 'PDF download failed.';
        },
      });
  }

  paginationLabel(): string {
    const start = this.totalElements === 0 ? 0 : this.page * this.pageSize + 1;
    const end = Math.min((this.page + 1) * this.pageSize, this.totalElements);
    return `${start}–${end} of ${this.totalElements}`;
  }

  private clearLoadPageFallbackTimer(): void {
    if (this.loadPageFallbackTimer) {
      clearTimeout(this.loadPageFallbackTimer);
      this.loadPageFallbackTimer = null;
    }
  }

  private clearDetailFallbackTimer(): void {
    if (this.detailFallbackTimer) {
      clearTimeout(this.detailFallbackTimer);
      this.detailFallbackTimer = null;
    }
  }
}
