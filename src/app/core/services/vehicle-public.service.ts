import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Vehicle } from '../models/vehicle.model';
import { VEHICLES_MARKETPLACE } from '../mock-data/vehicles-marketplace.mock';

@Injectable({ providedIn: 'root' })
export class VehiclePublicService {
  private readonly vehicles = VEHICLES_MARKETPLACE.filter((v) => v.status === 'PUBLISHED');

  getAll(): Observable<Vehicle[]> {
    return of([...this.vehicles]);
  }

  getById(id: string): Observable<Vehicle | undefined> {
    const vehicle = this.vehicles.find((v) => v.id === id);
    return of(vehicle);
  }

  getSimilar(excludeId: string, limit = 4): Observable<Vehicle[]> {
    const v = this.vehicles.find((x) => x.id === excludeId);
    if (!v) return of([]);
    const similar = this.vehicles
      .filter((x) => x.id !== excludeId && (x.brand === v.brand || x.fuelType === v.fuelType))
      .slice(0, limit);
    return of(similar);
  }
}
