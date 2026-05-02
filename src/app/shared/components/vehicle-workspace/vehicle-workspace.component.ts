import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../../services/vehicle/vehicle.service';
import { ReservationService } from '../../../services/vehicle/reservation.service';
import { AuthService } from '../../../services/auth/auth.service';
import { apiUrl } from '../../../core/config/api-url';
import {
  DeliveryVehicleDto,
  DeliveryVehiclePayload,
  DocumentVehicleDto,
  DocumentVehiclePayload,
  EscrowPaymentDto,
  EscrowPaymentPayload,
  FeedbackType,
  FeedbackVehicleDto,
  FeedbackVehiclePayload,
  GpsTrackerDto,
  GpsTrackerPayload,
  StatusDelivery,
  StatusEscrowPayment,
  StatusTracker,
  TypeDocument,
  VehicleDto,
  VehicleModerationStatus,
  VehiclePayload,
  VehicleSearchQuery,
  VehicleStatsDto,
  VehicleStatus,
  VehicleWorkspaceMode,
} from '../../../models';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-vehicle-workspace',
  standalone: false,
  templateUrl: './vehicle-workspace.component.html',
  styleUrl: './vehicle-workspace.component.css',
})
export class VehicleWorkspaceComponent implements OnInit, OnDestroy {
  @Input() showCatalog = false;
  @Input() showSubEntities = true;
  @Input() headingEyebrow = 'My Vehicles';
  @Input() headingTitle = 'Vehicle Fleet';
  /** Hide primary “create listing” CTA (e.g. admin fleet moderation only). Row actions unaffected. */
  @Input() showCreateVehicleButton = true;
  /** client = lecture seule ; seller = mes véhicules ; admin = parc + stats */
  @Input() workspaceMode: VehicleWorkspaceMode = 'admin';

  activeCrudTab: 'documents' | 'deliveries' | 'feedbacks' | 'escrows' | 'gps' = 'documents';
  vehicles: VehicleDto[] = [];
  selectedVehicle: VehicleDto | null = null;

  isLoading = false;
  isSubmitting = false;
  loadError = '';
  submitError = '';
  submitSuccess = '';

  showFormModal = false;
  editId: number | null = null;

  /** Filtres API (recherche avancée) */
  filterQ = '';
  filterMarque = '';
  filterModele = '';
  filterStatus: VehicleStatus | '' = '';
  filterActive: '' | 'true' | 'false' = '';
  filterHasImage: '' | 'true' | 'false' = '';
  filterRecentOnly = false;
  minPriceStr = '';
  maxPriceStr = '';
  sortKey = 'created_desc';

  stats: VehicleStatsDto | null = null;
  statsLoading = false;
  statsError = '';

  form: {
    marque: string;
    modele: string;
    prixTnd: string;
    status: VehicleStatus;
    active: boolean;
    phoneNumber: string;
    localisation: string;
    serieVehicule: string;
  } = {
    marque: '',
    modele: '',
    prixTnd: '',
    status: 'DISPONIBLE',
    active: true,
    phoneNumber: '',
    localisation: '',
    serieVehicule: '',
  };

  /** Image : fichier sélectionné + aperçu (pas de saisie d’URL) */
  pendingImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  /** URL serveur existante (édition) si pas de nouveau fichier */
  committedImageUrl: string | null = null;

  formErrors: Record<string, string> = {};

  readonly statuses: VehicleStatus[] = ['DISPONIBLE', 'RESERVE', 'VENDU', 'INACTIF'];
  readonly statusLabels: Record<VehicleStatus, string> = {
    DISPONIBLE: 'Available',
    RESERVE: 'Reserved',
    VENDU: 'Sold',
    INACTIF: 'Inactive',
  };

  readonly sortOptions: { value: string; label: string }[] = [
    { value: 'created_desc', label: 'Most recent date' },
    { value: 'created_asc', label: 'Oldest date' },
    { value: 'price_asc', label: 'Price ascending' },
    { value: 'price_desc', label: 'Price descending' },
    { value: 'marque_asc', label: 'Brand A-Z' },
    { value: 'marque_desc', label: 'Brand Z-A' },
    { value: 'status', label: 'Status' },
    { value: 'active_first', label: 'Active first' },
  ];

  documents: DocumentVehicleDto[] = [];
  deliveries: DeliveryVehicleDto[] = [];
  feedbacks: FeedbackVehicleDto[] = [];
  escrows: EscrowPaymentDto[] = [];
  gpsTrackers: GpsTrackerDto[] = [];

  typeDocuments: TypeDocument[] = ['CARTE_GRISE', 'CONTROLE_TECHNIQUE', 'FACTURE_ACHAT', 'PREUVE_ASSURANCE'];
  deliveryStatuses: StatusDelivery[] = ['PLANNED', 'PENDING', 'DELIVERED', 'CANCELLED'];
  escrowStatuses: StatusEscrowPayment[] = ['BLOCK', 'RELEASE', 'REIMBURSE'];
  trackerStatuses: StatusTracker[] = ['ASSIGNED', 'INSTALLED', 'ACTIVE', 'INACTIVE'];

