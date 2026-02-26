import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Credit } from './credit';

const routes: Routes = [{ path: '', component: Credit }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreditRoutingModule {}

