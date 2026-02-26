export * from './vehicle.model';

// Additional DTOs and mappers for API layer

export interface VehicleSearchParams {
  q?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  fuelType?: string | null;
  gearbox?: string | null;
  location?: string | null;
  page?: number | null;
  size?: number | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Backend DTOs and mapping
 *
 * The Spring Boot backend currently exposes:
 * - VehicleRequestDTO: { marque, modele, prixTnd, status, active }
 * - Vehicle entity: { id, marque, modele, prixTnd, status, active, createdAt, updatedAt, ... }
 */

export type BackendVehicleStatus = 'DISPONIBLE' | 'RESERVE' | 'VENDU' | 'INACTIF';

export interface VehicleApiRequestDto {
  marque: string;
  modele: string;
  prixTnd: number;
  status: BackendVehicleStatus;
  active: boolean;
}

export interface VehicleApiResponse {
  id: number;
  marque: string;
  modele: string;
  prixTnd: number;
  status: BackendVehicleStatus;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

import type { Vehicle, VehicleCreateUpdateDto, VehicleStatus } from './vehicle.model';

export function mapVehicleStatusToBackend(status: VehicleStatus): BackendVehicleStatus {
  // Map UI statuses to backend enum values.
  // Convention: PUBLISHED => DISPONIBLE, DRAFT => INACTIF
  if (status === 'PUBLISHED') return 'DISPONIBLE';
  return 'INACTIF';
}

export function mapBackendStatusToVehicle(status: BackendVehicleStatus): VehicleStatus {
  if (status === 'DISPONIBLE') return 'PUBLISHED';
  return 'DRAFT';
}

export function mapFormToVehicleApiRequest(form: VehicleCreateUpdateDto): VehicleApiRequestDto {
  return {
    marque: form.brand,
    modele: form.model,
    prixTnd: form.price,
    status: mapVehicleStatusToBackend(form.status),
    active: true,
  };
}

export function mapBackendVehicleToVehicle(api: VehicleApiResponse): Vehicle {
  const createdAtIso = api.createdAt ?? new Date().toISOString();
  const createdYear = new Date(createdAtIso).getFullYear();

  return {
    id: String(api.id),
    brand: api.marque,
    model: api.modele,
    year: createdYear,
    mileageKm: 0,
    price: Number(api.prixTnd),
    fuelType: 'Diesel',
    gearbox: 'Manuelle',
    location: 'Tunis',
    status: mapBackendStatusToVehicle(api.status),
    description: '',
    imageUrls: ['https://picsum.photos/seed/vehicle-api/400/300'],
    badge: null,
    createdAt: createdAtIso,
  };
}

export function mapBackendPageToVehiclePage(
  page: PageResponse<VehicleApiResponse>,
): PageResponse<Vehicle> {
  return {
    ...page,
    content: page.content.map(mapBackendVehicleToVehicle),
  };
}


