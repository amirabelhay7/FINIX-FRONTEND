/**
 * User (backend module) – admin list types.
 */
export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: string;
  roleClass: string;
  cin: string;
  city: string;
  viewRoute: string;
  editRoute: string;
  /** ISO-8601 when soft-deleted; undefined for active users. */
  deletedAt?: string;
}

/** API response: user from backend (no password). */
export interface AdminUserApi {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: number;
  dateOfBirth?: string;
  cin?: number;
  address?: string;
  city?: string;
  role: string;
  localisation?: string;
  commercialRegister?: string;
  /** ISO-8601 when soft-deleted; null for active users. */
  deletedAt?: string | null;
}

/** API request: admin create user. */
export interface AdminCreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: number;
  dateOfBirth?: string;
  cin?: number;
  address?: string;
  city?: string;
  role: string;
  localisation?: string;
  commercialRegister?: string;
}

export interface LoanRequestAdmin {
  id: number;
  clientName: string;
  amount: string;
  status: string;
  statusClass: string;
  requested: string;
}

export interface ContractListItem {
  contractNumber: string;
  clientName: string;
  principal: string;
  status: string;
  statusClass: string;
}
