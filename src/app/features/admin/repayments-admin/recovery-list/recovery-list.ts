import { Component, OnInit } from '@angular/core';
import { AdminFilterOption } from '../../../../models';
import { RecoveryActionDto, DelinquencyService } from '../../../../services/delinquency/delinquency.service';

@Component({
  selector: 'app-recovery-list',
  standalone: false,
  templateUrl: './recovery-list.html',
  styleUrl: './recovery-list.css',
})
export class RecoveryList implements OnInit {
  readonly pageTitle    = 'Actions de recouvrement';
  readonly pageSubtitle = 'Historique de toutes les actions effectuées sur les dossiers.';
  readonly backRoute    = '/admin/repayments';

  readonly actionTypeOptions: AdminFilterOption[] = [
    { value: '', label: 'Tous les types' },
    { value: 'PHONE_CALL',    label: 'Appel téléphonique' },
    { value: 'SMS',           label: 'SMS' },
    { value: 'EMAIL',         label: 'Email' },
    { value: 'HOME_VISIT',    label: 'Visite domicile' },
    { value: 'WORK_VISIT',    label: 'Visite travail' },
    { value: 'DEMAND_LETTER', label: 'Mise en demeure' },
    { value: 'NEGOTIATION',   label: 'Négociation' },
    { value: 'PAYMENT_PLAN',  label: 'Plan de paiement' },
    { value: 'LEGAL_ACTION',  label: 'Action juridique' },
  ];
  readonly resultOptions: AdminFilterOption[] = [
    { value: '', label: 'Tous les résultats' },
    { value: 'CONTACTED',        label: 'Contacté' },
    { value: 'PROMISE_MADE',     label: 'Promesse de paiement' },
    { value: 'PAYMENT_RECEIVED', label: 'Paiement reçu' },
    { value: 'REFUSED',          label: 'Refus' },
    { value: 'NO_ANSWER',        label: 'Sans réponse' },
    { value: 'NOT_CONTACTED',    label: 'Non contacté' },
    { value: 'ESCALATED',        label: 'Escaladé' },
  ];

  allActions: RecoveryActionDto[] = [];
  filteredActions: RecoveryActionDto[] = [];
  loading = true;
  error = '';
  selectedActionType = '';
  selectedResult     = '';

  constructor(private delinquencyService: DelinquencyService) {}

  ngOnInit(): void {
    this.delinquencyService.getAllCases().subscribe({
      next: (cases) => {
        // Charger les actions de tous les dossiers ouverts
        const openCases = cases.filter(c => c.status !== 'CLOSED');
        if (openCases.length === 0) { this.loading = false; return; }

        let loaded = 0;
        openCases.forEach(c => {
          this.delinquencyService.getActionsByCase(c.id).subscribe({
            next: (actions) => {
              this.allActions = [...this.allActions, ...actions];
              loaded++;
              if (loaded === openCases.length) {
                // Trier par date décroissante
                this.allActions.sort((a, b) =>
                  new Date(b.actionDate).getTime() - new Date(a.actionDate).getTime()
                );
                this.applyFilters();
                this.loading = false;
              }
            },
            error: () => { loaded++; if (loaded === openCases.length) this.loading = false; }
          });
        });
      },
      error: () => { this.error = 'Erreur de chargement.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    this.filteredActions = this.allActions.filter(a => {
      const matchType   = !this.selectedActionType || a.actionType === this.selectedActionType;
      const matchResult = !this.selectedResult     || a.result === this.selectedResult;
      return matchType && matchResult;
    });
  }

  onFilterChange(): void { this.applyFilters(); }

  resultClass(result: string): string {
    const map: Record<string, string> = {
      PAYMENT_RECEIVED: 'bg-green-50 text-green-700',
      PROMISE_MADE:     'bg-blue-50 text-blue-700',
      CONTACTED:        'bg-teal-50 text-teal-700',
      REFUSED:          'bg-red-50 text-red-700',
      NO_ANSWER:        'bg-gray-100 text-gray-500',
      NOT_CONTACTED:    'bg-gray-100 text-gray-500',
      ESCALATED:        'bg-orange-50 text-orange-700',
    };
    return map[result] ?? 'bg-gray-100 text-gray-600';
  }

  actionIcon(type: string): string {
    const map: Record<string, string> = {
      PHONE_CALL: 'call', SMS: 'sms', EMAIL: 'mail', HOME_VISIT: 'home',
      WORK_VISIT: 'business', DEMAND_LETTER: 'description',
      NEGOTIATION: 'handshake', PAYMENT_PLAN: 'event_available',
      VEHICLE_LOCATION: 'location_on', VEHICLE_SEIZURE: 'gavel',
      LEGAL_ACTION: 'account_balance',
    };
    return map[type] ?? 'task';
  }

  caseRoute(caseId: number): string {
    return `/admin/repayments/delinquency/${caseId}`;
  }
}
