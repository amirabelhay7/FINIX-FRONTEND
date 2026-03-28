import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { SellerLayout } from './layout/seller/seller';
import { InsurerLayout } from './layout/insurer/insurer';
import { AdminShellComponent } from './layout/admin-shell/admin-shell.component';
import { AgentShell } from './layout/agent-shell/agent-shell';
import { InsurerShell } from './layout/insurer-shell/insurer-shell';
import { AdminClients } from './features/admin/clients/admin-clients';
import { AdminSettings } from './features/admin/settings/admin-settings';
import { AnalyticsDashboardComponent } from './features/admin/analytics/analytics-dashboard/analytics-dashboard.component';
import { roleGuard } from './core/guards/auth-guard';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized';

const routes: Routes = [
  {
    path: 'notifications',
    canActivate: [roleGuard('admin', 'client', 'agent', 'seller', 'insurer')],
    loadChildren: () =>
      import('./features/notifications/notifications-module').then((m) => m.NotificationsModule),
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: 'seller',
    component: SellerLayout,
    canActivate: [roleGuard('seller')],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/seller/seller-module').then((m) => m.SellerModule),
      },
    ],
  },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [roleGuard('admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: BackofficeComponent },
      {
        path: 'marketing',
        loadChildren: () => import('./features/admin/marketing-admin/marketing-admin-module').then((m) => m.MarketingAdminModule),
      },
      {
        path: 'inbox',
        redirectTo: '/notifications',
        pathMatch: 'full',
      },
      { path: 'clients', component: AdminClients },
      {
        path: 'credits',
        loadChildren: () => import('./features/admin/credit-center/credit-center-module').then((m) => m.CreditCenterModule),
      },
      {
        path: 'repayments',
        loadChildren: () => import('./features/admin/repayments-admin/repayments-admin-module').then((m) => m.RepaymentsAdminModule),
      },
      {
        path: 'vehicles',
        loadChildren: () => import('./features/admin/vehicles-admin/vehicles-admin-module').then((m) => m.VehiclesAdminModule),
      },
      {
        path: 'insurance',
        loadChildren: () => import('./features/admin/insurance-desk/insurance-desk-module').then((m) => m.InsuranceDeskModule),
      },
      {
        path: 'risk',
        loadChildren: () => import('./features/admin/scoring-admin/scoring-admin-module').then((m) => m.ScoringAdminModule),
      },
      {
        path: 'rapports',
        loadChildren: () => import('./features/admin/steering-admin/steering-admin-module').then((m) => m.SteeringAdminModule),
      },
      { path: 'settings', component: AdminSettings },
      {
        path: 'users',
        loadChildren: () => import('./features/admin/users/users-module').then((m) => m.UsersModule),
      },
      {
        path: 'wallet',
        loadChildren: () => import('./features/admin/wallet-admin/wallet-admin-module').then((m) => m.WalletAdminModule),
      },
      { path: 'analytics', component: AnalyticsDashboardComponent },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'agent',
    component: AgentShell,
    canActivate: [roleGuard('agent')],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/agent/agent-module').then((m) => m.AgentModule),
      },
    ],
  },
  {
    path: 'insurer',
    component: InsurerShell,
    canActivate: [roleGuard('insurer')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: InsurerLayout },
      { path: 'offers', component: InsurerLayout },
      { path: 'events', component: InsurerLayout },
      { path: 'catalogs', component: InsurerLayout },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
  {
    path: 'client',
    component: Frontoffice,
    canActivate: [roleGuard('client')],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/client/client-module').then((m) => m.ClientModule),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
