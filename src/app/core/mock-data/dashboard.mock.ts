export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

export interface TrafficPoint {
  day: string;
  value: number;
}

export interface OrderRow {
  id: string;
  channel: string;
  customer: string;
  amount: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

export const DASHBOARD_KPIS: DashboardKpi[] = [
  {
    id: 'profit',
    label: 'Total Profit',
    value: '$128,430',
    delta: '+18.4% vs last month',
    trend: 'up',
  },
  {
    id: 'orders',
    label: 'Orders',
    value: '3,248',
    delta: '+6.2% new',
    trend: 'up',
  },
  {
    id: 'income',
    label: 'Daily Income',
    value: '$4,892',
    delta: 'Today · 11:32',
    trend: 'flat',
  },
  {
    id: 'users',
    label: 'Active Users',
    value: '1,204',
    delta: 'Online now',
    trend: 'up',
  },
];

export const DASHBOARD_TRAFFIC: TrafficPoint[] = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 56 },
  { day: 'Wed', value: 64 },
  { day: 'Thu', value: 51 },
  { day: 'Fri', value: 78 },
  { day: 'Sat', value: 39 },
  { day: 'Sun', value: 33 },
];

export const DASHBOARD_ORDERS: OrderRow[] = [
  {
    id: '#FIN-2043',
    channel: 'Marketplace',
    customer: 'Rising Star Motors',
    amount: '$12,840',
    status: 'Completed',
  },
  {
    id: '#FIN-2039',
    channel: 'Mobile App',
    customer: 'Greenline Rentals',
    amount: '$4,120',
    status: 'Pending',
  },
  {
    id: '#FIN-2032',
    channel: 'Agent Network',
    customer: 'Unity SACCO',
    amount: '$22,400',
    status: 'Completed',
  },
  {
    id: '#FIN-2027',
    channel: 'Web Portal',
    customer: 'Nova Fleet',
    amount: '$9,730',
    status: 'Failed',
  },
];

