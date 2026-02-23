import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Frontoffice } from './layout/frontoffice/frontoffice';
import { Backoffice } from './layout/backoffice/backoffice';
import { Dashboard } from './features/dashboard/dashboard';
const routes: Routes = [
  {
    path: '',
    component: Frontoffice,
    children: [

    ]
  }, {
    path: 'admin',
    component: Backoffice,
    children: [
      { path: 'dashboard', component: Dashboard }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
