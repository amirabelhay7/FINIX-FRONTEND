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
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED' | string | null;
  active?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  deleteReason?: string | null;
  /** Admin invite: user must set password via email link. */
  mustSetPassword?: boolean | null;
  onboardingStatus?: 'PENDING_INVITE' | 'ACTIVE' | string | null;
  invitedBy?: string | null;
  invitedAt?: string | null;
  inviteAcceptedAt?: string | null;
}

export interface AdminUserCreateResponse {
  user?: AdminUserApi;
  inviteSent?: boolean;
  inviteExpiresAt?: string;
  onboardingStatus?: string;
  message?: string;
}

export interface AdminUserUpsertPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber?: number | null;
  password?: string;
  cin?: number;
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

  constructor(private http: HttpClient) {}

  getAll(includeDeleted = false): Observable<AdminUserApi[]> {
    return this.http.get<AdminUserApi[]>(`${this.api}?includeDeleted=${includeDeleted}`);
  }

  getById(id: number): Observable<AdminUserApi> {
    return this.http.get<AdminUserApi>(`${this.api}/${id}`);
  }

  create(payload: AdminUserUpsertPayload): Observable<AdminUserCreateResponse | AdminUserApi> {
    return this.http.post<AdminUserCreateResponse | AdminUserApi>(`${this.api}/register`, payload);
  }

  resendInvite(userId: number): Observable<{ inviteSent?: boolean; message?: string }> {
    return this.http.post<{ inviteSent?: boolean; message?: string }>(
      `${this.api}/${userId}/resend-invite`,
      {},
    );
  }

  update(id: number, payload: AdminUserUpsertPayload): Observable<unknown> {
    return this.http.put(`${this.api}/${id}`, payload);
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.patch(`${this.api}/${id}/deactivate`, {});
  }

  softDelete(id: number, deletedBy?: string, reason?: string): Observable<unknown> {
    const params: string[] = [];
    if (deletedBy) params.push(`deletedBy=${encodeURIComponent(deletedBy)}`);
    if (reason) params.push(`reason=${encodeURIComponent(reason)}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return this.http.delete(`${this.api}/${id}${q}`);
  }

  restore(id: number): Observable<unknown> {
    return this.http.patch(`${this.api}/${id}/restore`, {});
  }
}

