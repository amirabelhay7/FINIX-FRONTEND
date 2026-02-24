import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProfile } from './my-profile/my-profile';
import { Kyc } from './kyc/kyc';
import { LoginHistory } from './login-history/login-history';

const routes: Routes = [
  { path: '', component: MyProfile },
  { path: 'kyc', component: Kyc },
  { path: 'security', component: LoginHistory }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
