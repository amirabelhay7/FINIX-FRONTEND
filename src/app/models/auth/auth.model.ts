/**
 * Auth (backend module) – API contract models.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: number;
  dateOfBirth?: string;
  cin?: number;
  address?: string;
  city?: string;
  role: 'CLIENT' | 'SELLER';
  localisation?: string;
  commercialRegister?: string;
}

export interface DemoAccount {
  email: string;
  password: string;
  label: string;
  role: string;
}

export interface LoginRoleBadge {
  icon: string;
  label: string;
}
