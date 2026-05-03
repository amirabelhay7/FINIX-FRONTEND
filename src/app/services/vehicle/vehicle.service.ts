import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VehicleApiDto {
  id: number;
  marque: string;
  modele: string;
  prixTnd: number;
  status?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Vehicle {
  private readonly apiUrl = `${environment.apiBaseUrl}${environment.apiEndpoints.vehicle}`;

  constructor(private http: HttpClient) {}

  getVehicles(): Observable<VehicleApiDto[]> {
    return this.http.get<VehicleApiDto[]>(this.apiUrl);
  }
}
