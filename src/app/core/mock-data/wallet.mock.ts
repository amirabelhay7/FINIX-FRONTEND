export interface WalletMetric {
  label: string;
  value: string;
  subtitle: string;
}

export interface WalletTransaction {
  id: string;
  type: 'Deposit' | 'Repayment' | 'Payout';
  counterparty: string;
  amount: string;
  status: 'Completed' | 'Pending';
}

export const WALLET_METRICS: WalletMetric[] = [
  {
    label: 'Available balance',
    value: '$184,320',
    subtitle: 'Settled and ready to deploy',
  },
  {
    label: 'Locked for collateral',
    value: '$42,900',
    subtitle: 'Tagged against vehicle assets',
  },
  {
    label: 'Net inflow (24h)',
    value: '+$12,640',
    subtitle: 'Deposits minus withdrawals',
  },
];

export const WALLET_TRANSACTIONS: WalletTransaction[] = [
  {
    id: '#WL-8821',
    type: 'Deposit',
    counterparty: 'Kilimanjaro Motors',
    amount: '$5,000',
    status: 'Completed',
  },
  {
    id: '#WL-8817',
    type: 'Repayment',
    counterparty: 'Nova Agro Co-op',
    amount: '$420',
    status: 'Completed',
  },
  {
    id: '#WL-8813',
    type: 'Payout',
    counterparty: 'ShieldSure Insurance',
    amount: '$2,150',
    status: 'Pending',
  },
  {
    id: '#WL-8809',
    type: 'Deposit',
    counterparty: 'Unity SACCO',
    amount: '$9,070',
    status: 'Completed',
  },
];

