import { Component } from '@angular/core';

/** Parc vendeur : liste + feedback par véhicule (modal), sans panneau « entités liées ». */
@Component({
  selector: 'app-seller-vehicles-page',
  standalone: false,
  template: `
    <app-vehicle-workspace
      workspaceMode="seller"
      [showCatalog]="false"
      [showSubEntities]="false"
      headingEyebrow="Espace vendeur"
      headingTitle="Mes vehicules"
    ></app-vehicle-workspace>
  `,
})
export class SellerVehiclesPage {}
