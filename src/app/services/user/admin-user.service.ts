import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUserApi {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  role?: string | null;
  cin?: string | number | null;
  city?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly api = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AdminUserApi[]> {
    return this.http.get<AdminUserApi[]>(this.api);
  }
}

