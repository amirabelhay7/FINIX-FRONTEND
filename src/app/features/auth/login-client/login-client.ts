/// <reference types="google.accounts" />

import { Component, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse, AuthService, NeedsRoleSelectionResponse } from '../../../services/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login-client',
  standalone: false,
  templateUrl: './login-client.html',
  styleUrl: './login-client.css',
})
export class LoginClient implements OnDestroy {
  @ViewChild('googleSignInHost', { static: false }) googleSignInHost?: ElementRef<HTMLDivElement>;
  currentRole: 'client' | 'seller' | null = null;
  currentView: 'role-select' | 'login' | 'otp' | 'success' | 'forgot' | 'reset-code' | 'new-password' = 'role-select';
  currentTab: 'login' | 'register' = 'login';

  loginEmail = '';
  loginPassword = '';
  loginRemember = false;
  regFirstname = '';
  regLastname = '';
  regEmail = '';
  regPhone = '';
  regCin = '';
  regCompany = '';
  regPassword = '';
  regPassword2 = '';
  regTerms = false;

  otpDigits: string[] = ['', '', '', '', '', ''];
  private otpBusy = false;
  trackByIndex = (i: number) => i;
  otpCountdown = '01:30';
  otpSeconds = 90;
  otpTimerRef: any = null;
  otpResendDisabled = true;

  isLoading = false;
  showPassword = false;
  showRegPassword = false;
  passwordStrength = { level: 0, label: '', class: '' };
  loginError = '';
  loginAlert = { show: false, type: 'err', message: '' };
  regEmailError = false;
  regPasswordError = false;
  pendingEmail = '';
  forgotEmail = '';
  resetCode = '';
  newPassword = '';
  newPassword2 = '';
  showNewPassword = false;

  /** Google Identity Services */
  googleButtonRendered = false;
  private gsiInitialized = false;

  readonly roles = {
    client: {
      label: 'Espace Client',
      badgeClass: 'arb-client',
      successTitle: 'Connexion réussie !',
      successSub: "Bienvenue sur FIN'IX. Votre espace personnel est prêt.",
      feature2: 'Gestion de vos crédits & remboursements',
      feature3: 'Simulateur de crédit intégré',
      ctaText: 'Accéder à mon espace client',
    },
    seller: {
      label: 'Espace Vendeur',
      badgeClass: 'arb-seller',
      successTitle: 'Bienvenue Vendeur !',
      successSub:
        "Votre espace vendeur FIN'IX est prêt. Commencez à publier vos véhicules dès maintenant.",
      feature2: 'Publication de véhicules & gestion catalogue',
      feature3: 'Suivi des ventes & commissions',
      ctaText: 'Accéder à mon espace vendeur',
    },
  };

