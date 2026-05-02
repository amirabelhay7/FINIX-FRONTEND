/**
 * Score module – static UI models (MVVM).
 */
export interface SavingsMonthRow {
  month: string;
  detail: string;
  statusLabel: string;
  statusClass: string;
}

export interface VerifiedDocumentRow {
  title: string;
  detail: string;
  pointsLabel?: string;
}

export interface DocumentTypeOption {
  value: string;
  label: string;
}
