import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../core/config/api-url';
import { AuthService } from '../auth/auth.service';
import { VehiclePreferencesPayload } from '../../models';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  profileImageUrl?: string;
  occupation?: string;
  monthlyIncome?: number;
  companyName?: string;
  taxNumber?: string;
  licenseNumber?: string;
  preferredLanguage?: string;
  notificationsEnabled?: boolean;
  // Vehicle recommendation preferences
  budgetMax?: number | null;
  preferredVehicleType?: string | null;
  preferredBrands?: string | null;
  vehicleUsage?: string | null;
}

export interface UpdateUserProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  birthDate?: string;
  occupation?: string;
  monthlyIncome?: number;
  companyName?: string;
  taxNumber?: string;
  licenseNumber?: string;
  preferredLanguage?: string;
  notificationsEnabled?: boolean;
}

export interface UserDocument {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = apiUrl('/api/users');

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthService,
  ) {}

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API_URL}/me`);
  }

  updateMyProfile(data: UpdateUserProfilePayload): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API_URL}/me`, data);
  }

  uploadProfileImage(file: File): Observable<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ profileImageUrl: string }>(`${this.API_URL}/me/image`, formData);
  }

  getMyDocuments(): Observable<UserDocument[]> {
    return this.http.get<UserDocument[]>(`${this.API_URL}/me/documents`);
  }

  uploadDocument(file: File, documentType: string): Observable<UserDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    return this.http.post<UserDocument>(`${this.API_URL}/me/documents`, formData);
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/me/documents/${documentId}`);
  }

  changePassword(data: ChangePasswordPayload): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/me/password`, data);
  }

  updateVehiclePreferences(data: VehiclePreferencesPayload): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.API_URL}/me/vehicle-preferences`, data);
  }

  getCurrentUserId(): number | null {
    return this.auth.getUserId();
  }
}
