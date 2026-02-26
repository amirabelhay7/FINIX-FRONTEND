import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminUserApi, AdminCreateUserRequest } from '../../models';
import { AuthService } from '../auth/auth.service';

const API = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  private authOptions(): { headers?: HttpHeaders; withCredentials?: boolean } {
    const token = this.auth.getToken();
    if (!token) return { withCredentials: true };
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      withCredentials: true,
    };
  }

  getAll(includeDeleted = false): Observable<AdminUserApi[]> {
    const options = {
      ...this.authOptions(),
      params: { includeDeleted: String(includeDeleted) } as Record<string, string>,
    };
    return this.http.get<AdminUserApi[]>(`${API}/users`, options);
  }

  getById(id: number): Observable<AdminUserApi> {
    return this.http.get<AdminUserApi>(`${API}/users/${id}`, this.authOptions());
  }

  create(request: AdminCreateUserRequest): Observable<AdminUserApi> {
    return this.http.post<AdminUserApi>(`${API}/users`, request, this.authOptions());
  }

  update(id: number, user: Partial<AdminUserApi> & { password?: string }): Observable<AdminUserApi> {
    return this.http.put<AdminUserApi>(`${API}/users/${id}`, user, this.authOptions());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/users/${id}`, this.authOptions());
  }
}
