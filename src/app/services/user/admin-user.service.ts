import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUserApi {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  phoneNumber?: number | null;
  cin?: string | number | null;
  address?: string | null;
  city?: string | null;
}

export interface AdminUserUpsertPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber?: number | null;
  password?: string;
  cin?: string;
  address?: string;
  city?: string;
  agenceCode?: number | null;
  region?: number | null;
  insurerName?: string;
  insurerEmail?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly api = 'http://localhost:8081/api/users';
  private readonly authApi = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminUserApi[]> {
    return this.http.get<AdminUserApi[]>(this.api);
  }

  getById(id: number): Observable<AdminUserApi> {
    return this.http.get<AdminUserApi>(`${this.api}/${id}`);
  }

  create(payload: AdminUserUpsertPayload): Observable<unknown> {
    return this.http.post(`${this.authApi}/register`, payload);
  }

  update(id: number, payload: AdminUserUpsertPayload): Observable<unknown> {
    return this.http.put(`${this.api}/${id}`, payload);
  }
}

