export interface CreditMetric {
  label: string;
  value: string;
  subtitle: string;
}

export interface CreditProduct {
  name: string;
  apr: string;
  maxLimit: string;
  term: string;
}

export interface CreditRequest {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export const CREDIT_METRICS: CreditMetric[] = [
  {
    label: 'Total Credit Exposure',
    value: '$6.2M',
    subtitle: 'Across all active portfolios',
  },
  {
    label: 'Average Limit Utilisation',
    value: '63%',
    subtitle: 'Weighted across open lines',
  },
  {
    label: 'Approval Rate (30d)',
    value: '78%',
    subtitle: 'Micro & SME combined',
  },
];

export const CREDIT_PRODUCTS: CreditProduct[] = [
  {
    name: 'Micro-Merchants Flex',
    apr: '18.5%',
    maxLimit: '$3,500',
    term: '6–12 months',
  },
  {
    name: 'SME Working Capital',
    apr: '16.0%',
    maxLimit: '$25,000',
    term: '12–24 months',
  },
  {
    name: 'Agri-Seasonal Boost',
    apr: '14.9%',
    maxLimit: '$8,000',
    term: '3–9 months',
  },
];

export const CREDIT_REQUESTS: CreditRequest[] = [
  {
    id: '#CR-4210',
    customer: 'Nova Agro Co-op',
    product: 'Agri-Seasonal Boost',
    amount: '$4,800',
    status: 'Approved',
  },
  {
    id: '#CR-4202',
    customer: 'Cityline Retailers',
    product: 'SME Working Capital',
    amount: '$18,000',
    status: 'Pending',
  },
  {
    id: '#CR-4194',
    customer: 'Sunrise Kiosk',
    product: 'Micro-Merchants Flex',
    amount: '$1,200',
    status: 'Approved',
  },
  {
    id: '#CR-4189',
    customer: 'Orbital Logistics',
    product: 'SME Working Capital',
    amount: '$22,000',
    status: 'Rejected',
  },
];

