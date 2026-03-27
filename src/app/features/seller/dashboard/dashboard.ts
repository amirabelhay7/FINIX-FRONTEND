import { Component } from '@angular/core';
import { SellerShellService } from '../../../layout/seller/seller-shell.service';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  transmission: string;
  color: string;
  status: 'active' | 'pending' | 'sold';
  image: string;
  date: string;
  views: number;
}

/** Same data / structure as `origin/emna` `layout/seller/seller.ts` dashboard body. */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  activeTab: 'all' | 'active' | 'pending' | 'sold' = 'all';
  searchQuery = '';

  readonly stats = [
    { label: 'Annonces actives', value: '12', icon: '🚗', trend: '+3 ce mois', trendClass: 'up' as const },
    { label: 'Vues totales', value: '1 847', icon: '👁️', trend: '+12%', trendClass: 'up' as const },
    { label: 'Véhicules vendus', value: '34', icon: '✅', trend: '+5 ce mois', trendClass: 'up' as const },
    { label: 'Revenu estimé', value: '487K', suffix: 'TND', icon: '💰', trend: '+8.2%', trendClass: 'up' as const },
  ];

  readonly vehicles: Vehicle[] = [
    { id: 1, brand: 'Renault', model: 'Clio 5', year: 2024, price: 52000, km: 12000, fuel: 'Essence', transmission: 'Manuelle', color: 'Blanc', status: 'active', image: '🚗', date: '15 Mars 2026', views: 234 },
    { id: 2, brand: 'Peugeot', model: '208 GT', year: 2023, price: 68000, km: 8500, fuel: 'Diesel', transmission: 'Automatique', color: 'Noir', status: 'active', image: '🚙', date: '12 Mars 2026', views: 187 },
    { id: 3, brand: 'Volkswagen', model: 'Golf 8', year: 2024, price: 95000, km: 5200, fuel: 'Essence', transmission: 'Automatique', color: 'Gris', status: 'active', image: '🚘', date: '10 Mars 2026', views: 312 },
    { id: 4, brand: 'Toyota', model: 'Yaris Cross', year: 2023, price: 78000, km: 15000, fuel: 'Hybride', transmission: 'Automatique', color: 'Bleu', status: 'pending', image: '🚗', date: '8 Mars 2026', views: 89 },
    { id: 5, brand: 'Hyundai', model: 'Tucson', year: 2024, price: 115000, km: 3000, fuel: 'Diesel', transmission: 'Automatique', color: 'Rouge', status: 'active', image: '🚙', date: '5 Mars 2026', views: 456 },
    { id: 6, brand: 'Dacia', model: 'Duster', year: 2022, price: 62000, km: 28000, fuel: 'Diesel', transmission: 'Manuelle', color: 'Vert', status: 'sold', image: '🚘', date: '1 Mars 2026', views: 523 },
    { id: 7, brand: 'Kia', model: 'Sportage', year: 2024, price: 105000, km: 7800, fuel: 'Essence', transmission: 'Automatique', color: 'Blanc', status: 'active', image: '🚗', date: '28 Fév 2026', views: 198 },
    { id: 8, brand: 'Fiat', model: '500', year: 2023, price: 42000, km: 19000, fuel: 'Essence', transmission: 'Manuelle', color: 'Rose', status: 'sold', image: '🚙', date: '25 Fév 2026', views: 345 },
  ];

  constructor(private sellerShell: SellerShellService) {}

  get filteredVehicles(): Vehicle[] {
    let list = this.vehicles;
    if (this.activeTab !== 'all') list = list.filter((v) => v.status === this.activeTab);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (v) => v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q),
      );
    }
    return list;
  }

  get activeCounts() {
    return {
      all: this.vehicles.length,
      active: this.vehicles.filter((v) => v.status === 'active').length,
      pending: this.vehicles.filter((v) => v.status === 'pending').length,
      sold: this.vehicles.filter((v) => v.status === 'sold').length,
    };
  }

  formatPrice(p: number): string {
    return p.toLocaleString('fr-FR') + ' TND';
  }

  formatKm(k: number): string {
    return k.toLocaleString('fr-FR') + ' km';
  }

  openAddVehicleModal(): void {
    this.sellerShell.emitOpenAddVehicle();
  }
}
