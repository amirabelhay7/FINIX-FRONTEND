import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login-client',
  standalone: false,
  templateUrl: './login-client.html',
  styleUrl: './login-client.css',
})
export class LoginClient implements OnDestroy {
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
    this.currentRole = role;
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
  }

  showView(view: 'role-select' | 'login' | 'otp' | 'success') {
    this.currentView = view;
  }

  switchTab(tab: 'login' | 'register') {
    this.currentTab = tab;
    this.clearErrors();
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
          this.authService.clearSession();
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
      phoneNumber: this.regPhone ? parseFloat(this.regPhone) : undefined,
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
}
