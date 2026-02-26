import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Scoring } from './scoring';

const routes: Routes = [{ path: '', component: Scoring }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScoringRoutingModule {}

