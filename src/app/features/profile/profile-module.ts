import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing-module';
import { MyProfile } from './my-profile/my-profile';
import { Kyc } from './kyc/kyc';
import { LoginHistory } from './login-history/login-history';


@NgModule({
  declarations: [
    MyProfile,
    Kyc,
    LoginHistory
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }
