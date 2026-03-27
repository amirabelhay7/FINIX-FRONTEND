import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

/** Lets seller feature routes open the add-vehicle modal hosted on `SellerLayout`. */
@Injectable({ providedIn: 'root' })
export class SellerShellService {
  private readonly openAddVehicle = new Subject<void>();
  readonly openAddVehicle$ = this.openAddVehicle.asObservable();

  emitOpenAddVehicle(): void {
    this.openAddVehicle.next();
  }
}
