import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './auth-routing-module';
import { LoginComponent } from './login/login.component';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { OtpInputComponent } from '../../shared/components/otp-input/otp-input.component';

@NgModule({
  declarations: [
    LoginComponent,
    Register,
    ForgotPassword,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AuthRoutingModule,
    OtpInputComponent,
  ],
})
export class AuthModule { }
