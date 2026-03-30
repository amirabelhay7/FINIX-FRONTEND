import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, finalize, of, Subject, takeUntil, timeout } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { Credit } from '../../../services/credit/credit.service';
import { ClientCreditsSearchService } from '../../../services/client-credits-search.service';
import { RequestLoanDto } from '../../../models/credit.model';

@Component({
  selector: 'app-client-credits',
  standalone: false,
  templateUrl: './credits.html',
  styleUrl: './credits.css',
})
export class ClientCredits implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  allLoans: RequestLoanDto[] = [];
  myLoans: RequestLoanDto[] = [];

  loading = false;
  error = '';

  selectedLoan: RequestLoanDto | null = null;
  showEditModal = false;
  submitting = false;
  submitError = '';
  submitSuccess = '';

  /** Snapshot: montant demandé (net) + apport = total à financer (fixe à l’ouverture du modal). */
  montantTotalCredit = 0;

  editForm = {
    dureeMois: 12,
    mensualiteEstimee: 0,
    apportPersonnel: 0,
  };

  constructor(
    private creditService: Credit,
    private authService: AuthService,
    private clientCreditsSearch: ClientCreditsSearchService,
  ) {}

  ngOnInit(): void {
    this.clientCreditsSearch.searchChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyStatusFilter();
    });
    this.loadMyRequestLoans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Message sous la liste vide (aucune donnée API vs filtre sans résultat). */
  get emptyCreditsMessage(): string {
    if (this.loading || this.error) {
      return '';
    }
    if (this.allLoans.length === 0) {
      return 'No credits...';
    }
    if (this.myLoans.length === 0) {
      const q = this.clientCreditsSearch.getSearchQuery().trim().toUpperCase();
      if (q && !['PENDING', 'APPROVED', 'REJECTED'].includes(q)) {
        return 'Saisissez PENDING, APPROVED ou REJECTED.';
      }
      return 'Aucune demande pour ce statut.';
    }
    return '';
  }

  /**
   * Recherche vide → uniquement PENDING (comportement par défaut).
   * Sinon filtre exact (insensible à la casse) sur PENDING | APPROVED | REJECTED.
   */
  private applyStatusFilter(): void {
    if (!this.allLoans.length) {
      this.myLoans = [];
      return;
    }
    const q = this.clientCreditsSearch.getSearchQuery().trim().toUpperCase();
    if (!q) {
      this.myLoans = this.allLoans.filter((l) => l.statutDemande === 'PENDING');
      return;
    }
    if (q === 'PENDING' || q === 'APPROVED' || q === 'REJECTED') {
      this.myLoans = this.allLoans.filter((l) => l.statutDemande === q);
      return;
    }
    this.myLoans = [];
  }

  loadMyRequestLoans(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.loading = false;
      this.allLoans = [];
      this.myLoans = [];
      this.error = 'Utilisateur connecte introuvable (userId manquant).';
      return;
    }

    this.loading = true;
    this.error = '';
    this.allLoans = [];
    this.myLoans = [];

    this.creditService
      .getRequestLoansByUserId(userId, 0, 200)
      .pipe(
        timeout(15000),
        catchError(() => {
          this.error = 'Impossible de charger vos demandes (timeout ou serveur indisponible).';
          this.loading = false;
          return of({ content: [] as RequestLoanDto[] });
        }),
      )
      .subscribe({
        next: (response: any) => {
          const list = Array.isArray((response as any)?.content)
            ? (response as any).content
            : [response as RequestLoanDto];
          this.allLoans = list;
          this.applyStatusFilter();
          this.loading = false;
        },
        error: () => {
          this.error = 'Impossible de charger vos demandes.';
          this.loading = false;
        },
      });
  }

  openEditModal(loan: RequestLoanDto): void {
    if (loan.statutDemande !== 'PENDING') {
      return;
    }

    this.selectedLoan = loan;
    const net = Number(loan.montantDemande) || 0;
    const ap = Math.max(0, Number(loan.apportPersonnel) || 0);
    this.montantTotalCredit = net + ap;
    this.editForm.apportPersonnel = Math.min(ap, this.montantTotalCredit);
    this.editForm.dureeMois = Math.max(12, Math.min(60, Number(loan.dureeMois) || 12));
    this.recalculateMensualite();
    this.submitError = '';
    this.submitSuccess = '';
    this.showEditModal = true;
  }

  /** Montant demandé (TND) affiché = part financée après déduction de l’apport. */
  get montantDemandeNet(): number {
    const cap = this.montantTotalCredit;
    const ap = Math.max(0, Math.min(cap, Number(this.editForm.apportPersonnel) || 0));
    return Math.max(0, cap - ap);
  }

  onApportPersonnelChange(): void {
    const cap = this.montantTotalCredit;
    let v = Number(this.editForm.apportPersonnel);
    if (Number.isNaN(v)) {
      v = 0;
    }
    this.editForm.apportPersonnel = Math.max(0, Math.min(cap, v));
    this.recalculateMensualite();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedLoan = null;
    this.montantTotalCredit = 0;
    this.submitError = '';
    this.submitSuccess = '';
  }

  recalculateMensualite(): void {
    if (!this.selectedLoan) {
      return;
    }

    const duree = Math.max(12, Math.min(60, Number(this.editForm.dureeMois) || 12));
    this.editForm.dureeMois = duree;

    const principal = this.montantDemandeNet;
    this.editForm.mensualiteEstimee = duree > 0 ? Number((principal / duree).toFixed(2)) : 0;
  }

  validateModification(): void {
    if (!this.selectedLoan) {
      return;
    }

    this.submitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    this.creditService
      .updateRequestLoan(this.selectedLoan.idDemande, {
        // Backend validation expects camelCase and requires (at least) dureeMois + montantDemande.
        dureeMois: this.editForm.dureeMois,
        montantDemande: this.montantDemandeNet,
        apportPersonnel: Number(this.editForm.apportPersonnel) || 0,
        mensualiteEstimee: this.editForm.mensualiteEstimee,
        objectifCredit: this.selectedLoan.objectifCredit,
        // The UI only allows editing PENDING loans.
        statutDemande: 'PENDING',
      })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadMyRequestLoans();
        },
        error: () => {
          this.submitError = 'Echec de la modification de la demande.';
        },
      });
  }

  cancelRequestLoan(): void {
    if (!this.selectedLoan) {
      return;
    }

    this.submitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    this.creditService
      .deleteRequestLoan(this.selectedLoan.idDemande)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadMyRequestLoans();
        },
        error: () => {
          this.submitError = "Echec de l'annulation de la demande.";
        },
      });
  }

  private getCurrentUserId(): number | null {
    const payload = this.authService.getPayload();
    if (payload?.userId) {
      return payload.userId;
    }

    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return typeof user.userId === 'number' ? user.userId : null;
    } catch {
      return null;
    }
  }

}
