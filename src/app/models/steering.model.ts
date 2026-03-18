// src/app/models/steering.model.ts

export interface FinancialIndicator {
  id?: number;
  name: string;
  referenceIndicator: string;
  value: number;
  warningThreshold: number;
  criticalThreshold: number;
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  createdAt?: string;
}

export interface TreasuryAccount {
  id?: number;
  name: string;
  type: 'MAIN' | 'RESERVE' | 'PROVISION';
  initialBalance: number;
  currentBalance: number;
  currency: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

export interface CashMovement {
  id?: number;
  treasuryAccountId: number;
  movementDirection: 'INFLOW' | 'OUTFLOW';
  description: string;
  amount: number;
  movementDate?: string;
  createdAt?: string;
}

export interface FundingSimulation {
  id?: number;
  projectedAmount: number;
  averageDefaultRate: number;
  estimatedProvisionNeeded: number;
  decision?: 'ACCEPTED' | 'REJECTED';
  simulatedAt?: string;
}




