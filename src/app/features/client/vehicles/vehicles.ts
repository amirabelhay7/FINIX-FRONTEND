import { Component, OnDestroy } from '@angular/core';
import { CreateRequestLoanPayload } from '../../../models/credit.model';
import { AuthService } from '../../../services/auth/auth.service';
import { Credit } from '../../../services/credit/credit.service';

interface VehicleCatalogItem {
  id: number;
  marque: string;
  modele: string;
  prixTnd: number;
  subtitle: string;
  emoji: string;
}

@Component({
  selector: 'app-client-vehicles',
  standalone: false,
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class ClientVehicles implements OnDestroy {
  readonly minDureeMois = 12;
  readonly maxDureeMois = 60;

  showRequestLoanModal = false;
  selectedVehicle: VehicleCatalogItem | null = null;

  useApportPersonnel = false;

  requestForm = {
    montantDemande: 0,
    apportPersonnel: 0,
    dureeMois: this.minDureeMois,
    mensualiteEstimee: 0,
    objectifCredit: 'Achat véhicule',
  };

  isSubmitting = false;
  submitError = '';
  submitSuccess = '';

  /** Bannière en haut de la page (auto-masquée après 5 s). */
  toastMessage = '';
  private toastClearHandle: ReturnType<typeof setTimeout> | null = null;

  catalogVehicles: VehicleCatalogItem[] = [
    { id: 1, marque: 'TOYOTA', modele: 'Yaris Cross', prixTnd: 52900, subtitle: 'SUV · Hybride · 2024', emoji: '🚗' },
    { id: 1, marque: 'KIA', modele: 'Sportage', prixTnd: 68500, subtitle: 'SUV · Diesel · 2024', emoji: '🚙' },
    { id: 1, marque: 'VOLKSWAGEN', modele: 'Golf', prixTnd: 58000, subtitle: 'Berline · Essence · 2023', emoji: '🏎️' },
  ];

  constructor(
    private creditService: Credit,
    private authService: AuthService,
  ) {}

  ngOnDestroy(): void {
    this.clearToastTimer();
  }

  private clearToastTimer(): void {
    if (this.toastClearHandle !== null) {
      clearTimeout(this.toastClearHandle);
      this.toastClearHandle = null;
    }
  }

  private showTopToast(message: string, durationMs = 5000): void {
    this.clearToastTimer();
    this.toastMessage = message;
    this.toastClearHandle = setTimeout(() => {
      this.toastMessage = '';
      this.toastClearHandle = null;
    }, durationMs);
  }

  openRequestLoanModal(vehicle: VehicleCatalogItem): void {
    this.selectedVehicle = vehicle;
    this.useApportPersonnel = false;
    this.requestForm = {
      montantDemande: vehicle.prixTnd,
      apportPersonnel: 0,
      dureeMois: this.minDureeMois,
      mensualiteEstimee: 0,
      objectifCredit: 'Achat véhicule',
    };
    this.recalculateMensualite();
    this.submitError = '';
    this.submitSuccess = '';
    this.showRequestLoanModal = true;
  }

  closeRequestLoanModal(): void {
    this.showRequestLoanModal = false;
  }

  /** Réinitialise l’état du formulaire après envoi réussi (rafraîchit l’UI comme un nouveau chargement). */
  private resetRequestLoanFormAfterSubmit(): void {
    this.selectedVehicle = null;
    this.useApportPersonnel = false;
    this.requestForm = {
      montantDemande: 0,
      apportPersonnel: 0,
      dureeMois: this.minDureeMois,
      mensualiteEstimee: 0,
      objectifCredit: 'Achat véhicule',
    };
  }

  onUseApportPersonnelChange(checked: boolean): void {
    this.useApportPersonnel = checked;
    if (!checked) {
      this.requestForm.apportPersonnel = 0;
    }
    this.recalculateMensualite();
  }

  recalculateMensualite(): void {
    const duree = Math.min(this.maxDureeMois, Math.max(this.minDureeMois, Number(this.requestForm.dureeMois) || this.minDureeMois));
    this.requestForm.dureeMois = duree;

    const totalPrix =
      (this.selectedVehicle?.prixTnd ?? Number(this.requestForm.montantDemande)) || 0;
    const rawApport = this.useApportPersonnel ? Math.max(0, Number(this.requestForm.apportPersonnel) || 0) : 0;
    // Apport cannot exceed the vehicle total price.
    const apport = Math.min(rawApport, totalPrix);
    this.requestForm.apportPersonnel = apport;

    // Montant demande reacts with apport: montantDemande = prixVehicule - apport
    const montantDemande = Math.max(0, totalPrix - apport);
    this.requestForm.montantDemande = montantDemande;

    // Mensualite uses the requested amount (after subtracting apport).
    this.requestForm.mensualiteEstimee = Number((montantDemande / duree).toFixed(2));
  }

  submitRequestLoan(): void {
    if (!this.selectedVehicle) {
      return;
    }

    const userId = this.getConnectedUserId();
    if (!userId) {
      this.submitError = 'Utilisateur connecté introuvable. Veuillez vous reconnecter.';
      return;
    }

    const vehiculeId = this.findVehicleId(this.selectedVehicle.marque, this.selectedVehicle.modele, this.selectedVehicle.prixTnd);
    if (!vehiculeId) {
      this.submitError = 'Véhicule introuvable pour cette sélection.';
      return;
    }

    this.recalculateMensualite();
    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    const payload: CreateRequestLoanPayload = {
      montantDemande: Number(this.requestForm.montantDemande),
      apportPersonnel: Number(this.requestForm.apportPersonnel),
      dureeMois: Number(this.requestForm.dureeMois),
      mensualiteEstimee: Number(this.requestForm.mensualiteEstimee),
      objectifCredit: this.requestForm.objectifCredit || 'Achat véhicule',
      statutDemande: 'PENDING',
      userId,
      vehiculeId,
      dateCreation: new Date().toISOString(),
    };

    this.creditService.createRequestLoan(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitError = '';
        this.submitSuccess = '';
        this.closeRequestLoanModal();
        this.resetRequestLoanFormAfterSubmit();
        this.showTopToast('La demande de crédit a été envoyée avec succès.');
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Echec de l envoi de la demande.';
      },
    });
  }

  private getConnectedUserId(): number | null {
    const payload = this.authService.getPayload();
    if (payload?.userId) {
      return payload.userId;
    }

    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) {
        return null;
      }

      const user = JSON.parse(raw);
      return typeof user.userId === 'number' ? user.userId : null;
    } catch {
      return null;
    }
  }

  private findVehicleId(marque: string, modele: string, prixTnd: number): number | null {
    const match = this.catalogVehicles.find(
      (item) =>
        item.marque.toLowerCase() === marque.toLowerCase() &&
        item.modele.toLowerCase() === modele.toLowerCase() &&
        item.prixTnd === prixTnd,
    );

    return match ? match.id : null;
  }
}
