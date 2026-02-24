import { Component } from '@angular/core';
import { DocumentTypeOption, VerifiedDocumentRow } from '../../../models';

/**
 * ViewModel: document upload (MVVM).
 */
@Component({
  selector: 'app-document-upload',
  standalone: false,
  templateUrl: './document-upload.html',
  styleUrl: './document-upload.css',
})
export class DocumentUpload {
  readonly pageTitle = 'Document Upload';
  readonly pageSubtitle = 'Upload invoices, bills, and proofs to earn points and strengthen your profile.';
  readonly backRoute = '/score/dashboard';
  readonly backLabel = 'Back to score';
  readonly uploadTitle = 'Upload a document';
  readonly uploadHint = 'Accepted: electricity bill, invoice, rent receipt, ID, proof of income. Each verified document earns points.';
  readonly dropLabel = 'Drop file here or click to browse';
  readonly dropHint = 'PDF, JPG, PNG · max 5 MB';
  readonly documentTypeLabel = 'Document type';
  readonly submitLabel = 'Submit for verification';
  readonly myDocumentsTitle = 'My documents (verified)';

  readonly documentTypes: DocumentTypeOption[] = [
    { value: 'utility', label: 'Electricity / utility bill' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'rent', label: 'Rent receipt' },
    { value: 'income', label: 'Proof of income' },
    { value: 'id', label: 'ID document' },
  ];

  readonly verifiedDocuments: VerifiedDocumentRow[] = [
    { title: 'Electricity bill — Jan 2025', detail: 'Verified · +10 points' },
    { title: 'ID document', detail: 'Verified · +20 points' },
  ];
}
