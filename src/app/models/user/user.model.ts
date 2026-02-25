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
