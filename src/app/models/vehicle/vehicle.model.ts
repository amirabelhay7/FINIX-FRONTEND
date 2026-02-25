/**
 * Vehicle (backend module).
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

export interface VehicleDetailItem {
  label: string;
  value: string;
  valueClass?: string;
}

export interface VehicleDocumentRow {
  title: string;
  uploadedAt: string;
}
