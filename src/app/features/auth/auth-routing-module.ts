import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
