import { Component, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

interface RoleConfig {
  label: string;
  color: string;
  colorRgb: string;
  gradStart: string;
  gradEnd: string;
  tagTxt: string;
  iconBg: string;
  iconShadow: string;
  icon: string;
  h1: string;
  desc: string;
  features: string[];
  ctaTxt: string;
  sucTitle: string;
  sucSub: string;
  f1: string;
  f2: string;
  f3: string;
  cta: string;
}

interface DemoAccount {
  role: string; // lower-case (client/admin/agent/...)
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent {
  currentView: 'role-select' | 'login' | 'otp' | 'success' = 'login';
  currentRole: string | null = null;
  email = '';
  password = '';
  rememberMe = false;
  decisionNote = '';

  emailError = false;
  pwError = false;
  alertVisible = false;
  alertType: 'err' | 'ok' = 'err';
  alertText = '';

  loginLoading = false;
  otpLoading = false;

  otpDigits: string[] = ['', '', '', '', '', ''];
  otpCountdown = '01:30';
  otpResendDisabled = true;
  private otpTimer: any = null;

  // Demo buttons use seeded DB users (created by backend on startup).
  private readonly DEMO_PASSWORD = 'Demo123!';
  private readonly demoAccounts: DemoAccount[] = [
    { role: 'client', email: 'client@demo.finix.tn', password: this.DEMO_PASSWORD },
    { role: 'agent', email: 'agent@demo.finix.tn', password: this.DEMO_PASSWORD },
    { role: 'seller', email: 'seller@demo.finix.tn', password: this.DEMO_PASSWORD },
    { role: 'insurer', email: 'insurer@demo.finix.tn', password: this.DEMO_PASSWORD },
    { role: 'admin', email: 'admin@demo.finix.tn', password: this.DEMO_PASSWORD },
  ];

  private getDemoAccount(role: string): DemoAccount | undefined {
    return this.demoAccounts.find((a) => a.role === role.toLowerCase());
  }


  private readonly DEFAULT_CFG: RoleConfig = {
    label: "FIN'IX Pro",
    color: '#1F6FEA',
    colorRgb: '31,111,234',
    gradStart: '#EAF2FF',
    gradEnd: '#5B8DEF',
    tagTxt: 'FINX Pro Workspace',
    iconBg: 'rgba(31,111,234,.18)',
    iconShadow: 'rgba(31,111,234,.28)',
    icon: `<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#EAF2FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M7 6V4h10v2"/><path d="M12 11v4"/><path d="M12 15h.01"/></svg>`,
    h1: "Your credits,\nyour insurance,\nall in one.",
    desc: 'Access your workspace and manage credits, repayments, insurance, and financial tracking.',
    features: ['Secure login', 'Credit & repayment management', 'Insurance & vehicle', 'Score & tracking'],
    ctaTxt: 'Continue',
    sucTitle: 'Login successful!',
    sucSub: 'Your professional workspace is ready.',
    f1: 'Dashboard',
    f2: 'Assigned files',
    f3: 'Real-time notifications',
    cta: 'Access my workspace',
  };

  ROLES: Record<string, RoleConfig> = {
    agent: {
      label: 'IMF Agent',
      color: '#1F6FEA',
      colorRgb: '31,111,234',
      gradStart: '#EAF2FF',
      gradEnd: '#5B8DEF',
      tagTxt: 'IMF Agent Workspace',
      iconBg: 'rgba(31,111,234,.18)',
      iconShadow: 'rgba(31,111,234,.28)',
      icon: `<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#EAF2FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      h1: 'Manage your\nfiles\n& clients.',
      desc: 'Handle credit requests, track repayments, and support your clients at every step.',
      features: ['Client files', 'Credit requests', 'Repayment tracking', 'Automated follow-ups'],
      ctaTxt: "Continue as IMF Agent",
      sucTitle: 'Welcome, IMF Agent!',
      sucSub: 'Your workspace is ready. Review your assigned files.',
      f1: 'Agent dashboard',
      f2: 'Client file management',
      f3: 'Ongoing credit tracking',
      cta: 'Access the Agent workspace',
    },
    insurer: {
      label: 'Insurer',
      color: '#2ECC71',
      colorRgb: '46,204,113',
      gradStart: '#F0FDF4',
      gradEnd: '#2ECC71',
      tagTxt: 'Insurer Workspace',
      iconBg: 'rgba(46,204,113,.18)',
      iconShadow: 'rgba(46,204,113,.25)',
      icon: `<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#F0FDF4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      h1: "Manage your\ncontracts\nand insurance.",
      desc: 'Create and track insurance policies, handle claims, and manage your clients renewals.',
      features: ['Active policies', 'Claims', 'Renewals', 'Reports'],
      ctaTxt: 'Continue as Insurer',
      sucTitle: 'Welcome, Insurer!',
      sucSub: 'Your workspace is ready. Review your contracts and policies.',
      f1: 'Insurer dashboard',
      f2: 'Active contract management',
      f3: 'Claims handling',
      cta: 'Access the Insurer workspace',
    },
    admin: {
      label: 'IMF Admin',
      color: '#F5A623',
      colorRgb: '245,166,35',
      gradStart: '#FFFBEB',
      gradEnd: '#F5A623',
      tagTxt: 'IMF Admin Console',
      iconBg: 'rgba(245,166,35,.18)',
      iconShadow: 'rgba(245,166,35,.25)',
      icon: `<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#FFFBEB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      h1: "Administer\nFIN'IX.",
      desc: 'Create accounts, assign roles, configure the system, and review activity reports.',
      features: ['User management', 'Roles & access', 'Settings', 'Reports'],
      ctaTxt: 'Continue as Admin',
      sucTitle: 'Welcome, Admin!',
      sucSub: 'Admin console is ready. Manage users and settings.',
      f1: 'Admin console',
      f2: 'User management & roles',
      f3: 'Reports & configuration',
      cta: 'Access the Admin console',
    },
    
  };

  get cfg(): RoleConfig | null {
    return this.currentRole ? this.ROLES[this.currentRole] : this.DEFAULT_CFG;
  }
  get leftTagTxt(): string {
    return this.cfg?.tagTxt ?? 'FINX Pro Workspace';
  }
  get leftTagDotColor(): string {
    return this.cfg?.color ?? 'rgba(91,141,239,.5)';
  }
  get leftTagBg(): string {
    return this.cfg ? `rgba(${this.cfg.colorRgb},.12)` : 'rgba(255,255,255,.06)';
  }
  get leftTagBorder(): string {
    return this.cfg ? `rgba(${this.cfg.colorRgb},.22)` : 'rgba(255,255,255,.1)';
  }
  get leftTagColor(): string {
    return this.cfg?.color ?? 'rgba(255,255,255,.5)';
  }
  get iconWrapBg(): string {
    return this.cfg?.iconBg ?? 'rgba(91,141,239,.15)';
  }
  get iconWrapShadow(): string {
    return this.cfg ? `0 16px 48px ${this.cfg.iconShadow}` : '0 16px 48px rgba(91,141,239,.2)';
  }
  get leftIcon(): string {
    return (
      this.cfg?.icon ??
      `<svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
    );
  }
  get h1Lines(): string[] {
    return (this.cfg?.h1 ?? "Your workspace\nFIN'IX Pro.").split('\n');
  }
  get h1Top(): string {
    const l = [...this.h1Lines];
    l.pop();
    return l.join('<br>');
  }
  get h1Grad(): string {
    return this.h1Lines[this.h1Lines.length - 1];
  }
  get gradStyle(): string {
    return this.cfg
      ? `linear-gradient(120deg, ${this.cfg.gradStart}, ${this.cfg.gradEnd})`
      : 'linear-gradient(120deg, #EAF2FF, #5B8DEF)';
  }
  get leftDesc(): string {
    return (
      this.cfg?.desc ??
      'An internal management platform for authorized collaborators. Every access is logged and secured.'
    );
  }
  get leftFeatures(): string[] {
    return this.cfg?.features ?? [];
  }
  get orb1Bg(): string {
    return this.cfg
      ? `radial-gradient(circle, rgba(${this.cfg.colorRgb},.28) 0%, transparent 70%)`
      : 'radial-gradient(circle, rgba(91,141,239,.15) 0%, transparent 70%)';
  }
  get orb2Bg(): string {
    return this.cfg
      ? `radial-gradient(circle, rgba(${this.cfg.colorRgb},.16) 0%, transparent 70%)`
      : 'radial-gradient(circle, rgba(91,141,239,.1) 0%, transparent 70%)';
  }
  get logoMarkBg(): string {
    return this.cfg?.color ?? '#1F6FEA';
  }
  get logoMarkShadow(): string {
    return this.cfg
      ? `0 0 0 5px rgba(${this.cfg.colorRgb},.18), 0 8px 22px rgba(${this.cfg.colorRgb},.35)`
      : '0 0 0 5px rgba(31,111,234,.18), 0 8px 22px rgba(31,111,234,.35)';
  }
  get ctaReady(): boolean {
    return this.currentRole !== null;
  }
  get ctaTxt(): string {
    return this.cfg?.ctaTxt ?? 'Choose a profile';
  }
  get ctaBg(): string {
    return this.cfg?.color ?? '#0B1C2D';
  }
  get ctaShadow(): string {
    return this.cfg ? `0 4px 18px rgba(${this.cfg.colorRgb},.38)` : '0 4px 18px rgba(11,28,45,.2)';
  }
  get chipBg(): string {
    return this.cfg ? `rgba(${this.cfg.colorRgb},.1)` : 'rgba(31,111,234,.1)';
  }
  get chipColor(): string {
    return this.cfg?.color ?? '#1F6FEA';
  }
  get chipLabel(): string {
    return this.cfg?.label ?? 'Role';
  }
  get subBtnBg(): string {
    return this.cfg?.color ?? '#1F6FEA';
  }
  get subBtnShadow(): string {
    return this.cfg
      ? `0 4px 18px rgba(${this.cfg.colorRgb},.35)`
      : '0 4px 18px rgba(31,111,234,.35)';
  }
  get sucTitle(): string {
    return this.cfg?.sucTitle ?? 'Login successful!';
  }
  get sucSub(): string {
    return this.cfg?.sucSub ?? 'Your professional workspace is ready.';
  }
  get sucF1(): string {
    return this.cfg?.f1 ?? 'Dashboard';
  }
  get sucF2(): string {
    return this.cfg?.f2 ?? 'Assigned files';
  }
  get sucF3(): string {
    return this.cfg?.f3 ?? 'Real-time notifications';
  }
  get sucCta(): string {
    return this.cfg?.cta ?? 'Access my workspace';
  }
  get sucDotColor(): string {
    return this.cfg?.color ?? '#1F6FEA';
  }

  pwVisible = false;
  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  selectRole(role: string): void {
    this.currentRole = role;
  }

  quickLogin(role: string): void {
    this.selectRole(role);
    setTimeout(() => this.goToLogin(), 150);
  }

  goToLogin(): void {
    if (!this.currentRole) return;
    this.currentView = 'login';
  }
  goBack(): void {
    // In unified auth flow we don't show role selection again.
    this.currentView = 'login';
    this.clearErrors();
  }
  togglePw(): void {
    this.pwVisible = !this.pwVisible;
  }
  clearErrors(): void {
    this.emailError = false;
    this.pwError = false;
    this.alertVisible = false;
  }

  private navigateByRole(role?: string | null): void {
    const r = role?.toLowerCase();
    const dest =
      r === 'admin'
        ? '/admin'
        : r === 'agent'
          ? '/agent'
          : r === 'insurer'
            ? '/insurer'
            : r === 'seller'
              ? '/seller'
              : r === 'client'
                ? '/client'
                : r
                  ? '/' + r
                  : '/';
    this.router.navigate([dest]);
  }

  demoLogin(role: string): void {
    const account = this.getDemoAccount(role);
    if (!account) return;
    this.email = account.email;
    this.password = account.password;
    this.handleLogin();
  }
  showForgot(): void {
    // Real flow is handled by the dedicated reset page.
    this.router.navigate(['/forgot-password']);
  }

  onOtpInput(index: number, event: any): void {
    const value = event.target.value;
    this.otpDigits[index] = value;
    if (value && index < 5) {
      const next = document.querySelectorAll('.fl-otp-inp')[index + 1] as HTMLInputElement;
      if (next) next.focus();
    }
  }
  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prev = document.querySelectorAll('.fl-otp-inp')[index - 1] as HTMLInputElement;
      if (prev) {
        this.otpDigits[index - 1] = '';
        prev.focus();
      }
    }
  }
  get otpComplete(): boolean {
    return this.otpDigits.every((d) => d.length === 1);
  }
  verifyOtp(): void {
    if (!this.otpComplete) return;
    this.otpLoading = true;
    setTimeout(() => {
      this.otpLoading = false;
      if (this.otpTimer) clearInterval(this.otpTimer);
      this.currentView = 'success';
    }, 1500);
  }
  startOtpTimer(): void {
    let s = 90;
    this.otpResendDisabled = true;
    if (this.otpTimer) clearInterval(this.otpTimer);
    this.otpTimer = setInterval(() => {
      s--;
      this.otpCountdown = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      if (s <= 0) {
        clearInterval(this.otpTimer);
        this.otpCountdown = '00:00';
        this.otpResendDisabled = false;
      }
    }, 1000);
  }
  resendOtp(): void {
    this.otpDigits = ['', '', '', '', '', ''];
    this.startOtpTimer();
  }
  goToDashboard(): void {
    const dest =
      this.currentRole === 'agent'
        ? '/agent'
        : this.currentRole === 'seller'
          ? '/seller'
          : this.currentRole === 'insurer'
            ? '/insurer'
            : '/admin';
    this.router.navigate([dest]);
  }
  ngOnDestroy(): void {
    if (this.otpTimer) clearInterval(this.otpTimer);
  }

  handleLogin(): void {
    this.clearErrors();
    let ok = true;
    if (!this.email || !this.email.includes('@')) {
      this.emailError = true;
      ok = false;
    }
    if (!this.password || this.password.length < 4) {
      this.pwError = true;
      ok = false;
    }
    if (!ok) return;

    this.loginLoading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loginLoading = false;
        this.navigateByRole(res.role);
      },
      error: (err: Error) => {
        this.loginLoading = false;
        this.alertType = 'err';
        this.alertText = err.message;
        this.alertVisible = true;
        this.cdr.detectChanges();
      },
    });
  }
}
