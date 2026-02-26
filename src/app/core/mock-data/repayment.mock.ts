export interface RepaymentMetric {
  label: string;
  value: string;
  subtitle: string;
}

export interface RepaymentScheduleRow {
  dueDate: string;
  customer: string;
  product: string;
  installment: string;
  status: 'Upcoming' | 'Paid' | 'Overdue';
}

export const REPAYMENT_METRICS: RepaymentMetric[] = [
  {
    label: 'Scheduled this week',
    value: '$32,480',
    subtitle: 'Principal + interest',
  },
  {
    label: 'On-time ratio (90d)',
    value: '91%',
    subtitle: 'Installments paid before due date',
  },
  {
    label: 'Delinquent bucket',
    value: '3.4%',
    subtitle: '30+ days past due',
  },
];

export const REPAYMENT_SCHEDULE: RepaymentScheduleRow[] = [
  {
    dueDate: '2026-02-27',
    customer: 'Nova Agro Co-op',
    product: 'Agri-Seasonal Boost',
    installment: '$840',
    status: 'Upcoming',
  },
  {
    dueDate: '2026-02-26',
    customer: 'Unity SACCO',
    product: 'SME Working Capital',
    installment: '$2,400',
    status: 'Paid',
  },
  {
    dueDate: '2026-02-22',
    customer: 'Sunrise Kiosk',
    product: 'Micro-Merchants Flex',
    installment: '$120',
    status: 'Overdue',
  },
  {
    dueDate: '2026-03-01',
    customer: 'Orbit Logistics',
    product: 'SME Working Capital',
    installment: '$1,980',
    status: 'Upcoming',
  },
];

