import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments';
import {
  PageResponse,
  Vehicle,
  VehicleApiResponse,
  VehicleSearchParams,
  mapBackendPageToVehiclePage,
  mapBackendVehicleToVehicle,
} from '../models/vehicle.models';

type VehiclesListResponse = VehicleApiResponse[] | PageResponse<VehicleApiResponse>;

@Injectable({
  providedIn: 'root',
})
export class VehiclePublicApiService {
  // Reuse the same backend controller at /api/vehicles for public marketplace
  private readonly baseUrl = `${environment.apiBaseUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  search(params: VehicleSearchParams = {}): Observable<PageResponse<Vehicle>> {
    let httpParams = new HttpParams();

    const entries: [string, unknown][] = [
      ['q', params.q],
      ['minPrice', params.minPrice],
      ['maxPrice', params.maxPrice],
      ['minYear', params.minYear],
      ['maxYear', params.maxYear],
      ['fuelType', params.fuelType],
      ['gearbox', params.gearbox],
      ['location', params.location],
      ['page', params.page],
      ['size', params.size],
    ];

    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return this.http
      .get<VehiclesListResponse>(this.baseUrl, { params: httpParams })
      .pipe(map((res) => this.normalizeListResponse(res)))
      .pipe(map((page) => mapBackendPageToVehiclePage(page)));
  }

  getById(id: string): Observable<Vehicle> {
    return this.http
      .get<VehicleApiResponse>(`${this.baseUrl}/${encodeURIComponent(id)}`)
      .pipe(map((api) => mapBackendVehicleToVehicle(api)));
  }

  private normalizeListResponse(res: VehiclesListResponse): PageResponse<VehicleApiResponse> {
    if (Array.isArray(res)) {
      return {
        content: res,
        totalElements: res.length,
        totalPages: 1,
        number: 0,
        size: res.length || 0,
      };
    }
    return res;
  }
}

