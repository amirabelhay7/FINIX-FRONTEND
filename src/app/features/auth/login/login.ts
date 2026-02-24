import { Component } from '@angular/core';
import { Router } from '@angular/router';

/** Role badge for quick switch. */
export interface LoginRoleBadge {
  icon: string;
  label: string;
}

/**
 * ViewModel: login (MVVM).
 */
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  selectedPortalRole = '';

  readonly welcomeLabel = 'Welcome Back';
  readonly signInTitle = 'Sign in to your';
  readonly signInTitleBreak = 'account';
  readonly noAccountLabel = "Don't have an account?";
  readonly registerLinkLabel = 'Register here';
  readonly registerRoute = '/auth/register';
  readonly emailLabel = 'Email Address';
  readonly emailPlaceholder = 'you@example.com';
  readonly passwordLabel = 'Password';
  readonly forgotPasswordLabel = 'Forgot Password?';
  readonly forgotPasswordRoute = '/auth/forgot-password';
  readonly passwordPlaceholder = '••••••••••';
  readonly rememberLabel = 'Keep me signed in for 30 days';
  readonly submitLabel = 'Sign In';
  readonly orContinueLabel = 'or continue with';
  readonly brandName = 'FINIX';
  readonly heroBadge = 'Micro-Finance Ecosystem';
  readonly heroTitle = 'Your financial ';
  readonly heroTitleHighlight = 'future starts';
  readonly heroTitleEnd = 'here.';
  readonly heroSubtitle = 'Access credit, insurance, and your digital wallet — all in one secure platform.';
  readonly statUsers = '4,800+';
  readonly statUsersLabel = 'Active Users';
  readonly statCapital = '$14.5M';
  readonly statCapitalLabel = 'Deployed Capital';
  readonly statModules = '11';
  readonly statModulesLabel = 'Live Modules';
  readonly scoreCardLabel = 'Your Credit Score';
  readonly scoreValue = '718';
  readonly scoreMax = '850';
  readonly tierLabel = 'Gold Tier — Excellent Standing';

  readonly roleBadges: LoginRoleBadge[] = [
    { icon: 'person', label: 'Client' },
    { icon: 'support_agent', label: 'Agent' },
    { icon: 'storefront', label: 'Seller' },
    { icon: 'shield', label: 'Insurer' },
  ];

  constructor(private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  selectPortalRole(role: string): void {
    this.selectedPortalRole = role;
  }

  onSubmit(): void {
    console.log('Login submitted', { email: this.email });
  }
}
