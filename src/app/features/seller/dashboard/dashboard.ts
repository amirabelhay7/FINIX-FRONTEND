import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleService } from '../../../services/vehicle/vehicle.service';
import { VehicleCondition, VehicleDto, VehiclePayload, VehicleStatus } from '../../../models';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as L from 'leaflet';

/**
 * ViewModel: seller dashboard (MVVM).
 */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  activeTab: 'all' | 'active' | 'pending' | 'sold' | 'inactive' = 'all';
  searchQuery = '';
  vehicles: VehicleDto[] = [];
  isLoading = false;
  loadError = '';
  apiMessage = '';

  showAddModal = false;
  showDetailsModal = false;
  detailsVehicle: VehicleDto | null = null;
  editId: number | null = null;
  isSaving = false;

  form: {
    marque: string;
    modele: string;
    prixTnd: string;
    status: VehicleStatus;
    active: boolean;
    phoneNumber: string;
    localisation: string;
    seriePrefix: string;
    serieSuffix: string;
  } = {
    marque: '',
    modele: '',
    prixTnd: '',
    status: 'DISPONIBLE',
    active: true,
    phoneNumber: '',
    localisation: '',
    seriePrefix: '',
    serieSuffix: '',
  };

  pendingImageFiles: File[] = [];
  imagePreviewUrls: string[] = [];
  committedImageUrls: string[] = [];

  formErrors: Record<string, string> = {};

  readonly statuses: VehicleStatus[] = ['DISPONIBLE', 'RESERVE', 'VENDU', 'INACTIF'];
  readonly statusLabels: Record<VehicleStatus, string> = {
    DISPONIBLE: 'Disponible',
    RESERVE: 'Réservé',
    VENDU: 'Vendu',
    INACTIF: 'Inactif',
  };

  readonly conditionLabels: Record<VehicleCondition, string> = {
    NEUF: 'Neuf',
    TRES_BON: 'Très bon',
    BON: 'Bon',
    MOYEN: 'Moyen',
    MAUVAIS: 'Mauvais',
  };

  locationQuery = '';
  locationResults: Array<{ displayName: string; lat: number; lon: number }> = [];
  locationError = '';
  isLocating = false;
  private map: L.Map | null = null;
  private mapMarker: L.Marker | null = null;
  private selectedLat: number | null = null;
  private selectedLon: number | null = null;

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  constructor(
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  ngOnDestroy(): void {
    this.revokePreview();
    this.destroyMap();
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.loadError = '';
    this.vehicleService
      .getMyVehicles()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (rows) => {
          this.vehicles = rows;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loadError = this.httpErrorMessage(err);
          this.cdr.markForCheck();
        },
      });
  }

  get filteredVehicles(): VehicleDto[] {
    let list = this.vehicles;
    if (this.activeTab === 'active') list = list.filter((v) => v.status === 'DISPONIBLE');
    else if (this.activeTab === 'pending') list = list.filter((v) => v.status === 'RESERVE');
    else if (this.activeTab === 'sold') list = list.filter((v) => v.status === 'VENDU');
    else if (this.activeTab === 'inactive') list = list.filter((v) => v.status === 'INACTIF');

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.marque.toLowerCase().includes(q) ||
          v.modele.toLowerCase().includes(q) ||
          String(v.id).includes(q),
      );
    }
    return list;
  }

  get activeCounts() {
    return {
      all: this.vehicles.length,
      active: this.vehicles.filter((v) => v.status === 'DISPONIBLE').length,
      pending: this.vehicles.filter((v) => v.status === 'RESERVE').length,
      sold: this.vehicles.filter((v) => v.status === 'VENDU').length,
      inactive: this.vehicles.filter((v) => v.status === 'INACTIF').length,
    };
  }

  get stats() {
    const disponibles = this.vehicles.filter((v) => v.status === 'DISPONIBLE').length;
    const vendus = this.vehicles.filter((v) => v.status === 'VENDU').length;
    const reserve = this.vehicles.filter((v) => v.status === 'RESERVE').length;
    const totalVal = this.vehicles.reduce((s, v) => s + Number(v.prixTnd || 0), 0);
    return [
      {
        label: 'Annonces actives',
        value: String(disponibles),
        icon: '🚗',
        trend: `${this.vehicles.length} au total`,
        trendClass: 'up' as const,
      },
      {
        label: 'En attente (réservés)',
        value: String(reserve),
        icon: '⏳',
        trend: 'Réservations',
        trendClass: 'up' as const,
      },
      {
        label: 'Véhicules vendus',
        value: String(vendus),
        icon: '✅',
        trend: 'Confirmés',
        trendClass: 'up' as const,
      },
      {
        label: 'Valeur catalogue',
        value: totalVal.toLocaleString('fr-FR', { maximumFractionDigits: 3 }),
        icon: '💰',
        trend: 'TND cumulés',
        trendClass: 'up' as const,
      },
    ];
  }

  cardUiStatus(v: VehicleDto): 'active' | 'pending' | 'sold' | 'inactive' {
    if (v.status === 'DISPONIBLE') return 'active';
    if (v.status === 'RESERVE') return 'pending';
    if (v.status === 'VENDU') return 'sold';
    return 'inactive';
  }

  cardStatusLabel(v: VehicleDto): string {
    if (v.status === 'DISPONIBLE') return 'Disponible';
    if (v.status === 'RESERVE') return 'Réservé';
    if (v.status === 'VENDU') return 'Vendu';
    return 'Inactif';
  }

  formatPrice(p: number): string {
    return Number(p).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 3 }) + ' TND';
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  }

  conditionLabel(v: VehicleDto | null | undefined): string {
    if (!v?.etatVehicule) return '—';
    return this.conditionLabels[v.etatVehicule] ?? v.etatVehicule;
  }

  get serieDisplay(): string {
    const prefix = this.form.seriePrefix.trim();
    const suffix = this.form.serieSuffix.trim();
    if (!prefix && !suffix) return '—';
    return `${prefix || '___'} TUN ${suffix || '____'}`;
  }

  openAddModal(): void {
    this.editId = null;
    this.apiMessage = '';
    this.formErrors = {};
    this.resetLocationUi();
    this.form = {
      marque: '',
      modele: '',
      prixTnd: '',
      status: 'DISPONIBLE',
      active: true,
      phoneNumber: '',
      localisation: '',
      seriePrefix: '',
      serieSuffix: '',
    };
    this.stripVehicleImage();
    this.showAddModal = true;
    setTimeout(() => this.initMap(), 0);
  }

  openEditModal(v: VehicleDto): void {
    this.editId = v.id;
    this.apiMessage = '';
    this.formErrors = {};
    this.resetLocationUi();
    const serie = this.parseSerieVehicule(v.serieVehicule ?? null);
    this.form = {
      marque: v.marque,
      modele: v.modele,
      prixTnd: String(v.prixTnd),
      status: v.status,
      active: v.active,
      phoneNumber: v.phoneNumber ?? '',
      localisation: v.localisation ?? '',
      seriePrefix: serie.prefix,
      serieSuffix: serie.suffix,
    };
    this.locationQuery = v.localisation ?? '';
    this.stripVehicleImage();
    this.committedImageUrls = this.parseImageUrls(v.imageUrl);
    this.imagePreviewUrls = [...this.committedImageUrls];
    this.showAddModal = true;
    setTimeout(() => this.initMap(), 0);
  }

  closeAddModal(): void {
    if (this.isSaving) return;
    this.showAddModal = false;
    this.stripVehicleImage();
    this.resetLocationUi();
    this.destroyMap();
  }

  openDetailsModal(v: VehicleDto): void {
    this.detailsVehicle = v;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.detailsVehicle = null;
  }

  onImageFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.revokePreview();
    this.pendingImageFiles = files;
    if (!files.length) {
      this.imagePreviewUrls = [...this.committedImageUrls];
      return;
    }
    this.imagePreviewUrls = files.map((file) => URL.createObjectURL(file));
    this.cdr.markForCheck();
  }

  stripVehicleImage(): void {
    this.revokePreview();
    this.pendingImageFiles = [];
    this.committedImageUrls = [];
    this.imagePreviewUrls = [];
  }

  private revokePreview(): void {
    for (const imageUrl of this.imagePreviewUrls) {
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    }
  }

  vehiclePrimaryImage(v: VehicleDto | null | undefined): string | null {
    if (!v) return null;
    return this.parseImageUrls(v.imageUrl)[0] ?? null;
  }

  vehicleImageUrls(v: VehicleDto | null | undefined): string[] {
    if (!v) return [];
    return this.parseImageUrls(v.imageUrl);
  }

  private parseImageUrls(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  submitModal(): void {
    this.formErrors = this.validateForm();
    if (Object.keys(this.formErrors).length) return;

    const wasCreate = this.editId === null;
    this.isSaving = true;
    this.apiMessage = '';

    const upload$ = this.pendingImageFiles.length
      ? this.vehicleService.uploadVehicleImages(this.pendingImageFiles)
      : of<{ imageUrls: string[] }>({ imageUrls: [] });

    upload$
      .pipe(
        switchMap((uploadRes) => {
          const uploadedUrls = (uploadRes.imageUrls || [])
            .map((url) => url.trim())
            .filter((url) => url.length > 0);
          const finalUrls = uploadedUrls.length ? uploadedUrls : this.committedImageUrls;
          const imageUrl = finalUrls.length ? finalUrls.join(',') : null;
          // Seller rule: status is not editable from UI.
          const statusForPayload: VehicleStatus = wasCreate ? 'DISPONIBLE' : this.form.status;
          const payload: VehiclePayload = {
            marque: this.form.marque.trim().replace(/\s+/g, ' '),
            modele: this.form.modele.trim().replace(/\s+/g, ' '),
            prixTnd: Number(String(this.form.prixTnd).trim()),
            status: statusForPayload,
            active: this.form.active,
            phoneNumber: this.form.phoneNumber.trim(),
            localisation: this.form.localisation.trim(),
            serieVehicule: this.buildSerieVehicule(),
            imageUrl,
          };
          return wasCreate
            ? this.vehicleService.createVehicle(payload)
            : this.vehicleService.updateVehicle(this.editId!, payload);
        }),
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.showAddModal = false;
          this.editId = null;
          this.stripVehicleImage();
          this.apiMessage = wasCreate ? 'Véhicule publié avec succès.' : 'Véhicule mis à jour.';
          this.loadVehicles();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.apiMessage = this.httpErrorMessage(err);
          this.cdr.markForCheck();
        },
      });
  }

  deleteVehicle(v: VehicleDto): void {
    if (!window.confirm(`Supprimer ${v.marque} ${v.modele} ?`)) return;
    this.apiMessage = '';
    this.vehicleService
      .deleteVehicle(v.id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => {
          this.apiMessage = 'Véhicule supprimé.';
          this.loadVehicles();
        },
        error: (err) => {
          this.apiMessage = this.httpErrorMessage(err);
        },
      });
  }

  private httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.length) return body;
      if (body && typeof body === 'object') {
        const o = body as Record<string, unknown>;
        if (typeof o['message'] === 'string') return o['message'] as string;
        const errs = o['errors'];
        if (errs && typeof errs === 'object') {
          return Object.values(errs as Record<string, string>).join(' ');
        }
      }
      if (err.status === 0) return 'Serveur injoignable (reseau ou CORS).';
      return `Erreur HTTP ${err.status}`;
    }
    return 'Erreur inattendue.';
  }

  private validateForm(): Record<string, string> {
    const errors: Record<string, string> = {};
    const marque = this.form.marque.trim();
    const modele = this.form.modele.trim();
    const prixStr = String(this.form.prixTnd ?? '').trim();
    const prix = Number(prixStr);
    const phone = this.form.phoneNumber.trim();
    const localisation = this.form.localisation.trim();
    const seriePrefix = this.form.seriePrefix.trim();
    const serieSuffix = this.form.serieSuffix.trim();
    if (!marque || marque.length < 2) errors['marque'] = 'Marque requise (2+ caractères).';
    if (!modele || modele.length < 2) errors['modele'] = 'Modèle requis (2+ caractères).';
    if (!prixStr || !Number.isFinite(prix) || prix <= 0) errors['prixTnd'] = 'Prix invalide.';
    if (!phone || !/^\d{8}$/.test(phone)) errors['phoneNumber'] = 'Numéro requis (8 chiffres).';
    if (!localisation || localisation.length < 3) errors['localisation'] = 'Localisation requise.';
    if (!/^\d{3}$/.test(seriePrefix)) errors['seriePrefix'] = 'Série: 3 chiffres requis.';
    if (!/^\d{4}$/.test(serieSuffix)) errors['serieSuffix'] = 'Série: 4 chiffres requis.';
    return errors;
  }

  private buildSerieVehicule(): string {
    const prefix = this.form.seriePrefix.trim();
    const suffix = this.form.serieSuffix.trim();
    return `${prefix} TUN ${suffix}`;
  }

  private parseSerieVehicule(value: string | null): { prefix: string; suffix: string } {
    if (!value) return { prefix: '', suffix: '' };
    const match = value.trim().match(/^(\d{3})\s+TUN\s+(\d{4})$/i);
    if (!match) return { prefix: '', suffix: '' };
    return { prefix: match[1], suffix: match[2] };
  }

  async searchLocation(): Promise<void> {
    const query = this.locationQuery.trim();
    if (!query) {
      this.locationError = 'Entrez une adresse a rechercher.';
      return;
    }
    this.locationError = '';
    this.locationResults = [];
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        throw new Error('Erreur de recherche');
      }
      const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
      this.locationResults = data.map((row) => ({
        displayName: row.display_name,
        lat: Number(row.lat),
        lon: Number(row.lon),
      }));
    } catch {
      this.locationError = 'Recherche indisponible. Reessayez.';
    }
  }

  async useMyLocation(): Promise<void> {
    this.locationError = '';
    if (!navigator.geolocation) {
      this.locationError = 'Geolocalisation non supportee.';
      return;
    }
    this.isLocating = true;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        this.selectedLat = lat;
        this.selectedLon = lon;
        this.updateMapMarker(lat, lon, 15);
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
          const res = await fetch(url, { headers: { Accept: 'application/json' } });
          if (res.ok) {
            const data = (await res.json()) as { display_name?: string };
            if (data.display_name) {
              this.form.localisation = data.display_name;
              this.locationQuery = data.display_name;
            }
          }
        } catch {
          this.locationError = 'Impossible de recuperer l adresse.';
        } finally {
          this.isLocating = false;
          this.cdr.markForCheck();
        }
      },
      () => {
        this.isLocating = false;
        this.locationError = 'Autorisation de geolocalisation refusee.';
        this.cdr.markForCheck();
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  selectLocation(row: { displayName: string; lat: number; lon: number }): void {
    this.form.localisation = row.displayName;
    this.locationQuery = row.displayName;
    this.selectedLat = row.lat;
    this.selectedLon = row.lon;
    this.updateMapMarker(row.lat, row.lon, 15);
  }

  private initMap(): void {
    if (this.map || !this.mapContainer?.nativeElement) return;
    const mapEl = this.mapContainer.nativeElement;
    this.map = L.map(mapEl, { zoomControl: true, attributionControl: true }).setView([36.8065, 10.1815], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/assets/leaflet/marker-icon-2x.png',
      iconUrl: '/assets/leaflet/marker-icon.png',
      shadowUrl: '/assets/leaflet/marker-shadow.png',
    });

    if (this.selectedLat != null && this.selectedLon != null) {
      this.updateMapMarker(this.selectedLat, this.selectedLon, 13);
    }
  }

  private updateMapMarker(lat: number, lon: number, zoom?: number): void {
    if (!this.map) return;
    if (this.mapMarker) {
      this.mapMarker.setLatLng([lat, lon]);
    } else {
      this.mapMarker = L.marker([lat, lon]).addTo(this.map);
    }
    if (zoom != null) {
      this.map.setView([lat, lon], zoom);
    }
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapMarker = null;
    }
  }

  private resetLocationUi(): void {
    this.locationQuery = '';
    this.locationResults = [];
    this.locationError = '';
    this.isLocating = false;
    this.selectedLat = null;
    this.selectedLon = null;
  }
}
