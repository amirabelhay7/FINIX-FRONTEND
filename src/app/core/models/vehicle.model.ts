export type FuelType = 'Diesel' | 'Essence' | 'Hybrid' | 'Electric';
export type Gearbox = 'Manuelle' | 'Automatique';
export type VehicleStatus = 'DRAFT' | 'PUBLISHED';
export type MarketplaceBadge = 'Nouveau' | 'Bon prix' | null;

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  price: number;
  fuelType: FuelType;
  gearbox: Gearbox;
  location: string;
  status: VehicleStatus;
  description: string;
  imageUrls: string[];
  badge?: MarketplaceBadge;
  createdAt: string;
}

export interface VehicleCreateUpdateDto {
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  price: number;
  fuelType: FuelType;
  gearbox: Gearbox;
  location: string;
  status: VehicleStatus;
  description: string;
  imageUrls: string[];
}