  selectedDocumentId: number | null = null;
  selectedDeliveryId: number | null = null;
  selectedFeedbackId: number | null = null;
  selectedEscrowId: number | null = null;
  selectedGpsId: number | null = null;

  docForm: DocumentVehiclePayload = { type: 'CARTE_GRISE', fileUrl: '', imageVeh: '', verified: false, vehicleId: 0 };
  deliveryForm: DeliveryVehiclePayload = {
    dateDeliveryPlanned: '',
    addressDelivery: '',
    statusDelivery: 'PLANNED',
    confirmByImf: false,
    vehicleId: 0,
  };
  feedbackForm: FeedbackVehiclePayload = { feedbackType: 'CLIENT_SERVICE', noteGlobal: 0, comment: '', vehicleId: undefined };
  escrowForm: EscrowPaymentPayload = { totalAmount: 0, blockDate: '', releaseDate: '', statusEscrowPayment: 'BLOCK' };
  gpsForm: GpsTrackerPayload = { statusTracker: 'ASSIGNED', serialNumber: '', installationDate: '', active: true };

  private readonly qDebounced = new Subject<string>();
  private qSub?: Subscription;
  private routeSub?: Subscription;
  private feedbackReturnTimer: ReturnType<typeof setTimeout> | null = null;
  feedbackHover = 0;
  feedbackReturnTo: string | null = null;
  feedbackReturnLabel = 'Back';
  adminFeedbackFilter: {
    feedbackType: FeedbackType | '';
    authorUserId: string;
    visible: '' | 'true' | 'false';
  } = { feedbackType: '', authorUserId: '', visible: '' };

  /** Onglets modération (admin back-office). */
  adminModerationFilter: 'all' | 'pending' | 'approved' | 'rejected' = 'all';
  moderationActionPending = false;
  showRejectModal = false;
  rejectTarget: VehicleDto | null = null;
  rejectReason = '';
  private pendingFocusVehicleId: number | null = null;
  private pendingFocusReservationId: number | null = null;
  private readonly backendBase = apiUrl('/').replace(/\/$/, '');

  readonly feedbackTypeLabels: Record<FeedbackType, string> = {
    CLIENT_SERVICE: 'Client - Customer service',
    SELLER_SERVICE: 'Seller - Customer service',
  };

  readonly moderationStatusLabels: Record<VehicleModerationStatus, string> = {
    PENDING_AI_REVIEW: 'Pending (AI)',
    APPROVED_BY_AI: 'Approved (AI)',
    REJECTED_BY_AI: 'Rejected (AI)',
    PENDING_ADMIN_REVIEW: 'Pending validation',
    APPROVED_BY_ADMIN: 'Approved',
    REJECTED_BY_ADMIN: 'Rejected',
  };

