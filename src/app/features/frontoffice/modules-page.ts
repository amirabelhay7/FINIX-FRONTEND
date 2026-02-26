import { Component } from '@angular/core';

export interface ModuleCard {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-modules-page',
  standalone: false,
  templateUrl: './modules-page.html',
  styleUrl: './modules-page.scss',
})
export class ModulesPage {
  protected readonly modules: ModuleCard[] = [
    {
      slug: 'credit',
      title: 'Credit',
      description: 'Originate and manage credit products with configurable limits and terms.',
      icon: 'monetization_on',
      color: 'bg-blue-50 text-[#135bec]',
    },
    {
      slug: 'scoring',
      title: 'Scoring',
      description: 'Risk scoring and behavioural analysis for smarter decisions.',
      icon: 'analytics',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      slug: 'wallet',
      title: 'Wallet',
      description: 'Digital wallets and ledger for deposits, repayments and payouts.',
      icon: 'account_balance_wallet',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      slug: 'insurance',
      title: 'Insurance',
      description: 'Policies, premiums and claims in one place.',
      icon: 'verified_user',
      color: 'bg-violet-50 text-violet-600',
    },
    {
      slug: 'repayment',
      title: 'Repayment',
      description: 'Schedules, reminders and collection workflows.',
      icon: 'payments',
      color: 'bg-rose-50 text-rose-600',
    },
    {
      slug: 'vehicles',
      title: 'Vehicles',
      description: 'Collateral and fleet management for secured lending.',
      icon: 'directions_car',
      color: 'bg-sky-50 text-sky-600',
    },
  ];
}
