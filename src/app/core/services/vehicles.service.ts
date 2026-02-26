import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  VEHICLE_ITEMS,
  VEHICLE_METRICS,
  VehicleItem,
  VehicleMetric,
} from '../mock-data/vehicles.mock';

@Injectable({
  providedIn: 'root',
})
export class VehiclesService {
  getMetrics(): Observable<VehicleMetric[]> {
    return of(VEHICLE_METRICS);
  }

  getVehicles(): Observable<VehicleItem[]> {
    return of(VEHICLE_ITEMS);
  }
}