  constructor(
    private vehicleService: VehicleService,
    private reservationService: ReservationService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  get canManageVehicles(): boolean {
    return this.workspaceMode !== 'client';
  }

  get isSellerWorkspace(): boolean {
    return this.workspaceMode === 'seller';
  }

  get canEditVehicleStatus(): boolean {
    // UI rule: status editor is visible only in admin workspace.
    return this.workspaceMode === 'admin';
  }

  /** Sous-entités : mutations réservées vendeur + admin (pas client). */
  get canMutateSub(): boolean {
    return this.workspaceMode !== 'client';
  }

  get canMutateFeedback(): boolean {
    const role = this.auth.getEffectiveRole();
    return role === 'client' || role === 'seller' || role === 'admin';
  }

  get canSubmitFeedback(): boolean {
    if (!this.canMutateFeedback) return false;
    if (!this.isAdminRole) return true;
    return this.selectedFeedbackId != null;
  }

  get isAdminRole(): boolean {
    return this.auth.getEffectiveRole() === 'admin';
  }

  get roleFeedbackTypeOptions(): FeedbackType[] {
    const role = this.auth.getEffectiveRole();
    if (role === 'client') return ['CLIENT_SERVICE'];
    if (role === 'seller') return ['SELLER_SERVICE'];
    return ['CLIENT_SERVICE', 'SELLER_SERVICE'];
  }

  get hasFeedbackReturn(): boolean {
    return !!this.feedbackReturnTo;
  }

  /** Statistiques détaillées : back-office admin uniquement. */
  get showAdminStats(): boolean {
    return this.workspaceMode === 'admin';
  }

  get vehicleIdsForSelect(): { id: number; label: string }[] {
    return this.vehicles.map((v) => ({
      id: v.id,
      label: `#${v.id} ${v.marque} ${v.modele}`,
    }));
  }

  /** Liste affichée selon l’onglet modération (admin). */
  get displayedVehicles(): VehicleDto[] {
    if (this.workspaceMode !== 'admin') return this.vehicles;
    if (this.adminModerationFilter === 'all' || this.adminModerationFilter === 'pending') {
      return this.vehicles;
    }
    return this.vehicles.filter((v) => {
      const m = v.moderationStatus;
      if (!m) return false;
      if (this.adminModerationFilter === 'approved') {
        return m === 'APPROVED_BY_ADMIN' || m === 'APPROVED_BY_AI';
      }
      if (this.adminModerationFilter === 'rejected') {
        return m === 'REJECTED_BY_ADMIN' || m === 'REJECTED_BY_AI';
      }
      return true;
    });
  }

  get documentsScoped(): DocumentVehicleDto[] {
    if (!this.selectedVehicle) return this.documents;
    return this.documents.filter((d) => d.vehicleId === this.selectedVehicle!.id);
  }

  get deliveriesScoped(): DeliveryVehicleDto[] {
    if (!this.selectedVehicle) return this.deliveries;
    return this.deliveries.filter((d) => d.vehicleId === this.selectedVehicle!.id);
  }

  get feedbacksScoped(): FeedbackVehicleDto[] {
    let rows = this.feedbacks;
    if (!this.isAdminRole) return rows;
    if (this.adminFeedbackFilter.feedbackType) {
      rows = rows.filter((f) => f.feedbackType === this.adminFeedbackFilter.feedbackType);
    }
    const authorId = Number(this.adminFeedbackFilter.authorUserId);
    if (Number.isFinite(authorId) && authorId > 0) {
      rows = rows.filter((f) => f.authorId === authorId);
    }
    if (this.adminFeedbackFilter.visible === 'true') {
      rows = rows.filter((f) => f.visible);
    } else if (this.adminFeedbackFilter.visible === 'false') {
      rows = rows.filter((f) => !f.visible);
    }
    return rows;
  }

  /** Aperçu catalogue (client) : annonces disponibles et actives. */
  get catalogPreview(): VehicleDto[] {
    return this.vehicles.filter((v) => v.status === 'DISPONIBLE' && v.active).slice(0, 12);
  }

  ngOnInit(): void {
    const rawFocusVehicleId = sessionStorage.getItem('finix_focus_vehicle_id');
    const focusVehicleId = Number(rawFocusVehicleId);
    if (Number.isFinite(focusVehicleId) && focusVehicleId > 0) {
      this.pendingFocusVehicleId = focusVehicleId;
      sessionStorage.removeItem('finix_focus_vehicle_id');
    }
    const rawFocusReservationId = sessionStorage.getItem('finix_focus_reservation_id');
    const focusReservationId = Number(rawFocusReservationId);
    if (Number.isFinite(focusReservationId) && focusReservationId > 0) {
      this.pendingFocusReservationId = focusReservationId;
      sessionStorage.removeItem('finix_focus_reservation_id');
    }
    this.qSub = this.qDebounced
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => this.loadVehicles(true));
    this.loadVehicles(false);
    if (this.showAdminStats) {
      this.loadStats();
    }
    if (this.showSubEntities) {
      this.reloadAllSubEntities();
    }
    this.routeSub = this.route.queryParamMap.subscribe((params) => {
      if (!this.showSubEntities && this.workspaceMode === 'seller') {
        return;
      }
      const requestedType = (params.get('feedbackType') || '').trim();
      const requestedVehicleId = Number(params.get('vehicleId'));
      const requestedReservationId = Number(params.get('reservationId'));
      const returnTo = (params.get('returnTo') || '').trim();
      const returnLabel = (params.get('returnLabel') || '').trim();
      this.feedbackReturnTo = returnTo.length ? returnTo : null;
      this.feedbackReturnLabel = returnLabel.length ? returnLabel : 'Back';
      const shouldOpenFeedback =
        params.get('feedbackOpen') === '1' ||
        params.get('feedbackOpen') === 'true' ||
        requestedType.length > 0;

      if (!shouldOpenFeedback) {
        return;
      }

      this.activeCrudTab = 'feedbacks';
      const allowed = this.roleFeedbackTypeOptions;
      if (allowed.includes(requestedType as FeedbackType)) {
        this.feedbackForm.feedbackType = requestedType as FeedbackType;
      } else if (!allowed.includes(this.feedbackForm.feedbackType)) {
        this.feedbackForm.feedbackType = allowed[0] ?? 'CLIENT_SERVICE';
      }
      if (Number.isFinite(requestedVehicleId) && requestedVehicleId > 0) {
        this.feedbackForm.vehicleId = requestedVehicleId;
      } else if (Number.isFinite(requestedReservationId) && requestedReservationId > 0) {
        this.reservationService.getById(requestedReservationId).subscribe({
          next: (reservation) => {
            if (reservation?.vehicleId) {
              this.feedbackForm.vehicleId = reservation.vehicleId;
              this.cdr.markForCheck();
            }
          },
          error: () => {
            // Keep form usable; validation will show a clear message if still missing.
          },
        });
      }

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.qSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    if (this.feedbackReturnTimer) {
      clearTimeout(this.feedbackReturnTimer);
      this.feedbackReturnTimer = null;
    }
    this.revokePreview();
  }

  onFilterQInput(value: string): void {
    this.filterQ = value;
    this.qDebounced.next(value);
  }

  applyFilters(): void {
    this.loadVehicles(false);
  }

  resetFilters(): void {
    this.filterQ = '';
    this.filterMarque = '';
    this.filterModele = '';
    this.filterStatus = '';
    this.filterActive = '';
    this.filterHasImage = '';
    this.filterRecentOnly = false;
    this.minPriceStr = '';
    this.maxPriceStr = '';
    this.sortKey = 'created_desc';
    this.loadVehicles(false);
  }

  onSortChange(): void {
    this.loadVehicles(true);
  }

  private buildSearchQuery(): VehicleSearchQuery {
    const q: VehicleSearchQuery = {
      q: this.filterQ.trim() || undefined,
      marque: this.filterMarque.trim() || undefined,
      modele: this.filterModele.trim() || undefined,
      sort: this.sortKey || 'created_desc',
      recentOnly: this.filterRecentOnly || undefined,
    };
    if (this.filterStatus) q.status = this.filterStatus;
    if (this.filterActive === 'true') q.active = true;
    if (this.filterActive === 'false') q.active = false;
    if (this.filterHasImage === 'true') q.hasImage = true;
    if (this.filterHasImage === 'false') q.hasImage = false;
    const min = parseFloat(this.minPriceStr.replace(',', '.'));
    const max = parseFloat(this.maxPriceStr.replace(',', '.'));
    if (Number.isFinite(min) && min > 0) q.minPrice = min;
    if (Number.isFinite(max) && max > 0) q.maxPrice = max;
    return q;
  }

  loadVehicles(silent: boolean): void {
    if (!silent) {
      this.isLoading = true;
    }
    this.loadError = '';
    const query = this.buildSearchQuery();
    let req$: Observable<VehicleDto[]>;
    if (this.workspaceMode === 'admin' && this.adminModerationFilter === 'pending') {
      req$ = this.vehicleService.getPendingVehicles();
    } else if (this.workspaceMode === 'seller') {
      req$ = this.vehicleService.getMyVehicles(query);
    } else {
      req$ = this.vehicleService.searchVehicles(query);
    }

    req$
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (rows) => {
          this.vehicles = rows;
          if (this.pendingFocusReservationId) {
            const rid = this.pendingFocusReservationId;
            this.pendingFocusReservationId = null;
            this.reservationService.getById(rid).subscribe({
              next: (res) => {
                if (res?.vehicleId) {
                  const veh = rows.find((v) => v.id === res.vehicleId);
                  if (veh) {
                    this.openDetail(veh);
                  }
                }
                this.cdr.markForCheck();
              },
              error: () => this.cdr.markForCheck(),
            });
          } else if (this.pendingFocusVehicleId) {
            const focused = rows.find((v) => v.id === this.pendingFocusVehicleId);
            if (focused) {
              this.openDetail(focused);
              this.pendingFocusVehicleId = null;
            }
          }
          if (this.selectedVehicle) {
            this.selectedVehicle = rows.find((v) => v.id === this.selectedVehicle!.id) ?? null;
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loadError = this.httpErrorMessage(err);
          this.cdr.markForCheck();
        },
      });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.statsError = '';
    this.vehicleService
      .getVehicleStats()
      .pipe(
        finalize(() => {
          this.statsLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (s) => {
          this.stats = s;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.statsError = this.httpErrorMessage(err);
          this.cdr.markForCheck();
        },
      });
  }

  reloadAllSubEntities(): void {
    this.vehicleService.getAllDocuments().subscribe({ next: (x) => (this.documents = x) });
    this.vehicleService.getAllDeliveries().subscribe({ next: (x) => (this.deliveries = x) });
    if (this.isAdminRole) {
      this.vehicleService.getAllFeedbacks(this.adminFeedbackQuery()).subscribe({ next: (x) => (this.feedbacks = x) });
    } else {
      this.vehicleService.getMyFeedbacks().subscribe({ next: (x) => (this.feedbacks = x) });
    }
    this.vehicleService.getAllEscrows().subscribe({ next: (x) => (this.escrows = x) });
    this.vehicleService.getAllGpsTrackers().subscribe({ next: (x) => (this.gpsTrackers = x) });
  }

  openCreateModal(): void {
    if (!this.canManageVehicles) return;
    this.editId = null;
    this.submitError = '';
    this.submitSuccess = '';
    this.formErrors = {};
    this.form = {
      marque: '',
      modele: '',
      prixTnd: '',
      status: 'DISPONIBLE',
      active: true,
      phoneNumber: '',
      localisation: '',
      serieVehicule: '',
    };
    this.clearImageSelection();
    this.committedImageUrl = null;
    this.showFormModal = true;
  }

  openEditModal(vehicle: VehicleDto): void {
    if (!this.canManageVehicles) return;
    this.editId = vehicle.id;
    this.submitError = '';
    this.submitSuccess = '';
    this.formErrors = {};
    this.form = {
      marque: vehicle.marque,
      modele: vehicle.modele,
      prixTnd: String(vehicle.prixTnd),
      status: vehicle.status,
      active: vehicle.active,
      phoneNumber: vehicle.phoneNumber ?? '',
      localisation: vehicle.localisation ?? '',
      serieVehicule: vehicle.serieVehicule ?? '',
    };
    this.clearImageSelection();
    this.committedImageUrl = vehicle.imageUrl ?? null;
    if (this.committedImageUrl) {
      this.imagePreviewUrl = this.committedImageUrl;
    }
    this.showFormModal = true;
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.showFormModal = false;
    this.clearImageSelection();
    this.committedImageUrl = null;
  }

  onImageFileChange(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    this.revokePreview();
    this.pendingImageFile = file ?? null;
    if (!file) {
      this.imagePreviewUrl = this.committedImageUrl;
      return;
    }
    this.imagePreviewUrl = URL.createObjectURL(file);
    this.cdr.markForCheck();
  }

  clearImageSelection(): void {
    this.revokePreview();
    this.pendingImageFile = null;
    this.imagePreviewUrl = null;
  }

  /** Retire aussi l’image deja enregistree (edition). */
  stripVehicleImage(): void {
    this.revokePreview();
    this.pendingImageFile = null;
    this.committedImageUrl = null;
    this.imagePreviewUrl = null;
  }

  private revokePreview(): void {
    if (this.imagePreviewUrl && this.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
  }

  openDetail(vehicle: VehicleDto): void {
    this.selectedVehicle = vehicle;
    this.prefillSubVehicleId(vehicle.id);
  }

  private prefillSubVehicleId(vid: number): void {
    this.docForm = { ...this.docForm, vehicleId: vid };
    this.deliveryForm = { ...this.deliveryForm, vehicleId: vid };
  }

  submitForm(): void {
    if (!this.canManageVehicles) return;
    this.submitError = '';
    this.submitSuccess = '';
    this.formErrors = this.validateForm();
    if (Object.keys(this.formErrors).length > 0) return;

    const wasCreate = this.editId === null;
    this.isSubmitting = true;

    const upload$ = this.pendingImageFile
      ? this.vehicleService.uploadVehicleImage(this.pendingImageFile)
      : of<{ imageUrl: string } | null>(null);

    upload$
      .pipe(
        switchMap((uploadRes) => {
          const imageUrl =
            uploadRes?.imageUrl ??
            (this.pendingImageFile ? null : this.committedImageUrl?.trim() || null) ??
            null;
          const statusForPayload = this.canEditVehicleStatus
            ? this.form.status
            : (wasCreate ? 'DISPONIBLE' : this.form.status);
          const payload: VehiclePayload = {
            marque: this.form.marque.trim().replace(/\s+/g, ' '),
            modele: this.form.modele.trim().replace(/\s+/g, ' '),
            prixTnd: Number(this.form.prixTnd),
            status: statusForPayload,
            active: this.form.active,
            phoneNumber: this.form.phoneNumber.trim(),
            localisation: this.form.localisation.trim(),
            serieVehicule: this.form.serieVehicule.trim(),
            imageUrl: imageUrl && imageUrl.length > 0 ? imageUrl : null,
          };
          return wasCreate
            ? this.vehicleService.createVehicle(payload)
            : this.vehicleService.updateVehicle(this.editId!, payload);
        }),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.showFormModal = false;
          this.editId = null;
          this.clearImageSelection();
          this.committedImageUrl = null;
          this.submitSuccess = wasCreate ? 'Vehicle created successfully.' : 'Vehicle updated successfully.';
          this.loadVehicles(true);
          if (this.showAdminStats) {
            this.loadStats();
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.submitError = this.httpErrorMessage(err);
          this.cdr.markForCheck();
        },
      });
  }

  setAdminModerationFilter(f: 'all' | 'pending' | 'approved' | 'rejected'): void {
    if (this.adminModerationFilter === f) return;
    this.adminModerationFilter = f;
    this.loadVehicles(false);
  }

  moderationLabel(m?: VehicleModerationStatus | null): string {
    if (!m) return '—';
    return this.moderationStatusLabels[m] ?? m;
  }

  resolveImageUrl(raw?: string | null): string {
    if (!raw) return '';
    const trimmed = raw.trim().replace(/\\/g, '/');
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) return `${this.backendBase}${trimmed}`;
    return `${this.backendBase}/${trimmed}`;
  }

  primaryImageUrl(raw?: string | null): string {
    if (!raw) return '';
    const first = raw
      .split(',')
      .map((p) => p.trim())
      .find((p) => p.length > 0);
    return this.resolveImageUrl(first ?? '');
  }

  canModerateVehicle(v: VehicleDto): boolean {
    return this.workspaceMode === 'admin' && this.isAdminRole && v.moderationStatus === 'PENDING_ADMIN_REVIEW';
  }

  approveVehicleRow(v: VehicleDto): void {
    this.submitError = '';
    this.submitSuccess = '';
    this.moderationActionPending = true;
    this.vehicleService
      .approveVehicle(v.id)
      .pipe(
        finalize(() => {
          this.moderationActionPending = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.submitSuccess = 'Listing approved.';
          this.notificationService.requestRefresh();
          this.loadVehicles(true);
          if (this.showAdminStats) this.loadStats();
        },
        error: (err) => {
          this.submitError = this.httpErrorMessage(err);
        },
      });
  }

  openRejectModal(v: VehicleDto): void {
    this.submitError = '';
    this.rejectTarget = v;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    if (this.moderationActionPending) return;
    this.resetRejectModal();
  }

  private resetRejectModal(): void {
    this.showRejectModal = false;
    this.rejectTarget = null;
    this.rejectReason = '';
  }

  confirmReject(): void {
    const v = this.rejectTarget;
    const reason = this.rejectReason.trim();
    if (!v) return;
    if (reason.length < 3) {
      this.submitError = 'Please provide a reason (at least 3 characters).';
      return;
    }
    this.submitError = '';
    this.moderationActionPending = true;
    this.vehicleService
      .rejectVehicle(v.id, reason)
      .pipe(
        finalize(() => {
          this.moderationActionPending = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.submitSuccess = 'Listing rejected.';
          this.notificationService.requestRefresh();
          this.resetRejectModal();
          this.loadVehicles(true);
          if (this.showAdminStats) this.loadStats();
        },
        error: (err) => {
          this.submitError = this.httpErrorMessage(err);
        },
      });
  }

  deleteVehicle(vehicle: VehicleDto): void {
    if (!this.canManageVehicles) return;
    this.submitError = '';
    this.submitSuccess = '';
    const confirmed = window.confirm(
      `Confirm deletion of vehicle "${vehicle.marque} ${vehicle.modele}"?`,
    );
    if (!confirmed) return;

    this.vehicleService
      .deleteVehicle(vehicle.id)
      .pipe(
        finalize(() => {
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.submitSuccess = 'Vehicle deleted successfully.';
          if (this.selectedVehicle?.id === vehicle.id) this.selectedVehicle = null;
          this.loadVehicles(true);
          if (this.showAdminStats) {
            this.loadStats();
          }
        },
        error: (err) => {
          this.submitError = this.httpErrorMessage(err);
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
      if (err.status === 0) return 'Server unreachable (network or CORS).';
      return `HTTP error ${err.status}`;
    }
    return 'Unexpected error.';
  }

  private validateForm(): Record<string, string> {
    const errors: Record<string, string> = {};
    const marque = this.form.marque.trim();
    const modele = this.form.modele.trim();
    const prixStr = String(this.form.prixTnd ?? '').trim();
    const prix = Number(prixStr);
    const phoneNumber = this.form.phoneNumber.trim();
    const localisation = this.form.localisation.trim();
    const serieVehicule = this.form.serieVehicule.trim();

    if (!marque) errors['marque'] = 'Brand is required.';
    else if (marque.length < 2 || marque.length > 80)
      errors['marque'] = 'Brand must contain between 2 and 80 characters.';

    if (!modele) errors['modele'] = 'Model is required.';
    else if (modele.length < 2 || modele.length > 80)
      errors['modele'] = 'Model must contain between 2 and 80 characters.';

    if (!prixStr) errors['prixTnd'] = 'Price is required.';
    else if (!Number.isFinite(prix) || prix <= 0)
      errors['prixTnd'] = 'Price must be strictly greater than 0.';

    if (!this.statuses.includes(this.form.status)) errors['status'] = 'Invalid status.';

    if (!/^[0-9]{8}$/.test(phoneNumber))
      errors['phoneNumber'] = 'Phone number must be 8 digits.';
    if (localisation.length < 3) errors['localisation'] = 'Location is required.';
    if (!/^[0-9]{3}\s*TUN\s*[0-9]{4}$/i.test(serieVehicule))
      errors['serieVehicule'] = 'Serie must match 111 TUN 1111.';

    return errors;
  }

  submitDocument(): void {
    if (!this.canMutateSub) return;
    const payload: DocumentVehiclePayload = {
      ...this.docForm,
      fileUrl: this.docForm.fileUrl.trim(),
      imageVeh: this.docForm.imageVeh?.trim(),
      vehicleId: Number(this.docForm.vehicleId),
    };
    const req =
      this.selectedDocumentId == null
        ? this.vehicleService.createDocument(payload)
        : this.vehicleService.updateDocument(this.selectedDocumentId, payload);
    req.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () => {
        this.reloadAllSubEntities();
        this.resetDocumentForm();
      },
      error: (e) => (this.submitError = this.httpErrorMessage(e)),
    });
  }
  editDocument(row: DocumentVehicleDto): void {
    this.selectedDocumentId = row.id;
    this.docForm = {
      type: row.type,
      fileUrl: row.fileUrl,
      imageVeh: row.imageVeh || '',
      verified: row.verified,
      vehicleId: row.vehicleId,
    };
  }
  deleteDocument(id: number): void {
    if (!this.canMutateSub) return;
    this.vehicleService
      .deleteDocument(id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => this.reloadAllSubEntities(),
        error: (e) => (this.submitError = this.httpErrorMessage(e)),
      });
  }
  resetDocumentForm(): void {
    this.selectedDocumentId = null;
    const vid = this.selectedVehicle?.id ?? 0;
    this.docForm = { type: 'CARTE_GRISE', fileUrl: '', imageVeh: '', verified: false, vehicleId: vid };
  }

