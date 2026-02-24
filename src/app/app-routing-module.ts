import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { Backoffice } from './layout/backoffice/backoffice';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { Dashboard } from './features/dashboard/dashboard';
const routes: Routes = [
  {
    path: '',
    component: Frontoffice,
    children: [
      { path: '', loadChildren: () => import('./features/landing-page/landing-page-module').then(m => m.LandingPageModule) },
      { path: 'auth', loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule) },
      { path: 'profile', loadChildren: () => import('./features/profile/profile-module').then(m => m.ProfileModule) },
      { path: 'credit', loadChildren: () => import('./features/credit/credit-module').then(m => m.CreditModule) },
      { path: 'wallet', loadChildren: () => import('./features/wallet/wallet-module').then(m => m.WalletModule) },
      { path: 'score', loadChildren: () => import('./features/score/score-module').then(m => m.ScoreModule) },
      { path: 'insurance', loadChildren: () => import('./features/insurance/insurance-module').then(m => m.InsuranceModule) },
      { path: 'repayment', loadChildren: () => import('./features/repayment/repayment-module').then(m => m.RepaymentModule) },
      { path: 'vehicles', loadChildren: () => import('./features/vehicles/vehicles-module').then(m => m.VehiclesModule) }
    ]
  }, {
    path: 'agent',
    component: AgentLayout,
    children: [
      { path: '', loadChildren: () => import('./features/agent/agent-module').then(m => m.AgentModule) }
    ]
  }, {
    path: 'seller',
    component: SellerLayout,
    children: [
      { path: '', loadChildren: () => import('./features/seller/seller-module').then(m => m.SellerModule) }
    ]
  }, {
    path: 'admin',
    component: Backoffice,
    children: [
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'users', loadChildren: () => import('./features/admin/users/users-module').then(m => m.UsersModule) },
      { path: 'wallet', loadChildren: () => import('./features/admin/wallet-admin/wallet-admin-module').then(m => m.WalletAdminModule) },
      { path: 'credit', loadChildren: () => import('./features/admin/credit-center/credit-center-module').then(m => m.CreditCenterModule) },
      { path: 'insurance', loadChildren: () => import('./features/admin/insurance-desk/insurance-desk-module').then(m => m.InsuranceDeskModule) },
      { path: 'scoring', loadChildren: () => import('./features/admin/scoring-admin/scoring-admin-module').then(m => m.ScoringAdminModule) },
      { path: 'vehicles', loadChildren: () => import('./features/admin/vehicles-admin/vehicles-admin-module').then(m => m.VehiclesAdminModule) },
      { path: 'repayments', loadChildren: () => import('./features/admin/repayments-admin/repayments-admin-module').then(m => m.RepaymentsAdminModule) },
      { path: 'marketing', loadChildren: () => import('./features/admin/marketing-admin/marketing-admin-module').then(m => m.MarketingAdminModule) },
      { path: 'steering', loadChildren: () => import('./features/admin/steering-admin/steering-admin-module').then(m => m.SteeringAdminModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
