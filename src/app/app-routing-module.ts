import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { Backoffice } from './layout/backoffice/backoffice';
import { AuthGuard } from './core/auth/auth.guard';
import { GuestGuard } from './core/auth/guest.guard';
import { AdminGuard } from './core/auth/admin.guard';
import { RoleGuard } from './core/auth/role.guard';

/** Front-office: role-specific routes; guards enforce correct role. */
const frontOfficeRoutes: Routes = [
  { path: '', loadChildren: () => import('./features/landing-page/landing-page-module').then(m => m.LandingPageModule) },
  { path: 'auth', loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule), canActivate: [GuestGuard] },
  { path: 'profile', loadChildren: () => import('./features/profile/profile-module').then(m => m.ProfileModule), canActivate: [AuthGuard] },
  { path: 'credit', loadChildren: () => import('./features/credit/credit-module').then(m => m.CreditModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT'] } },
  { path: 'wallet', loadChildren: () => import('./features/wallet/wallet-module').then(m => m.WalletModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT', 'SELLER'] } },
  { path: 'score', loadChildren: () => import('./features/score/score-module').then(m => m.ScoreModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT'] } },
  { path: 'insurance', loadChildren: () => import('./features/insurance/insurance-module').then(m => m.InsuranceModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT'] } },
  { path: 'repayment', loadChildren: () => import('./features/repayment/repayment-module').then(m => m.RepaymentModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT'] } },
  { path: 'vehicles', loadChildren: () => import('./features/vehicles/vehicles-module').then(m => m.VehiclesModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['CLIENT', 'SELLER'] } },
  { path: 'insurer', loadChildren: () => import('./features/insurer/insurer-module').then(m => m.InsurerModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['INSURER'] } },
  { path: 'agent', loadChildren: () => import('./features/agent/agent-module').then(m => m.AgentModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['AGENT'] } },
  { path: 'seller', loadChildren: () => import('./features/seller/seller-module').then(m => m.SellerModule), canActivate: [AuthGuard, RoleGuard], data: { roles: ['SELLER'] } },
];

/** Back-office: admin only. */
const backOfficeRoutes: Routes = [
  { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'users', loadChildren: () => import('./features/admin/users/users-module').then(m => m.UsersModule) },
  { path: 'wallet', loadChildren: () => import('./features/admin/wallet-admin/wallet-admin-module').then(m => m.WalletAdminModule) },
  { path: 'credit', loadChildren: () => import('./features/admin/credit-center/credit-center-module').then(m => m.CreditCenterModule) },
  { path: 'insurance', loadChildren: () => import('./features/admin/insurance-desk/insurance-desk-module').then(m => m.InsuranceDeskModule) },
  { path: 'scoring', loadChildren: () => import('./features/admin/scoring-admin/scoring-admin-module').then(m => m.ScoringAdminModule) },
  { path: 'vehicles', loadChildren: () => import('./features/admin/vehicles-admin/vehicles-admin-module').then(m => m.VehiclesAdminModule) },
  { path: 'repayments', loadChildren: () => import('./features/admin/repayments-admin/repayments-admin-module').then(m => m.RepaymentsAdminModule) },
  { path: 'marketing', loadChildren: () => import('./features/admin/marketing-admin/marketing-admin-module').then(m => m.MarketingAdminModule) },
  { path: 'steering', loadChildren: () => import('./features/admin/steering-admin/steering-admin-module').then(m => m.SteeringAdminModule) },
];

const routes: Routes = [
  {
    path: '',
    component: Frontoffice,
    children: frontOfficeRoutes,
  },
  {
    path: 'admin',
    component: Backoffice,
    canActivate: [AdminGuard],
    children: backOfficeRoutes,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
