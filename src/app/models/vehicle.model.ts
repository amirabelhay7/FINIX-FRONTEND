/**
 * Vehicle module – static UI models (MVVM).
 */
export interface VehicleListItem {
  id: number;
  name: string;
  subtitlePrefix: string;
  status: string;
  statusClass: string;
  route: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

/** Vehicle detail key-value. */
export interface VehicleDetailItem {
  label: string;
  value: string;
  valueClass?: string;
}

/** Document row for vehicle detail. */
export interface VehicleDocumentRow {
  title: string;
  uploadedAt: string;
}
