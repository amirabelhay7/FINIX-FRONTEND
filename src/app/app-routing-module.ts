import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackofficeComponent } from './layout/backoffice/backoffice.component';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { AgentLayout } from './layout/agent/agent';
import { SellerLayout } from './layout/seller/seller';
import { InsurerLayout } from './layout/insurer/insurer';
import { roleGuard } from './core/guards/auth-guard';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized';

const routes: Routes = [
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
  { path: 'vendeur', redirectTo: 'seller', pathMatch: 'full' },
  { path: 'vendeur/vendeur', redirectTo: 'seller', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth-module').then((m) => m.AuthModule),
  },
  {
    path: 'backoffice',
    component: BackofficeComponent,
    canActivate: [roleGuard('admin')],
  },
  {
    path: 'agent',
    component: AgentLayout,
    canActivate: [roleGuard('agent')],
  },
  {
    path: 'insurer',
    component: InsurerLayout,
    canActivate: [roleGuard('insurer')],
  },
  {
    path: 'client',
    component: Frontoffice,
    canActivate: [roleGuard('client')],
    loadChildren: () => import('./features/client/client-module').then((m) => m.ClientModule),
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Re-run routed components when clicking the same nav link (avoids stuck "Loading…" after cancelled first fetch).
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
