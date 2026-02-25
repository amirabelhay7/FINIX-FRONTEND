import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InsurerDashboard } from './insurer-dashboard/insurer-dashboard';

const routes: Routes = [
  { path: '', component: InsurerDashboard }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsurerRoutingModule { }
