import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyLoans } from './my-loans/my-loans';
import { LoanApply } from './loan-apply/loan-apply';
import { LoanDetail } from './loan-detail/loan-detail';
import { ActiveContract } from './active-contract/active-contract';
import { ApplicationStatus } from './application-status/application-status';
import { DownPayment } from './down-payment/down-payment';
import { UploadContract } from './upload-contract/upload-contract';

const routes: Routes = [
  { path: '', redirectTo: 'my-loans', pathMatch: 'full' },
  { path: 'my-loans', component: MyLoans },
  { path: 'apply', component: LoanApply },
  { path: 'application/:id', component: ApplicationStatus },
  { path: 'down-payment/:id', component: DownPayment },
  { path: 'upload-contract/:id', component: UploadContract },
  { path: 'contract/:id', component: LoanDetail },
  { path: 'active', component: ActiveContract }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditRoutingModule { }
