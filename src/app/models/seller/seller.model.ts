/**
 * Seller (backend module).
 */
export interface SellerKpiCard {
  label: string;
  value: string;
  valueClass?: string;
}

export interface SellerOrderRow {
  title: string;
  meta: string;
  status: string;
  statusClass: string;
}

export interface SellerListingRow {
  name: string;
  meta: string;
  status: string;
  statusClass: string;
}
