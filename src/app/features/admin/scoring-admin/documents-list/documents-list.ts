import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { UserDocumentApi, DocumentVerificationLogApi } from '../../../../models';

type StatusFilter = 'pending' | 'verified' | 'rejected' | 'all';

@Component({
  selector: 'app-documents-list',
  standalone: false,
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.css',
})
export class DocumentsList implements OnInit {
  readonly pageTitle = 'Document verification';
  readonly pageSubtitle = 'Review and verify or reject user-uploaded documents.';

  loading = true;
  error: string | null = null;
  documents: UserDocumentApi[] = [];
  verifyNotes = '';
  statusFilter: StatusFilter = 'pending';
  historyForId: number | null = null;
  history: DocumentVerificationLogApi[] = [];
  historyLoading = false;

  /** In-page document viewer */
  viewerDoc: UserDocumentApi | null = null;
  viewerUrl: string | null = null;
  viewerSafeUrl: SafeResourceUrl | null = null;
  viewerLoading = false;

  constructor(
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  setFilter(status: StatusFilter) {
    this.statusFilter = status;
    this.loadDocuments();
  }

  loadDocuments() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    const request = this.statusFilter === 'pending'
      ? this.scoreService.getPendingDocuments()
      : this.scoreService.getDocumentsByStatus(this.statusFilter);
    request.pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (list) => { this.documents = list ?? []; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load documents';
        this.cdr.detectChanges();
      }
    });
  }

  loadPending() {
    this.setFilter('pending');
  }

  openViewer(doc: UserDocumentApi) {
    this.closeViewer();
    this.viewerDoc = doc;
    this.viewerUrl = null;
    this.viewerSafeUrl = null;
    this.viewerLoading = true;
    this.cdr.detectChanges();
    this.scoreService.getDocumentFile(doc.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.viewerUrl = url;
        this.viewerSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.viewerLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.viewerLoading = false;
        this.error = 'Could not load document';
        this.cdr.detectChanges();
      }
    });
  }

  closeViewer() {
    if (this.viewerUrl) URL.revokeObjectURL(this.viewerUrl);
    this.viewerDoc = null;
    this.viewerUrl = null;
    this.viewerSafeUrl = null;
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.viewerDoc) this.closeViewer();
  }

  isViewerPdf(): boolean {
    const mime = (this.viewerDoc?.mimeType || '').toLowerCase();
    return mime.includes('pdf');
  }

  isViewerImage(): boolean {
    const mime = (this.viewerDoc?.mimeType || '').toLowerCase();
    return mime.startsWith('image/');
  }

  toggleHistory(docId: number) {
    if (this.historyForId === docId) {
      this.historyForId = null;
      this.cdr.detectChanges();
      return;
    }
    this.historyForId = docId;
    this.history = [];
    this.historyLoading = true;
    this.cdr.detectChanges();
    this.scoreService.getDocumentHistory(docId).subscribe({
      next: (list) => { this.history = list ?? []; this.historyLoading = false; this.cdr.detectChanges(); },
      error: () => { this.historyLoading = false; this.cdr.detectChanges(); }
    });
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString();
  }

  verify(id: number) {
    this.error = null;
    this.scoreService.verifyDocument(id, this.verifyNotes).subscribe({
      next: () => {
        this.verifyNotes = '';
        this.error = null;
        this.loadDocuments();
        if (this.viewerDoc?.id === id) this.closeViewer();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.error || err?.error?.message || err?.message || 'Verify failed';
        this.cdr.detectChanges();
      }
    });
  }

  reject(id: number) {
    if (!confirm('Reject this document?')) return;
    this.scoreService.rejectDocument(id, this.verifyNotes).subscribe({
      next: () => {
        this.verifyNotes = '';
        this.loadDocuments();
        if (this.viewerDoc?.id === id) this.closeViewer();
        this.cdr.detectChanges();
      },
      error: (err) => { this.error = err?.error?.message || 'Reject failed'; this.cdr.detectChanges(); }
    });
  }
}
