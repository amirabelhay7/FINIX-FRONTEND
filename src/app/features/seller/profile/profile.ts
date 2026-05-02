import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { UserDocument, UserProfile, UserService } from '../../../services/user/user.service';
import { VehiclePreferencesPayload } from '../../../models';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-seller-profile',
  standalone: false,
  templateUrl: '../../client/user-profile/user-profile.html',
  styleUrl: '../../client/user-profile/user-profile.css',
})
export class SellerProfileComponent implements OnInit {
  isLoading = false;
  saving = false;
  isUploadingImage = false;
  isUploadingDocument = false;
  isChangingPassword = false;

  message = '';
  error = '';
  successToast = '';
  errorToast = '';
  showDeleteConfirm = false;
  pendingDeleteDocumentId: number | null = null;

  selectedDocumentType = 'ID_CARD';
  readonly documentTypes = [
    'ID_CARD',
    'PASSPORT',
    'DRIVER_LICENSE',
    'TAX_CERTIFICATE',
    'COMPANY_REGISTRATION',
    'PROOF_OF_ADDRESS',
    'BANK_STATEMENT',
    'OTHER',
  ];

  profile: UserProfile = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    notificationsEnabled: true,
    preferredLanguage: 'fr',
  };

  documents: UserDocument[] = [];
  password = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Required by shared template — not used for SELLER role (section hidden via *ngIf)
  vehiclePrefs: VehiclePreferencesPayload = { budgetMax: null, preferredVehicleType: null, preferredBrands: null, city: null, vehicleUsage: null };
  savingPrefs = false;
  prefSuccess = '';
  prefError = '';
  readonly vehicleTypes: string[] = [];
  readonly usageOptions: string[] = [];

  saveVehiclePreferences(): void {}

  constructor(
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef,
    private readonly ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.hydrateFromStoredUser();
    this.loadProfileData();
  }

  loadProfileData(): void {
    this.isLoading = true;
    this.error = '';
    this.message = '';

    forkJoin({
      profile: this.userService.getMyProfile().pipe(
        timeout(12000),
        catchError((err) => {
          console.error('GET /api/users/me failed', err);
          this.error = err?.message ?? 'Unable to load profile.';
          this.showErrorToast(this.error);
          return of(null);
        }),
      ),
      documents: this.userService.getMyDocuments().pipe(
        timeout(12000),
        catchError((err) => {
          console.error('GET /api/users/me/documents failed', err);
          this.showErrorToast(err?.message ?? 'Unable to load documents.');
          return of([]);
        }),
      ),
    })
      .pipe(
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.forceUiRefresh();
          });
        }),
      )
      .subscribe(({ profile, documents }) => {
        this.ngZone.run(() => {
          if (profile) {
            this.profile = { ...this.profile, ...this.normalizeProfileResponse(profile) };
          }
          this.documents = documents as UserDocument[];
          this.forceUiRefresh();
        });
      });
  }

  get completionPercent(): number {
    const fields = [
      this.profile.firstName,
      this.profile.lastName,
      this.profile.email,
      this.profile.phone,
      this.profile.address,
      this.profile.city,
      this.profile.country,
      this.profile.birthDate,
      this.profile.occupation,
      this.profile.companyName,
      this.profile.preferredLanguage,
    ];
    const filled = fields.filter((v) => !!v && `${v}`.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }

  updateProfile(): void {
    if (this.saving) return;
    this.saving = true;
    this.error = '';
    this.message = '';

    const payload = {
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      phone: this.profile.phone,
      address: this.profile.address,
      city: this.profile.city,
      country: this.profile.country,
      birthDate: this.profile.birthDate,
      occupation: this.profile.occupation,
      monthlyIncome: this.profile.monthlyIncome,
      companyName: this.profile.companyName,
      taxNumber: this.profile.taxNumber,
      licenseNumber: this.profile.licenseNumber,
      preferredLanguage: this.profile.preferredLanguage,
      notificationsEnabled: this.profile.notificationsEnabled,
    };

    this.userService.updateMyProfile(payload)
      .pipe(timeout(12000), finalize(() => (this.saving = false)))
      .subscribe({
        next: (profile) => {
          this.profile = { ...this.profile, ...this.normalizeProfileResponse(profile) };
          this.persistCurrentUser();
          this.showSuccessToast('Profile updated successfully.');
        },
        error: (err) => {
          console.error('PUT /api/users/me failed', err);
          const timeoutError = err?.name === 'TimeoutError';
          this.error = timeoutError ? 'Saving took too long. Please try again.' : err?.message ?? 'Unable to update profile.';
          this.showErrorToast(this.error);
        },
      });
  }

  uploadProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.isUploadingImage = true;
    this.userService.uploadProfileImage(file).subscribe({
      next: (res) => {
        this.profile.profileImageUrl = this.getImageUrl(res.profileImageUrl);
        this.persistCurrentUser();
        this.isUploadingImage = false;
        this.showSuccessToast('Profile image updated.');
      },
      error: (err) => {
        console.error('POST /api/users/me/image failed', err);
        this.isUploadingImage = false;
        this.showErrorToast(err?.message ?? 'Unable to upload profile image.');
      },
    });
  }

  uploadDocument(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.isUploadingDocument = true;
    this.userService.uploadDocument(file, this.selectedDocumentType).subscribe({
      next: (doc) => {
        this.documents = [doc, ...this.documents];
        this.isUploadingDocument = false;
        this.showSuccessToast('Document uploaded successfully.');
      },
      error: (err) => {
        console.error('POST /api/users/me/documents failed', err);
        this.isUploadingDocument = false;
        this.showErrorToast(err?.message ?? 'Unable to upload document.');
      },
    });
  }

  askDeleteDocument(documentId: number): void {
    this.pendingDeleteDocumentId = documentId;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.pendingDeleteDocumentId = null;
  }

  confirmDelete(): void {
    if (this.pendingDeleteDocumentId == null) return;
    const documentId = this.pendingDeleteDocumentId;
    this.showDeleteConfirm = false;
    this.pendingDeleteDocumentId = null;
    this.userService.deleteDocument(documentId).subscribe({
      next: () => {
        this.documents = this.documents.filter((d) => d.id !== documentId);
        this.showSuccessToast('Document deleted.');
      },
      error: (err) => {
        console.error('DELETE /api/users/me/documents/{id} failed', err);
        this.showErrorToast(err?.message ?? 'Unable to delete document.');
      },
    });
  }

  changePassword(): void {
    if (this.password.newPassword !== this.password.confirmPassword) {
      this.showErrorToast('New password and confirmation do not match.');
      return;
    }
    this.isChangingPassword = true;
    this.userService.changePassword({
      currentPassword: this.password.currentPassword,
      newPassword: this.password.newPassword,
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.password = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.showSuccessToast('Password changed successfully.');
      },
      error: (err) => {
        console.error('PUT /api/users/me/password failed', err);
        this.isChangingPassword = false;
        this.showErrorToast(err?.message ?? 'Unable to change password.');
      },
    });
  }

  statusClass(status: string): string {
    if (status === 'APPROVED') return 'badge approved';
    if (status === 'REJECTED') return 'badge rejected';
    return 'badge pending';
  }

  getImageUrl(path?: string): string {
    if (!path || !path.trim()) return '';
    const raw = path.trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    const backendBase = 'http://localhost:8082';
    if (raw.startsWith('/')) return `${backendBase}${raw}`;
    return `${backendBase}/${raw}`;
  }

  private showSuccessToast(text: string): void {
    this.successToast = text;
    setTimeout(() => {
      if (this.successToast === text) this.successToast = '';
    }, 2800);
  }

  private showErrorToast(text: string): void {
    this.errorToast = text;
    setTimeout(() => {
      if (this.errorToast === text) this.errorToast = '';
    }, 3500);
  }

  private normalizeProfileResponse(data: unknown): Partial<UserProfile> {
    const record = (data ?? {}) as Record<string, unknown>;
    const phone = typeof record['phone'] === 'string' ? record['phone'] : record['phoneNumber'] != null ? String(record['phoneNumber']) : '';
    const birthDateValue = (record['birthDate'] ?? record['dateOfBirth']) as string | undefined;
    const birthDate = birthDateValue ? `${birthDateValue}`.slice(0, 10) : undefined;

    return {
      id: Number(record['id'] ?? 0),
      firstName: String(record['firstName'] ?? ''),
      lastName: String(record['lastName'] ?? ''),
      email: String(record['email'] ?? ''),
      role: String(record['role'] ?? ''),
      phone,
      address: String(record['address'] ?? ''),
      city: String(record['city'] ?? ''),
      country: String(record['country'] ?? ''),
      birthDate,
      profileImageUrl: String(record['profileImageUrl'] ?? ''),
      occupation: String(record['occupation'] ?? ''),
      monthlyIncome: record['monthlyIncome'] != null ? Number(record['monthlyIncome']) : undefined,
      companyName: String(record['companyName'] ?? ''),
      taxNumber: String(record['taxNumber'] ?? ''),
      licenseNumber: String(record['licenseNumber'] ?? ''),
      preferredLanguage: String(record['preferredLanguage'] ?? 'fr'),
      notificationsEnabled: record['notificationsEnabled'] == null ? true : Boolean(record['notificationsEnabled']),
    };
  }

  private persistCurrentUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      const existing = raw ? JSON.parse(raw) : {};
      const name = `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim();
      const updated = {
        ...existing,
        name: name || existing.name || 'User',
        email: this.profile.email || existing.email || '',
        role: this.profile.role || existing.role || 'SELLER',
        profileImageUrl: this.profile.profileImageUrl || '',
      };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      sessionStorage.setItem('currentUser', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('finix-user-updated', { detail: updated }));
    } catch (e) {
      console.error('Unable to persist currentUser profile image', e);
    }
  }

  private hydrateFromStoredUser(): void {
    try {
      const raw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (!raw) return;
      const user = JSON.parse(raw) as Record<string, unknown>;
      const fullName = String(user['name'] ?? '').trim();
      const [firstName = '', ...rest] = fullName.split(' ');
      const lastName = rest.join(' ');
      this.profile = {
        ...this.profile,
        firstName: this.profile.firstName || firstName,
        lastName: this.profile.lastName || lastName,
        email: this.profile.email || String(user['email'] ?? ''),
        role: this.profile.role || String(user['role'] ?? 'SELLER'),
        profileImageUrl: this.getImageUrl(String(user['profileImageUrl'] ?? '')),
      };
      this.forceUiRefresh();
    } catch (e) {
      console.error('Unable to hydrate profile from currentUser', e);
    }
  }

  private forceUiRefresh(): void {
    this.cdr.detectChanges();
  }
}