  constructor(private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnDestroy() {
    clearInterval(this.otpTimerRef);
  }

  get roleConfig() {
    return this.currentRole ? this.roles[this.currentRole] : this.roles.client;
  }

  selectRole(role: 'client' | 'seller') {
    this.currentRole = this.currentRole === role ? null : role;
  }

  confirmRole() {
    if (!this.currentRole) return;
    this.currentView = 'login';
    this.currentTab = 'register';
  }

  goLogin(role: 'client' | 'seller') {
    this.currentRole = role;
    this.currentView = 'login';
    this.currentTab = 'login';
    this.googleButtonRendered = false;
    if (this.googleSignInHost?.nativeElement) {
      this.googleSignInHost.nativeElement.innerHTML = '';
    }
    setTimeout(() => void this.tryRenderGoogleButton(), 0);
  }

  showView(view: 'role-select' | 'login' | 'otp' | 'success') {
    this.currentView = view;
    if (view !== 'login') {
      this.resetGoogleSignInUi();
    }
  }

  switchTab(tab: 'login' | 'register') {
    this.currentTab = tab;
    this.clearErrors();
    if (tab === 'login') {
      this.googleButtonRendered = false;
      if (this.googleSignInHost?.nativeElement) {
        this.googleSignInHost.nativeElement.innerHTML = '';
      }
      setTimeout(() => void this.tryRenderGoogleButton(), 0);
    }
  }

  togglePassword(field: 'login' | 'register') {
    if (field === 'login') this.showPassword = !this.showPassword;
    else this.showRegPassword = !this.showRegPassword;
  }

  checkStrength(value: string) {
    if (!value) {
      this.passwordStrength = { level: 0, label: '', class: '' };
      return;
    }
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    const levels = ['weak', 'weak', 'medium', 'strong'];
    const labels = ['Trop court', 'Faible', 'Moyen', 'Fort'];
    const idx = Math.max(0, score - 1);
    this.passwordStrength = { level: score, label: labels[idx], class: levels[idx] };
  }

  handleLogin() {
    this.clearErrors();
    if (!this.loginEmail) {
      this.loginError = 'email';
      return;
    }
    if (!this.loginPassword) {
      this.loginError = 'password';
      return;
    }

    this.isLoading = true;
    this.authService.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.isLoading = false;
        const actualRole = res.role?.toLowerCase();
        const selectedRole = this.currentRole?.toLowerCase();
        if (actualRole !== selectedRole) {
          localStorage.removeItem('finix_access_token');
          localStorage.removeItem('finix_role');
          localStorage.removeItem('currentUser');
          const roleLabels: Record<string, string> = {
            admin: 'Administrateur', agent: 'Agent IMF', insurer: 'Assureur', client: 'Client', seller: 'Vendeur'
          };
          const actualLabel = roleLabels[actualRole || ''] || actualRole;
          const selectedLabel = roleLabels[selectedRole || ''] || selectedRole;
          this.loginAlert = { show: true, type: 'err', message: `Connexion non autorisée. Vous avez un compte "${actualLabel}" mais vous essayez de vous connecter en tant que "${selectedLabel}". Veuillez choisir le profil correspondant à votre compte.` };
          this.cdr.detectChanges();
          return;
        }
        this.router.navigate(this.currentRole === 'seller' ? ['/seller'] : ['/client']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  handleRegister() {
    this.clearErrors();
    let ok = true;
    if (!this.regEmail || !this.regEmail.includes('@')) {
      this.regEmailError = true;
      ok = false;
    }
    if (this.regPassword !== this.regPassword2) {
      this.regPasswordError = true;
      ok = false;
    }
    if (!this.regTerms || !this.regFirstname || !this.regLastname) ok = false;
    if (!ok) return;

    this.isLoading = true;
    this.authService.register({
      firstName: this.regFirstname,
      lastName: this.regLastname,
      email: this.regEmail,
      password: this.regPassword,
      phoneNumber: this.parsePhoneNumber(this.regPhone),
      cin: this.regCin || undefined,
      role: this.currentRole === 'seller' ? 'SELLER' : 'CLIENT',
      commercialRegister: this.regCompany || undefined,
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.otpRequired) {
          this.pendingEmail = res.email;
          this.currentView = 'otp';
          this.otpDigits = ['', '', '', '', '', ''];
          this.startOtpTimer();
          this.cdr.detectChanges();
        } else {
          this.currentView = 'success';
          this.cdr.detectChanges();
        }
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  onOtpKey(index: number, event: KeyboardEvent) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const inputs = input.closest('.otp-wrap')?.querySelectorAll('input');

    if (event.key === 'Backspace') {
      this.otpDigits[index] = '';
      input.value = '';
      if (index > 0 && inputs) {
        (inputs[index - 1] as HTMLInputElement).focus();
      }
      this.cdr.detectChanges();
      return;
    }

    if (/^\d$/.test(event.key)) {
      this.otpDigits[index] = event.key;
      input.value = event.key;
      if (index < 5 && inputs) {
        (inputs[index + 1] as HTMLInputElement).focus();
      }
      this.cdr.detectChanges();
    }
  }

  get otpComplete(): boolean {
    return this.otpDigits.every((d) => d.length === 1);
  }

  verifyOtp() {
    if (!this.otpComplete) return;
    this.isLoading = true;
    const code = this.otpDigits.join('');
    this.authService.verifyEmail(this.pendingEmail, code).subscribe({
      next: () => {
        this.isLoading = false;
        clearInterval(this.otpTimerRef);
        this.currentView = 'success';
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  startOtpTimer() {
    this.otpSeconds = 90;
    this.otpResendDisabled = true;
    clearInterval(this.otpTimerRef);
    this.otpTimerRef = setInterval(() => {
      this.otpSeconds--;
      const m = String(Math.floor(this.otpSeconds / 60)).padStart(2, '0');
      const s = String(this.otpSeconds % 60).padStart(2, '0');
      this.otpCountdown = m + ':' + s;
      if (this.otpSeconds <= 0) {
        clearInterval(this.otpTimerRef);
        this.otpResendDisabled = false;
      }
    }, 1000);
  }

  resendOtp() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.authService.resendCode(this.pendingEmail).subscribe({
      next: () => {
        this.startOtpTimer();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  clearErrors() {
    this.loginError = '';
    this.loginAlert = { show: false, type: 'err', message: '' };
    this.regEmailError = false;
    this.regPasswordError = false;
  }

  private parsePhoneNumber(raw: string): number | undefined {
    const digits = (raw || '').replace(/\D/g, '');
    if (!digits) return undefined;
    const parsed = Number(digits);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  showForgot() {
    this.clearErrors();
    this.forgotEmail = this.loginEmail || '';
    this.currentView = 'forgot';
  }

  handleForgotPassword() {
    this.clearErrors();
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.loginAlert = { show: true, type: 'err', message: 'Veuillez entrer une adresse email valide.' };
      return;
    }
    this.isLoading = true;
    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.pendingEmail = this.forgotEmail;
        this.currentView = 'reset-code';
        this.otpDigits = ['', '', '', '', '', ''];
        this.startOtpTimer();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  verifyResetCode() {
    if (!this.otpComplete) return;
    this.resetCode = this.otpDigits.join('');
    clearInterval(this.otpTimerRef);
    this.currentView = 'new-password';
    this.cdr.detectChanges();
  }

  handleResetPassword() {
    this.clearErrors();
    if (!this.newPassword || this.newPassword.length < 6) {
      this.loginAlert = { show: true, type: 'err', message: 'Le mot de passe doit contenir au moins 6 caractères.' };
      return;
    }
    if (this.newPassword !== this.newPassword2) {
      this.loginAlert = { show: true, type: 'err', message: 'Les mots de passe ne correspondent pas.' };
      return;
    }
    this.isLoading = true;
    this.authService.resetPassword(this.pendingEmail, this.resetCode, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.loginAlert = { show: true, type: 'ok', message: 'Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.' };
        this.currentView = 'login';
        this.currentTab = 'login';
        this.newPassword = '';
        this.newPassword2 = '';
        this.resetCode = '';
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  resendResetCode() {
    this.otpDigits = ['', '', '', '', '', ''];
    this.authService.forgotPassword(this.pendingEmail).subscribe({
      next: () => {
        this.startOtpTimer();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  goToDashboard() {
    this.router.navigate(this.currentRole === 'seller' ? ['/seller'] : ['/client']);
  }

  private resetGoogleSignInUi(): void {
    this.googleButtonRendered = false;
    if (this.googleSignInHost?.nativeElement) {
      this.googleSignInHost.nativeElement.innerHTML = '';
    }
  }

  private async tryRenderGoogleButton(): Promise<void> {
    if (!environment.googleClientId?.trim()) return;
    if (this.currentView !== 'login' || this.currentTab !== 'login') return;
    const host = this.googleSignInHost?.nativeElement;
    if (!host || this.googleButtonRendered) return;

    try {
      await this.loadGsiScript();
      const google = window.google;
      if (!google?.accounts?.id) return;

      if (!this.gsiInitialized) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (resp: { credential: string }) => this.onGoogleCredential(resp.credential),
          auto_select: false,
        });
        this.gsiInitialized = true;
      }

      host.innerHTML = '';
      google.accounts.id.renderButton(host, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
        locale: 'fr',
      });
      this.googleButtonRendered = true;
    } catch {
      this.loginAlert = {
        show: true,
        type: 'err',
        message: 'Connexion Google indisponible (script ou configuration).',
      };
      this.cdr.detectChanges();
    }
  }

  private loadGsiScript(): Promise<void> {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-finix-gsi="1"]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.dataset['finixGsi'] = '1';
      s.onload = () => resolve();
      s.onerror = () => reject();
      document.head.appendChild(s);
    });
  }

  private onGoogleCredential(credential: string): void {
    this.clearErrors();
    this.isLoading = true;
    this.authService.loginWithGoogle(credential).subscribe({
      next: (res: AuthResponse | NeedsRoleSelectionResponse) => {
        if ('needsRoleSelection' in res && res.needsRoleSelection) {
          if (!this.currentRole) {
            this.isLoading = false;
            this.loginAlert = {
              show: true,
              type: 'err',
              message: 'Choisissez d abord Client ou Seller.',
            };
            this.cdr.detectChanges();
            return;
          }
          const selectedRole = this.currentRole === 'seller' ? 'SELLER' : 'CLIENT';
          this.authService.loginWithGoogle(credential, selectedRole).subscribe({
            next: (secondRes: AuthResponse | NeedsRoleSelectionResponse) => {
              this.isLoading = false;
              if ('needsRoleSelection' in secondRes && secondRes.needsRoleSelection) {
                this.loginAlert = {
                  show: true,
                  type: 'err',
                  message: 'Impossible de finaliser la creation du compte Google.',
                };
                this.cdr.detectChanges();
                return;
              }
              this.finishGoogleLogin(secondRes as AuthResponse);
            },
            error: (err: Error) => {
              this.isLoading = false;
              this.loginAlert = { show: true, type: 'err', message: err.message };
              this.cdr.detectChanges();
            },
          });
          return;
        }
        this.isLoading = false;
        this.finishGoogleLogin(res as AuthResponse);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.loginAlert = { show: true, type: 'err', message: err.message };
        this.cdr.detectChanges();
      },
    });
  }

  private finishGoogleLogin(res: AuthResponse): void {
    const actualRole = res.role?.toLowerCase();
    const selectedRole = this.currentRole?.toLowerCase();
    if (actualRole !== selectedRole) {
      localStorage.removeItem('finix_access_token');
      localStorage.removeItem('finix_role');
      localStorage.removeItem('currentUser');
      const roleLabels: Record<string, string> = {
        admin: 'Administrateur',
        agent: 'Agent IMF',
        insurer: 'Assureur',
        client: 'Client',
        seller: 'Vendeur',
      };
      const actualLabel = roleLabels[actualRole || ''] || actualRole;
      const selectedLabel = roleLabels[selectedRole || ''] || selectedRole;
      this.loginAlert = {
        show: true,
        type: 'err',
        message: `Connexion non autorisée. Votre compte est « ${actualLabel} » alors que vous avez choisi « ${selectedLabel} ».`,
      };
      this.cdr.detectChanges();
      return;
    }
    void this.router.navigate(this.currentRole === 'seller' ? ['/seller'] : ['/client']);
  }
}
