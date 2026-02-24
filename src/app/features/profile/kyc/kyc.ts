import { Component } from '@angular/core';
import { KycVerificationStep, KycDocumentItem } from '../../../models';

/**
 * ViewModel: KYC verification (MVVM).
 */
@Component({
  selector: 'app-kyc',
  standalone: false,
  templateUrl: './kyc.html',
  styleUrl: './kyc.css',
})
export class Kyc {
  readonly pageTitle = 'KYC Verification';
  readonly pageSubtitle = 'Upload your identity documents to unlock full platform access.';
  readonly verifiedBadgeLabel = 'Identity Verified';
  readonly progressTitle = 'Verification Progress';
  readonly uploadedDocumentsTitle = 'Uploaded Documents';
  readonly completedLabel = '3 of 4 completed';
  readonly dropzoneTitle = 'Drag & drop a document here';
  readonly dropzoneHint = 'PDF, JPG, PNG — max 5MB';
  readonly browseLabel = 'Browse Files';

  readonly steps: KycVerificationStep[] = [
    { title: 'Identity', subtitle: 'CIN uploaded & verified', icon: 'check', bgClass: 'bg-green-50', borderClass: 'border-green-100', iconBgClass: 'bg-green-500', titleClass: 'text-green-700', subtitleClass: 'text-green-600' },
    { title: 'Address Proof', subtitle: 'Utility bill accepted', icon: 'check', bgClass: 'bg-green-50', borderClass: 'border-green-100', iconBgClass: 'bg-green-500', titleClass: 'text-green-700', subtitleClass: 'text-green-600' },
    { title: 'Income Proof', subtitle: 'Under review', icon: 'hourglass_top', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-100', iconBgClass: 'bg-yellow-400', titleClass: 'text-yellow-700', subtitleClass: 'text-yellow-600' },
    { title: 'Selfie / Liveness', subtitle: 'Not started', icon: 'lock', bgClass: 'bg-gray-50', borderClass: 'border-gray-100', iconBgClass: 'bg-gray-300', titleClass: 'text-gray-400', subtitleClass: 'text-gray-400' },
  ];

  readonly documents: KycDocumentItem[] = [
    { title: 'National ID Card (CIN)', detail: 'cin_amadou_kone.pdf · 1.2 MB · Uploaded Jan 15, 2026', icon: 'id_card', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600', statusLabel: 'Verified', statusClass: 'bg-green-50 text-green-700 border-green-100' },
    { title: 'Proof of Address', detail: 'facture_steg.pdf · 890 KB · Uploaded Jan 15, 2026', icon: 'home', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600', statusLabel: 'Verified', statusClass: 'bg-green-50 text-green-700 border-green-100' },
    { title: 'Income Statement / Pay Slip', detail: 'salaire_jan26.pdf · 560 KB · Uploaded Feb 01, 2026', icon: 'work', iconBgClass: 'bg-yellow-50', iconColorClass: 'text-yellow-600', statusLabel: 'Reviewing', statusClass: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { title: 'Selfie / Liveness Check', detail: 'Not yet uploaded', icon: 'face', iconBgClass: 'bg-gray-50', iconColorClass: 'text-gray-300', isMissing: true, uploadLabel: 'Upload' },
  ];
}
