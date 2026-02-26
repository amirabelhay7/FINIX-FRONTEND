import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Vehicle, VehicleCreateUpdateDto } from '../models/vehicle.model';
import { VEHICLES_MARKETPLACE } from '../mock-data/vehicles-marketplace.mock';

@Injectable({ providedIn: 'root' })
export class VehicleAdminService {
  private readonly store$ = new BehaviorSubject<Vehicle[]>([...VEHICLES_MARKETPLACE]);

  getAll(): Observable<Vehicle[]> {
    return this.store$.asObservable();
  }

  getById(id: string): Observable<Vehicle | undefined> {
    return this.store$.pipe(map((list) => list.find((v) => v.id === id)));
  }

  create(dto: VehicleCreateUpdateDto): Observable<Vehicle> {
    const id = 'v' + (this.store$.value.length + 1);
    const vehicle: Vehicle = {
      ...dto,
      id,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const next = [...this.store$.value, vehicle];
    this.store$.next(next);
    return of(vehicle).pipe(delay(200));
  }

  update(id: string, dto: VehicleCreateUpdateDto): Observable<Vehicle | null> {
    const list = this.store$.value;
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) return of(null).pipe(delay(200));
    const updated: Vehicle = { ...list[idx], ...dto };
    const next = [...list];
    next[idx] = updated;
    this.store$.next(next);
    return of(updated).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    const next = this.store$.value.filter((v) => v.id !== id);
    if (next.length === this.store$.value.length) return of(false).pipe(delay(200));
    this.store$.next(next);
    return of(true).pipe(delay(200));
  }
}
