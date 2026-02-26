import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DemoAccount } from '../../../models';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * ViewModel: login (MVVM). Wired to AuthService for real login; demo accounts for quick testing.
 */
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  loading = false;
  errorMessage = '';
  sessionExpiredMessage = '';

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
  readonly demoSectionLabel = 'Demo — quick login by role';
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

  /** Icons for demo login cards by role. */
  readonly demoRoleIcon: Record<string, string> = {
    CLIENT: 'person',
    AGENT: 'support_agent',
    SELLER: 'storefront',
    INSURER: 'shield',
    ADMIN: 'admin_panel_settings',
  };

  /** Demo accounts for quick login (colleagues/students). */
  readonly demoAccounts: DemoAccount[] = [
    { email: 'client@demo.finix.tn', password: 'Demo123!', label: 'Client', role: 'CLIENT' },
    { email: 'agent@demo.finix.tn', password: 'Demo123!', label: 'Agent', role: 'AGENT' },
    { email: 'seller@demo.finix.tn', password: 'Demo123!', label: 'Seller', role: 'SELLER' },
    { email: 'insurer@demo.finix.tn', password: 'Demo123!', label: 'Insurer', role: 'INSURER' },
    { email: 'admin@demo.finix.tn', password: 'Demo123!', label: 'Admin', role: 'ADMIN' },
  ];

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['sessionExpired'] === '1') {
        this.sessionExpiredMessage = 'Your session expired. Please sign in again.';
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  setDemoAccount(account: DemoAccount): void {
    this.email = account.email;
    this.password = account.password;
    this.errorMessage = '';
  }

  /** Log in with a demo account (uses credentials directly to avoid form timing issues). */
  loginWithDemo(account: DemoAccount): void {
    this.errorMessage = '';
    this.loading = true;
    this.auth.login({ email: account.email, password: account.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (this.auth.isAuthenticated()) {
          this.auth.redirectByRole(res.role);
        } else {
          this.errorMessage = 'Login succeeded but session was not stored. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.error || 'Invalid email or password.';
        this.errorMessage = err?.status === 401
          ? msg + ' Demo accounts use password: Demo123!'
          : msg;
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (this.auth.isAuthenticated()) {
          this.auth.redirectByRole(res.role);
        } else {
          this.errorMessage = 'Login succeeded but session was not stored. Please try again.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Invalid email or password.';
      },
    });
  }
}
