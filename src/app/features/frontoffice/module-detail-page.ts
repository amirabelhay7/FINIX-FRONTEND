import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ModuleDetailConfig {
  slug: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  cards: { label: string; value: string }[];
  tableHeaders: string[];
  tableRows: string[][];
}

const MODULE_CONFIGS: Record<string, Omit<ModuleDetailConfig, 'slug'>> = {
  credit: {
    title: 'Credit',
    description: 'Manage credit products, limits and interest rates. Originate and monitor credit lines across segments.',
    icon: 'monetization_on',
    iconColor: 'bg-blue-50 text-[#135bec]',
    cards: [
      { label: 'Active products', value: '12' },
      { label: 'Total exposure', value: '$6.2M' },
      { label: 'Approval rate (30d)', value: '78%' },
    ],
    tableHeaders: ['Product', 'APR', 'Max limit', 'Status'],
    tableRows: [
      ['Micro-Merchants Flex', '18.5%', '$3,500', 'Active'],
      ['SME Working Capital', '16.0%', '$25,000', 'Active'],
      ['Agri-Seasonal Boost', '14.9%', '$8,000', 'Active'],
    ],
  },
  scoring: {
    title: 'Scoring',
    description: 'Risk and behavioural scoring to approve with confidence. Track factors and score history.',
    icon: 'analytics',
    iconColor: 'bg-emerald-50 text-emerald-600',
    cards: [
      { label: 'Avg portfolio score', value: '718' },
      { label: 'High-risk segment', value: '12%' },
      { label: 'Auto-approval rate', value: '64%' },
    ],
    tableHeaders: ['Factor', 'Impact', 'Direction'],
    tableRows: [
      ['Repayment consistency', 'High', 'Positive'],
      ['Wallet balance volatility', 'Medium', 'Negative'],
      ['Document completeness', 'Low', 'Positive'],
    ],
  },
  wallet: {
    title: 'Wallet',
    description: 'Digital wallets and ledger. Track balances, locked collateral and recent transactions.',
    icon: 'account_balance_wallet',
    iconColor: 'bg-amber-50 text-amber-600',
    cards: [
      { label: 'Available balance', value: '$184,320' },
      { label: 'Locked collateral', value: '$42,900' },
      { label: 'Net inflow (24h)', value: '+$12,640' },
    ],
    tableHeaders: ['Reference', 'Type', 'Amount', 'Status'],
    tableRows: [
      ['#WL-8821', 'Deposit', '$5,000', 'Completed'],
      ['#WL-8817', 'Repayment', '$420', 'Completed'],
      ['#WL-8813', 'Payout', '$2,150', 'Pending'],
    ],
  },
  insurance: {
    title: 'Insurance',
    description: 'Policies, premiums and claims. Monitor active policies and portfolio health.',
    icon: 'verified_user',
    iconColor: 'bg-violet-50 text-violet-600',
    cards: [
      { label: 'Active policies', value: '1,284' },
      { label: 'Monthly premium', value: '$48,920' },
      { label: 'Claims ratio (12m)', value: '34%' },
    ],
    tableHeaders: ['Policy', 'Holder', 'Premium', 'Status'],
    tableRows: [
      ['#IN-3021', 'Nova Agro Co-op', '$420/mo', 'Active'],
      ['#IN-3017', 'Kilimanjaro Motors', '$1,240/mo', 'Active'],
      ['#IN-3008', 'Sunrise Kiosk', '$7/mo', 'Pending'],
    ],
  },
  repayment: {
    title: 'Repayment',
    description: 'Schedules, reminders and collection. View upcoming installments and delinquency.',
    icon: 'payments',
    iconColor: 'bg-rose-50 text-rose-600',
    cards: [
      { label: 'Scheduled this week', value: '$32,480' },
      { label: 'On-time ratio (90d)', value: '91%' },
      { label: 'Delinquent bucket', value: '3.4%' },
    ],
    tableHeaders: ['Due date', 'Customer', 'Installment', 'Status'],
    tableRows: [
      ['2026-02-27', 'Nova Agro Co-op', '$840', 'Upcoming'],
      ['2026-02-26', 'Unity SACCO', '$2,400', 'Paid'],
      ['2026-02-22', 'Sunrise Kiosk', '$120', 'Overdue'],
    ],
  },
  vehicles: {
    title: 'Vehicles',
    description: 'Collateral and fleet management. Track vehicles used as security for lending.',
    icon: 'directions_car',
    iconColor: 'bg-sky-50 text-sky-600',
    cards: [
      { label: 'Collateral vehicles', value: '192' },
      { label: 'On-road utilisation', value: '86%' },
      { label: 'Avg asset age', value: '4.1 yrs' },
    ],
    tableHeaders: ['Plate', 'Model', 'Owner', 'Status'],
    tableRows: [
      ['KDA-421C', 'Toyota Hilux 2.8D', 'Nova Agro Co-op', 'Active'],
      ['KDH-883L', 'Isuzu NQR 33-Seater', 'Cityline Transport', 'In workshop'],
      ['KCF-220B', 'Nissan Navara XE', 'Orbit Logistics', 'Active'],
    ],
  },
};

@Component({
  selector: 'app-module-detail-page',
  standalone: false,
  templateUrl: './module-detail-page.html',
  styleUrl: './module-detail-page.scss',
})
export class ModuleDetailPage {
  protected readonly config$;

  constructor(private route: ActivatedRoute) {
    this.config$ = combineLatest([
      this.route.data,
      this.route.paramMap,
    ]).pipe(
      map(([data, params]) => (data['slug'] as string) ?? params.get('slug') ?? ''),
      map((slug) => {
        const base = MODULE_CONFIGS[slug];
        if (!base) return null;
        return { ...base, slug } as ModuleDetailConfig;
      }),
    );
  }
}
