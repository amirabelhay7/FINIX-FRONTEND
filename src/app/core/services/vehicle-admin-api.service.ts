import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments';
import {
  PageResponse,
  Vehicle,
  VehicleApiRequestDto,
  VehicleApiResponse,
  VehicleCreateUpdateDto,
  VehicleSearchParams,
  mapBackendPageToVehiclePage,
  mapBackendVehicleToVehicle,
  mapFormToVehicleApiRequest,
} from '../models/vehicle.models';

type VehiclesListResponse = VehicleApiResponse[] | PageResponse<VehicleApiResponse>;

@Injectable({
  providedIn: 'root',
})
export class VehicleAdminApiService {
  // Backend controller is mapped to /api/vehicles
  private readonly baseUrl = `${environment.apiBaseUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  getAll(params: VehicleSearchParams = {}): Observable<PageResponse<Vehicle>> {
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

  create(dto: VehicleCreateUpdateDto): Observable<Vehicle> {
    const apiDto: VehicleApiRequestDto = mapFormToVehicleApiRequest(dto);
    if (environment.apiDebug) {
      // eslint-disable-next-line no-console
      console.debug('[VehicleAdminApiService] create payload', apiDto);
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post<VehicleApiResponse>(this.baseUrl, apiDto, { headers })
      .pipe(map((api) => mapBackendVehicleToVehicle(api)));
  }

  update(id: string, dto: VehicleCreateUpdateDto): Observable<Vehicle> {
    const apiDto: VehicleApiRequestDto = mapFormToVehicleApiRequest(dto);
    if (environment.apiDebug) {
      // eslint-disable-next-line no-console
      console.debug('[VehicleAdminApiService] update payload', id, apiDto);
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .put<VehicleApiResponse>(`${this.baseUrl}/${encodeURIComponent(id)}`, apiDto, { headers })
      .pipe(map((api) => mapBackendVehicleToVehicle(api)));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${encodeURIComponent(id)}`);
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

