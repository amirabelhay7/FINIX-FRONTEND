export interface InsuranceMetric {
  label: string;
  value: string;
  subtitle: string;
}

export interface InsurancePolicy {
  id: string;
  holder: string;
  product: string;
  premium: string;
  status: 'Active' | 'Expired' | 'Pending';
}

export const INSURANCE_METRICS: InsuranceMetric[] = [
  {
    label: 'Active policies',
    value: '1,284',
    subtitle: 'Vehicle & credit-linked',
  },
  {
    label: 'Monthly premium volume',
    value: '$48,920',
    subtitle: 'Net of commissions',
  },
  {
    label: 'Claims ratio (12m)',
    value: '34%',
    subtitle: 'Loss ratio vs written premium',
  },
];

export const INSURANCE_POLICIES: InsurancePolicy[] = [
  {
    id: '#IN-3021',
    holder: 'Nova Agro Co-op',
    product: 'Fleet comprehensive',
    premium: '$420 / month',
    status: 'Active',
  },
  {
    id: '#IN-3017',
    holder: 'Kilimanjaro Motors',
    product: 'Showroom stock cover',
    premium: '$1,240 / month',
    status: 'Active',
  },
  {
    id: '#IN-3008',
    holder: 'Sunrise Kiosk',
    product: 'Credit life micro',
    premium: '$7 / month',
    status: 'Pending',
  },
  {
    id: '#IN-2999',
    holder: 'Orbit Logistics',
    product: 'Single-vehicle cover',
    premium: '$89 / month',
    status: 'Expired',
  },
];

