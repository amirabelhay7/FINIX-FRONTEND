import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { VehicleService } from '../../../services/vehicle/vehicle.service';
import { VehiclePayload } from '../../../models';

/**
 * ViewModel: listing form (MVVM).
 */
@Component({
  selector: 'app-listing-form',
  standalone: false,
  templateUrl: './listing-form.html',
  styleUrl: './listing-form.css',
})
export class ListingForm {
  readonly pageTitle = 'Vehicule a vendre';
  readonly pageSubtitle = "Ajoutez les details de votre vehicule comme sur Marketplace.";
  readonly backRoute = '/seller/listings';
  readonly sellerName = 'Koussay Ben Attia';
  readonly location = 'Ariana';
  readonly selectedVehicleType = 'Voiture/Camion';
  readonly selectedBodyStyle = 'Camion';
  readonly selectedVehicleState = 'Bon';
  readonly titleLabel = 'Titre';
  readonly titlePlaceholder = 'Titre';
  readonly priceLabel = 'Prix';
  readonly pricePlaceholder = 'Prix';
  readonly yearLabel = 'Annee';
  readonly yearPlaceholder = 'Annee';
  readonly brandLabel = 'Marque';
  readonly modelLabel = 'Modele';
  readonly fuelLabel = 'Type de carburant';
  readonly descriptionLabel = 'Description';
  readonly descriptionPlaceholder = 'Description';
  readonly draftLabel = 'Enregistrer le brouillon';
  readonly nextLabel = 'Suivant';

  readonly vehicleTypes = [
    'Voiture/Camion',
    'Moto',
    'Sports extremes',
    'Camping-car',
    'Remorque',
    'Bateau',
    'Commercial/Industriel',
    'Autre',
  ];

  form = {
    year: '',
    marque: '',
    modele: '',
    prix: '',
    description: '',
    phoneNumber: '',
    localisation: '',
    serieVehicule: '',
  };

  isSubmitting = false;
  submitError = '';
  submitSuccess = '';

  constructor(
    private vehicleService: VehicleService,
    private router: Router,
  ) {}

  submitVehicle(): void {
    this.submitError = '';
    this.submitSuccess = '';

    const marque = this.form.marque.trim();
    const modele = this.form.modele.trim();
    const prixTnd = Number(String(this.form.prix).replace(',', '.').trim());
    const phoneNumber = this.form.phoneNumber.trim();
    const localisation = this.form.localisation.trim();
    const serieVehicule = this.form.serieVehicule.trim();

    if (!marque || !modele || !Number.isFinite(prixTnd) || prixTnd <= 0) {
      this.submitError = 'Veuillez renseigner marque, modele et un prix valide (> 0).';
      return;
    }
    if (!/^[0-9]{8}$/.test(phoneNumber)) {
      this.submitError = 'Numero de telephone invalide (8 chiffres).';
      return;
    }
    if (localisation.length < 3) {
      this.submitError = 'Localisation requise.';
      return;
    }
    if (!/^[0-9]{3}\s*TUN\s*[0-9]{4}$/i.test(serieVehicule)) {
      this.submitError = 'Serie invalide (ex: 111 TUN 1111).';
      return;
    }

    const payload: VehiclePayload = {
      marque,
      modele,
      prixTnd,
      status: 'DISPONIBLE',
      active: true,
      phoneNumber,
      localisation,
      serieVehicule,
      imageUrl: null,
    };

    this.isSubmitting = true;
    this.vehicleService
      .createVehicle(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.submitSuccess = 'Vehicule ajoute avec succes.';
          this.router.navigate(['/seller/vehicles']);
        },
        error: (err) => {
          this.submitError = this.httpErrorMessage(err);
        },
      });
  }

  private httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as unknown;
      if (typeof body === 'string' && body.trim().length > 0) {
        return body;
      }
      if (body && typeof body === 'object') {
        const obj = body as Record<string, unknown>;
        if (typeof obj['message'] === 'string') {
          return obj['message'];
        }
      }
      if (err.status === 401) return "Session non autorisee pour cette action. Reconnectez-vous si necessaire.";
      if (err.status === 403) return "Votre role n'a pas la permission d'ajouter un vehicule.";
      if (err.status === 0) return 'Backend injoignable. Verifiez que le serveur Spring est demarre.';
      return `Erreur HTTP ${err.status}`;
    }
    return 'Erreur inattendue lors de la creation du vehicule.';
  }
}
