import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import { UserDocumentApi } from '../../../models';

@Component({
  selector: 'app-document-upload',
  standalone: false,
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css',
})
export class DocumentUpload implements OnInit {
  readonly pageTitle = 'Document Upload';
  readonly pageSubtitle = 'Upload invoices, bills, and proofs to earn points and strengthen your profile.';
  readonly backRoute = '/score/dashboard';
  readonly backLabel = 'Back to score';
  readonly uploadTitle = 'Upload a document';
  readonly uploadHint = 'Accepted: electricity bill, invoice, rent receipt, ID, proof of income. Each verified document earns points.';
  readonly dropLabel = 'Drop file here or click to browse';
  readonly dropHint = 'PDF, JPG, PNG · max 5 MB';
  readonly documentTypeLabel = 'Document type';
  readonly descriptionLabel = 'Description (optional)';
  readonly submitLabel = 'Submit for verification';
  readonly myDocumentsTitle = 'My documents';

  readonly documentTypes: { value: string; label: string }[] = [
    { value: 'CIN', label: 'ID (CIN)' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'UTILITY_BILL', label: 'Utility bill' },
    { value: 'BANK_STATEMENT', label: 'Bank statement' },
    { value: 'PAY_SLIP', label: 'Pay slip' },
    { value: 'RENTAL_AGREEMENT', label: 'Rental agreement' },
    { value: 'OTHER', label: 'Other' },
  ];

  loading = true;
  uploading = false;
  error: string | null = null;
  documents: UserDocumentApi[] = [];
  selectedFile: File | null = null;
  documentType = 'CIN';
  description = '';

  constructor(
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getMyDocuments().pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (list) => { this.documents = list ?? []; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load documents';
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.cdr.detectChanges();
    }
    input.value = '';
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

  submitUpload() {
    if (!this.selectedFile) {
      this.error = 'Please select a file.';
      this.cdr.detectChanges();
      return;
    }
    this.uploading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.uploadDocument(this.selectedFile, this.documentType, this.description || undefined).pipe(
      finalize(() => { this.uploading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => {
        this.selectedFile = null;
        this.description = '';
        this.error = null;
        this.loadDocuments();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const status = err?.status;
        this.error = status === 401
          ? 'Upload failed (session issue). Check the list below — your document may have been uploaded.'
          : (err?.error?.message || err?.message || 'Upload failed');
        this.loadDocuments();
        this.cdr.detectChanges();
      }
    });
  }

  get verifiedDocuments() {
    return this.documents.filter(d => d.verified);
  }

  get pendingDocuments() {
    return this.documents.filter(d => !d.verified);
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString();
  }
}
