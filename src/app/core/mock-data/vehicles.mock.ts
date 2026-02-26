export interface VehicleMetric {
  label: string;
  value: string;
  subtitle: string;
}

export interface VehicleItem {
  plate: string;
  model: string;
  owner: string;
  status: 'Active' | 'In workshop' | 'Idle';
}

export const VEHICLE_METRICS: VehicleMetric[] = [
  {
    label: 'Collateral vehicles',
    value: '192',
    subtitle: 'Registered and secured',
  },
  {
    label: 'On-road utilisation',
    value: '86%',
    subtitle: 'Tracked via telematics',
  },
  {
    label: 'Average asset age',
    value: '4.1 yrs',
    subtitle: 'Weighted across entire pool',
  },
];

export const VEHICLE_ITEMS: VehicleItem[] = [
  {
    plate: 'KDA-421C',
    model: 'Toyota Hilux 2.8D 4x4',
    owner: 'Nova Agro Co-op',
    status: 'Active',
  },
  {
    plate: 'KDH-883L',
    model: 'Isuzu NQR 33-Seater',
    owner: 'Cityline Transport',
    status: 'In workshop',
  },
  {
    plate: 'KCF-220B',
    model: 'Nissan Navara XE',
    owner: 'Orbit Logistics',
    status: 'Active',
  },
  {
    plate: 'KBX-991P',
    model: 'Toyota Probox',
    owner: 'Sunrise Kiosk',
    status: 'Idle',
  },
];

