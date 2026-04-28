import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DelinquencyService,
  DelinquencyCaseDto,
  RecoveryActionDto,
  CreateRecoveryActionDto,
} from '../../../../services/delinquency/delinquency.service';

@Component({
  selector: 'app-delinquency-detail',
  standalone: false,
  templateUrl: './delinquency-detail.html',
  styleUrl: './delinquency-detail.css',
})
export class DelinquencyDetail implements OnInit {
  readonly backRoute = '/admin/repayments/delinquency';

  caseData: DelinquencyCaseDto | null = null;
  actions: RecoveryActionDto[] = [];
  loading = true;
  actionsLoading = true;
  error = '';

  // Formulaire "Ajouter une action"
  showActionForm = false;
  actionForm: CreateRecoveryActionDto = {
    delinquencyCaseId: 0,
    actionType: '',
    result: '',
    description: '',
    nextActionNote: '',
    nextActionDate: '',
  };
  savingAction = false;
  actionError = '';

  // Options pour le formulaire
  readonly actionTypeOptions = [
    'PHONE_CALL', 'SMS', 'EMAIL',
    'HOME_VISIT', 'WORK_VISIT',
    'DEMAND_LETTER', 'NEGOTIATION',
    'PAYMENT_PLAN', 'VEHICLE_LOCATION',
    'VEHICLE_SEIZURE', 'LEGAL_ACTION',
  ];
  readonly resultOptions = [
    'CONTACTED', 'NOT_CONTACTED', 'PROMISE_MADE',
    'PAYMENT_RECEIVED', 'REFUSED', 'NO_ANSWER',
    'WRONG_ADDRESS', 'VEHICLE_FOUND', 'NEGOTIATED', 'ESCALATED',
  ];

  // Modale assignation agent
  showAssignModal = false;
  agentIdInput: number | null = null;
  assignError = '';

  // Modale clôture
  showCloseModal = false;
  closureReason = 'PAID';
  readonly closureReasons = ['PAID', 'RESTRUCTURED', 'WRITTEN_OFF'];

  constructor(
    private route: ActivatedRoute,
    private delinquencyService: DelinquencyService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCase(id);
    this.loadActions(id);
  }

  loadCase(id: number): void {
    this.loading = true;
    this.delinquencyService.getCaseById(id).subscribe({
      next: (data) => { this.caseData = data; this.loading = false; },
      error: () => { this.error = 'Erreur chargement du dossier.'; this.loading = false; }
    });
  }

  loadActions(id: number): void {
    this.actionsLoading = true;
    this.delinquencyService.getActionsByCase(id).subscribe({
      next: (data) => { this.actions = data; this.actionsLoading = false; },
      error: () => { this.actionsLoading = false; }
    });
  }

  // ── Ajouter une action ────────────────────────────────────────────────
  openActionForm(): void {
    this.actionForm = {
      delinquencyCaseId: this.caseData!.id,
      actionType: '',
      result: '',
      description: '',
      nextActionNote: '',
      nextActionDate: '',
    };
    this.actionError = '';
    this.showActionForm = true;
  }

  submitAction(): void {
    if (!this.actionForm.actionType || !this.actionForm.result || !this.actionForm.description) {
      this.actionError = 'Type, résultat et description sont obligatoires.';
      return;
    }
    this.savingAction = true;
    this.delinquencyService.createAction(this.actionForm).subscribe({
      next: (a) => {
        this.actions.unshift(a);
        this.showActionForm = false;
        this.savingAction = false;
        // Recharger le dossier pour maj du statut (NEW→CONTACTED)
        this.loadCase(this.caseData!.id);
      },
      error: () => { this.actionError = 'Erreur enregistrement.'; this.savingAction = false; }
    });
  }

  // ── Assigner un agent ─────────────────────────────────────────────────
  submitAssign(): void {
    if (!this.agentIdInput) { this.assignError = 'ID agent requis.'; return; }
    this.delinquencyService.assignAgent(this.caseData!.id, this.agentIdInput).subscribe({
      next: (updated) => { this.caseData = updated; this.showAssignModal = false; this.assignError = ''; },
      error: () => { this.assignError = 'Erreur lors de l\'assignation.'; }
    });
  }

  // ── Escalader ─────────────────────────────────────────────────────────
  escalate(): void {
    this.delinquencyService.escalateCase(this.caseData!.id).subscribe({
      next: (updated) => { this.caseData = updated; }
    });
  }

  // ── Clôturer ──────────────────────────────────────────────────────────
  submitClose(): void {
    this.delinquencyService.closeCase(this.caseData!.id, this.closureReason).subscribe({
      next: (updated) => { this.caseData = updated; this.showCloseModal = false; }
    });
  }

  // ── Helpers d'affichage ───────────────────────────────────────────────
  riskClass(risk: string): string {
    const map: Record<string, string> = {
      LOW: 'bg-green-50 text-green-700', MODERATE: 'bg-amber-50 text-amber-700',
      HIGH: 'bg-orange-50 text-orange-700', CRITICAL: 'bg-red-50 text-red-700',
    };
    return map[risk] ?? 'bg-gray-100 text-gray-600';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      NEW: 'bg-gray-100 text-gray-600', CONTACTED: 'bg-blue-50 text-blue-600',
      IN_PROGRESS: 'bg-blue-50 text-[#135bec]', RECOVERED: 'bg-green-50 text-green-700',
      CLOSED: 'bg-gray-50 text-gray-400',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  categoryClass(cat: string): string {
    const map: Record<string, string> = {
      FRIENDLY: 'bg-teal-50 text-teal-700', PRE_LEGAL: 'bg-amber-50 text-amber-700',
      LEGAL: 'bg-red-50 text-red-700', WRITTEN_OFF: 'bg-gray-200 text-gray-500',
    };
    return map[cat] ?? 'bg-gray-100 text-gray-600';
  }

  resultClass(result: string): string {
    const map: Record<string, string> = {
      PAYMENT_RECEIVED: 'bg-green-50 text-green-700', PROMISE_MADE: 'bg-blue-50 text-blue-700',
      CONTACTED: 'bg-teal-50 text-teal-700', REFUSED: 'bg-red-50 text-red-700',
      NO_ANSWER: 'bg-gray-100 text-gray-500', NOT_CONTACTED: 'bg-gray-100 text-gray-500',
      ESCALATED: 'bg-orange-50 text-orange-700',
    };
    return map[result] ?? 'bg-gray-100 text-gray-600';
  }

  actionIcon(type: string): string {
    const map: Record<string, string> = {
      PHONE_CALL: 'call', SMS: 'sms', EMAIL: 'mail', HOME_VISIT: 'home',
      WORK_VISIT: 'business', DEMAND_LETTER: 'description', NEGOTIATION: 'handshake',
      PAYMENT_PLAN: 'event_available', VEHICLE_LOCATION: 'location_on',
      VEHICLE_SEIZURE: 'gavel', LEGAL_ACTION: 'account_balance',
    };
    return map[type] ?? 'task';
  }

  canClose(): boolean {
    return this.caseData?.status !== 'CLOSED' && this.caseData?.status !== 'RECOVERED';
  }
}
