import { Component, OnInit, signal, computed } from '@angular/core';
import { Vehicle } from '../../../core/models/vehicle.models';
import { VehiclePublicApiService } from '../../../core/services/vehicle-public-api.service';
import { VehicleSearchParams } from '../../../core/models/vehicle.models';
import { ToastService } from '../../../core/services/toast.service';

type FuelType = Vehicle['fuelType'];
type Gearbox = Vehicle['gearbox'];

const LOCATIONS = ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Nabeul', 'Bizerte'];
const PAGE_SIZE = 12;

@Component({
  selector: 'app-vehicles-marketplace',
  standalone: false,
  templateUrl: './vehicles-marketplace.html',
  styleUrl: './vehicles-marketplace.scss',
})
export class VehiclesMarketplace implements OnInit {
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly search = signal('');
  protected readonly priceMin = signal<number | null>(null);
  protected readonly priceMax = signal<number | null>(null);
  protected readonly yearMin = signal<number | null>(null);
  protected readonly yearMax = signal<number | null>(null);
  protected readonly fuelType = signal<FuelType | ''>('');
  protected readonly gearbox = signal<Gearbox | ''>('');
  protected readonly location = signal<string>('');
  protected readonly currentPage = signal(1);
  protected readonly isLoading = signal(false);

  protected readonly fuelOptions: FuelType[] = ['Diesel', 'Essence', 'Hybrid', 'Electric'];
  protected readonly gearboxOptions: Gearbox[] = ['Manuelle', 'Automatique'];
  protected readonly locationOptions = LOCATIONS;

  protected readonly filteredVehicles = computed(() => {
    let list = [...this.vehicles()];
    const s = this.search().toLowerCase().trim();
    if (s) {
      list = list.filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(s));
    }
    const pMin = this.priceMin();
    const pMax = this.priceMax();
    if (pMin != null) list = list.filter((v) => v.price >= pMin);
    if (pMax != null) list = list.filter((v) => v.price <= pMax);
    const yMin = this.yearMin();
    const yMax = this.yearMax();
    if (yMin != null) list = list.filter((v) => v.year >= yMin);
    if (yMax != null) list = list.filter((v) => v.year <= yMax);
    const fuel = this.fuelType();
    if (fuel) list = list.filter((v) => v.fuelType === fuel);
    const gear = this.gearbox();
    if (gear) list = list.filter((v) => v.gearbox === gear);
    const loc = this.location();
    if (loc) list = list.filter((v) => v.location === loc);
    return list;
  });

  protected readonly paginatedVehicles = computed(() => {
    const list = this.filteredVehicles();
    const page = this.currentPage();
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredVehicles().length / PAGE_SIZE))
  );

  private searchTimeoutId: number | null = null;

  constructor(
    private vehicleApi: VehiclePublicApiService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  resetFilters(): void {
    this.search.set('');
    this.priceMin.set(null);
    this.priceMax.set(null);
    this.yearMin.set(null);
    this.yearMax.set(null);
    this.fuelType.set('');
    this.gearbox.set('');
    this.location.set('');
    this.currentPage.set(1);
    this.loadVehicles();
  }

  setPage(p: number): void {
    this.currentPage.set(Math.max(1, Math.min(p, this.totalPages())));
  }

  onSearchInput(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
    if (this.searchTimeoutId !== null) {
      window.clearTimeout(this.searchTimeoutId);
    }
    this.searchTimeoutId = window.setTimeout(() => {
      this.loadVehicles();
    }, 300);
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    if (this.searchTimeoutId !== null) {
      window.clearTimeout(this.searchTimeoutId);
      this.searchTimeoutId = null;
    }
    this.loadVehicles();
  }

  private buildSearchParams(): VehicleSearchParams {
    return {
      q: this.search() || null,
      minPrice: this.priceMin(),
      maxPrice: this.priceMax(),
      minYear: this.yearMin(),
      maxYear: this.yearMax(),
      fuelType: this.fuelType() || null,
      gearbox: this.gearbox() || null,
      location: this.location() || null,
    };
  }

  private loadVehicles(): void {
    this.isLoading.set(true);
    const params = this.buildSearchParams();
    this.vehicleApi.search(params).subscribe({
      next: (page) => {
        this.vehicles.set(page.content);
      },
      error: () => {
        this.vehicles.set([]);
        this.toastService.showError('Impossible de charger les véhicules.');
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'decimal' }).format(n) + ' TND';
  }
}
