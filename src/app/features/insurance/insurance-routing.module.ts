import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Insurance } from './insurance';

const routes: Routes = [{ path: '', component: Insurance }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InsuranceRoutingModule {}