  submitDelivery(): void {
    if (!this.canMutateSub) return;
    const payload: DeliveryVehiclePayload = {
      ...this.deliveryForm,
      vehicleId: Number(this.deliveryForm.vehicleId),
      addressDelivery: this.deliveryForm.addressDelivery.trim(),
    };
    const req =
      this.selectedDeliveryId == null
        ? this.vehicleService.createDelivery(payload)
        : this.vehicleService.updateDelivery(this.selectedDeliveryId, payload);
    req.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () => {
        this.reloadAllSubEntities();
        this.resetDeliveryForm();
      },
      error: (e) => (this.submitError = this.httpErrorMessage(e)),
    });
  }
  editDelivery(row: DeliveryVehicleDto): void {
    this.selectedDeliveryId = row.id;
    this.deliveryForm = {
      dateDeliveryPlanned: row.dateDeliveryPlanned,
      dateDeliveryRealized: row.dateDeliveryRealized || '',
      dateDeliveryCancelled: row.dateDeliveryCancelled || '',
      addressDelivery: row.addressDelivery,
      statusDelivery: row.statusDelivery,
      confirmByImf: row.confirmByImf,
      vehicleId: row.vehicleId,
    };
  }
  deleteDelivery(id: number): void {
    if (!this.canMutateSub) return;
    this.vehicleService
      .deleteDelivery(id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => this.reloadAllSubEntities(),
        error: (e) => (this.submitError = this.httpErrorMessage(e)),
      });
  }
  resetDeliveryForm(): void {
    this.selectedDeliveryId = null;
    const vid = this.selectedVehicle?.id ?? 0;
    this.deliveryForm = {
      dateDeliveryPlanned: '',
      addressDelivery: '',
      statusDelivery: 'PLANNED',
      confirmByImf: false,
      vehicleId: vid,
    };
  }

  submitFeedback(): void {
    if (!this.canMutateFeedback) return;
    if ((!this.feedbackForm.vehicleId || this.feedbackForm.vehicleId <= 0) && this.selectedVehicle?.id) {
      this.feedbackForm.vehicleId = this.selectedVehicle.id;
    }
    if (this.isAdminRole && this.selectedFeedbackId == null) {
      this.submitError = 'Admin can edit existing feedback but cannot create new feedback.';
      return;
    }
    if (!this.validateFeedbackForm()) return;
    const payload: FeedbackVehiclePayload = {
      ...this.feedbackForm,
      noteGlobal: Number(this.feedbackForm.noteGlobal),
    };
    const req =
      this.selectedFeedbackId == null
        ? this.vehicleService.createFeedback(payload)
        : this.vehicleService.updateFeedback(this.selectedFeedbackId, payload);
    req.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () => {
        this.submitSuccess = 'Feedback saved successfully.';
        this.reloadAllSubEntities();
        this.resetFeedbackForm();
        this.triggerFeedbackReturnAfterSuccess();
      },
      error: (e) => (this.submitError = this.httpErrorMessage(e)),
    });
  }
  editFeedback(row: FeedbackVehicleDto): void {
    this.selectedFeedbackId = row.id;
    this.feedbackForm = {
      feedbackType: row.feedbackType,
      noteGlobal: row.noteGlobal,
      comment: row.comment || '',
      vehicleId: row.vehicleId ?? this.feedbackForm.vehicleId,
      visible: row.visible,
    };
  }
  deleteFeedback(id: number): void {
    if (!this.isAdminRole) return;
    this.vehicleService
      .deleteFeedback(id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => this.reloadAllSubEntities(),
        error: (e) => (this.submitError = this.httpErrorMessage(e)),
      });
  }
  resetFeedbackForm(): void {
    this.selectedFeedbackId = null;
    const defaultType = this.roleFeedbackTypeOptions[0] ?? 'CLIENT_SERVICE';
    this.feedbackForm = {
      feedbackType: defaultType,
      noteGlobal: 0,
      comment: '',
      vehicleId: this.feedbackForm.vehicleId,
    };
  }

  onFeedbackTypeChange(type: FeedbackType): void {
    this.feedbackForm.feedbackType = type;
  }

  starArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  setFeedbackRating(value: number): void {
    this.feedbackForm.noteGlobal = value;
  }

  setFeedbackHover(value: number): void {
    this.feedbackHover = value;
  }

  clearFeedbackHover(): void {
    this.feedbackHover = 0;
  }

  isStarActive(value: number): boolean {
    const threshold = this.feedbackHover > 0 ? this.feedbackHover : Number(this.feedbackForm.noteGlobal || 0);
    return value <= threshold;
  }

  feedbackTypeLabel(type: FeedbackType): string {
    return this.feedbackTypeLabels[type] ?? type;
  }

  updateFeedbackVisibility(row: FeedbackVehicleDto): void {
    if (!this.isAdminRole) return;
    this.vehicleService
      .updateFeedbackVisibility(row.id, !row.visible)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => this.reloadAllSubEntities(),
        error: (e) => (this.submitError = this.httpErrorMessage(e)),
      });
  }

  canEditFeedback(row: FeedbackVehicleDto): boolean {
    if (this.isAdminRole) return true;
    const me = this.auth.getUserId();
    return !!me && row.authorId === me;
  }

  private validateFeedbackForm(): boolean {
    const note = Number(this.feedbackForm.noteGlobal);
    if (!Number.isFinite(note) || note < 1 || note > 5) {
      this.submitError = 'Select a rating between 1 and 5 stars.';
      return false;
    }
    if (!this.feedbackForm.feedbackType) {
      this.submitError = 'Feedback type is required.';
      return false;
    }
    const vehicleId = Number(this.feedbackForm.vehicleId);
    if (!Number.isFinite(vehicleId) || vehicleId <= 0) {
      this.submitError = 'Vehicle missing. Reopen feedback from the reservation.';
      return false;
    }
    this.submitError = '';
    return true;
  }

  private adminFeedbackQuery(): {
    feedbackType?: FeedbackType;
    authorUserId?: number;
    visible?: boolean;
  } {
    const q: { feedbackType?: FeedbackType; authorUserId?: number; visible?: boolean } = {};
    if (this.adminFeedbackFilter.feedbackType) q.feedbackType = this.adminFeedbackFilter.feedbackType;
    const authorId = Number(this.adminFeedbackFilter.authorUserId);
    if (Number.isFinite(authorId) && authorId > 0) q.authorUserId = authorId;
    if (this.adminFeedbackFilter.visible === 'true') q.visible = true;
    if (this.adminFeedbackFilter.visible === 'false') q.visible = false;
    return q;
  }

  applyAdminFeedbackFilters(): void {
    if (!this.isAdminRole) return;
    this.reloadAllSubEntities();
  }

  resetAdminFeedbackFilters(): void {
    this.adminFeedbackFilter = { feedbackType: '', authorUserId: '', visible: '' };
    this.reloadAllSubEntities();
  }

  goBackAfterFeedback(): void {
    if (!this.feedbackReturnTo) return;
    void this.router.navigateByUrl(this.feedbackReturnTo);
  }

  private triggerFeedbackReturnAfterSuccess(): void {
    if (!this.feedbackReturnTo) return;
    if (this.feedbackReturnTimer) {
      clearTimeout(this.feedbackReturnTimer);
    }
    this.feedbackReturnTimer = setTimeout(() => {
      void this.router.navigateByUrl(this.feedbackReturnTo!);
    }, 1200);
  }

  submitEscrow(): void {
    if (!this.canMutateSub) return;
    const payload: EscrowPaymentPayload = { ...this.escrowForm, totalAmount: Number(this.escrowForm.totalAmount) };
    const req =
      this.selectedEscrowId == null
        ? this.vehicleService.createEscrow(payload)
        : this.vehicleService.updateEscrow(this.selectedEscrowId, payload);
    req.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () => {
        this.reloadAllSubEntities();
        this.resetEscrowForm();
      },
      error: (e) => (this.submitError = this.httpErrorMessage(e)),
    });
  }
  editEscrow(row: EscrowPaymentDto): void {
    this.selectedEscrowId = row.id;
    this.escrowForm = {
      totalAmount: row.totalAmount,
      blockDate: row.blockDate,
      releaseDate: row.releaseDate || '',
      statusEscrowPayment: row.statusEscrowPayment,
    };
  }
  deleteEscrow(id: number): void {
    if (!this.canMutateSub) return;
    this.vehicleService
      .deleteEscrow(id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => this.reloadAllSubEntities(),
        error: (e) => (this.submitError = this.httpErrorMessage(e)),
      });
  }
  resetEscrowForm(): void {
    this.selectedEscrowId = null;
    this.escrowForm = { totalAmount: 0, blockDate: '', releaseDate: '', statusEscrowPayment: 'BLOCK' };
  }

  submitGps(): void {
    if (!this.canMutateSub) return;
    const payload: GpsTrackerPayload = { ...this.gpsForm, serialNumber: this.gpsForm.serialNumber.trim() };
    const req =
      this.selectedGpsId == null
        ? this.vehicleService.createGpsTracker(payload)
        : this.vehicleService.updateGpsTracker(this.selectedGpsId, payload);
    req.pipe(finalize(() => this.cdr.markForCheck())).subscribe({
      next: () => {
        this.reloadAllSubEntities();
        this.resetGpsForm();
      },
      error: (e) => (this.submitError = this.httpErrorMessage(e)),
    });
  }
  editGps(row: GpsTrackerDto): void {
    this.selectedGpsId = row.id;
    this.gpsForm = {
      statusTracker: row.statusTracker,
      serialNumber: row.serialNumber,
      installationDate: row.installationDate,
      active: row.active,
    };
  }
  deleteGps(id: number): void {
    if (!this.canMutateSub) return;
    this.vehicleService
      .deleteGpsTracker(id)
      .pipe(finalize(() => this.cdr.markForCheck()))
      .subscribe({
        next: () => this.reloadAllSubEntities(),
        error: (e) => (this.submitError = this.httpErrorMessage(e)),
      });
  }
  resetGpsForm(): void {
    this.selectedGpsId = null;
    this.gpsForm = { statusTracker: 'ASSIGNED', serialNumber: '', installationDate: '', active: true };
  }
}

