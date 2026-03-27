import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, timeout } from 'rxjs/operators';
import { TimeoutError } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import type { RegisterPayload } from '../../../services/auth/auth.service';

/** Role option for step 2 (public self-registration: Client & Seller only). */
interface RegisterRoleOption {
  value: 'CLIENT' | 'SELLER';
  title: string;
  description: string;
}

/**
 * ViewModel: register (MVVM).
 * Styling matches finix-login shell; only Client & Seller can self-register.
 */
@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrls: ['./register.css', '../login/login.component.css'],
})
export class Register implements OnDestroy {
  currentStep = 1; // 1..3: form steps, 4: OTP verification
  selectedRole: '' | 'CLIENT' | 'SELLER' = '';

  stepError = '';

  // Step 1: Personal info
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  phone = '';
  dateOfBirth = '';
  cin = '';
  address = '';
  city = '';

  // Step 3: Role-specific
  localisation = '';
  commercialRegister = '';

  termsAccepted = false;

  /** Left panel steps (aligned with current flow). */
  readonly stepsCopy = [
    { title: 'Your details', subtitle: 'Name, contact & identity' },
    { title: 'Choose a role', subtitle: 'Client or Seller only' },
    { title: 'Finish', subtitle: 'Profile details & terms' },
  ];

  readonly onboardingLabel = 'Create your account';
  readonly createAccountLabel = 'Sign up';
  readonly joinTitle = 'Join';
  readonly joinTitleBreak = "FIN'IX";
  readonly alreadyHaveAccount = 'Already have an account?';
  readonly signInLabel = 'Sign in';
  readonly signInRoute = '/login';

  readonly staffOnlyNote =
    'Agent, Insurer, and Admin accounts are created by your administrator — not via this form.';

  readonly step2Heading = 'Choose your role';

  readonly roleOptions: RegisterRoleOption[] = [
    {
      value: 'CLIENT',
      title: 'Client',
      description: 'Apply for credit, insurance, and manage your wallet.',
    },
    {
      value: 'SELLER',
      title: 'Seller',
      description: 'Run campaigns and track performance.',
    },
  ];

  readonly continueLabel = 'Continue';
  readonly backLabel = 'Back';
  readonly createAccountButtonLabel = 'Create account';

  readonly clientLocalisationLabel = 'Area / neighbourhood';
  readonly clientLocalisationPlaceholder = 'e.g. Bab Souika, Tunis';
  readonly clientKycNotice =
    'You will complete KYC after sign-up to unlock loan applications.';

  readonly sellerRegisterLabel = 'Commercial register (RC)';
  readonly sellerRegisterPlaceholder = 'RC-2024-XXXXX';
  readonly sellerNotice = 'Your account may be verified against the commercial registry.';

  readonly termsLabel = "I agree to FINIX's";
  readonly termsLink = 'Terms of Service';
  readonly andLabel = 'and';
  readonly privacyLink = 'Privacy Policy';

  readonly testimonialText =
    '"FINIX made financing transparent and fast for our business."';
  readonly testimonialAuthor = 'Amadou K.';
  readonly testimonialSubtitle = 'Seller — Tunis';

  isLoading = false;
  registerError = '';

  /** Shown on step 4 after API confirms OTP was sent (server message or fallback). */
  otpSentMessage = '';

  pendingEmail = '';
  otpDigits: string[] = ['', '', '', '', '', ''];
  otpCountdown = '05:00';
  otpResendDisabled = true;
  private otpTimer: ReturnType<typeof setInterval> | null = null;

  @ViewChild('regMain') private regMain?: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnDestroy(): void {
    if (this.otpTimer) clearInterval(this.otpTimer);
  }

  private scrollRegisterPanelTop(): void {
    setTimeout(() => {
      const el = this.regMain?.nativeElement;
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }

  /** Detect OTP flow from register API body (handles minor JSON shape differences). */
  private isOtpRegistrationResponse(res: unknown): res is { otpRequired?: boolean; email?: string; message?: string } {
    if (!res || typeof res !== 'object') return false;
    const o = res as Record<string, unknown>;
    if (o['otpRequired'] === true) return true;
    const hasToken = o['access_token'] != null || o['accessToken'] != null;
    if (hasToken) return false;
    return typeof o['email'] === 'string' && o['email'].length > 0;
  }

  private redirectByRole(role?: string | null): void {
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
                  : '/client';
    this.router.navigate([dest]);
  }

  private parsePhone(): number | undefined {
    if (!this.phone?.trim()) return undefined;
    const n = parseFloat(this.phone.replace(/\D/g, ''));
    return Number.isFinite(n) ? n : undefined;
  }

  private validateStep1(): boolean {
    if (!this.firstName?.trim()) {
      this.stepError = 'Please enter your first name.';
      return false;
    }
    if (!this.lastName?.trim()) {
      this.stepError = 'Please enter your last name.';
      return false;
    }
    if (!this.email?.trim() || !this.email.includes('@')) {
      this.stepError = 'Please enter a valid email address.';
      return false;
    }
    if (!this.password || this.password.length < 8) {
      this.stepError = 'Password must be at least 8 characters.';
      return false;
    }
    return true;
  }

  nextStep(): void {
    this.stepError = '';
    this.registerError = '';

    if (this.currentStep === 1) {
      if (!this.validateStep1()) {
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.currentStep === 2) {
      if (!this.selectedRole) {
        this.stepError = 'Please choose Client or Seller.';
        this.cdr.detectChanges();
        return;
      }
    }

    if (this.currentStep < 3) this.currentStep++;
    this.cdr.detectChanges();
  }

  prevStep(): void {
    this.stepError = '';
    this.registerError = '';
    if (this.currentStep > 1) this.currentStep--;
    this.cdr.detectChanges();
  }

  selectRole(role: 'CLIENT' | 'SELLER'): void {
    this.selectedRole = role;
    this.stepError = '';
  }

  onSubmit(): void {
    this.stepError = '';
    this.registerError = '';

    if (!this.termsAccepted) {
      this.registerError = 'Please accept the terms and privacy policy.';
      this.cdr.detectChanges();
      return;
    }

    if (this.selectedRole === 'CLIENT' && !this.localisation?.trim()) {
      this.registerError = 'Please enter your area or neighbourhood.';
      this.cdr.detectChanges();
      return;
    }

    if (this.selectedRole === 'SELLER' && !this.commercialRegister?.trim()) {
      this.registerError = 'Please enter your commercial register number.';
      this.cdr.detectChanges();
      return;
    }

    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.selectedRole) {
      this.registerError = 'Please complete all required fields.';
      this.cdr.detectChanges();
      return;
    }

    const payload: RegisterPayload = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      phoneNumber: this.parsePhone(),
      cin: this.cin || undefined,
      address: this.address || undefined,
      city: this.city || undefined,
      role: this.selectedRole,
      localisation: this.selectedRole === 'CLIENT' ? this.localisation.trim() : undefined,
      commercialRegister: this.selectedRole === 'SELLER' ? this.commercialRegister.trim() : undefined,
    };

    this.isLoading = true;

    this.authService
      .register(payload)
      .pipe(
        timeout(60_000),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (res: unknown) => {
          this.ngZone.run(() => {
            this.isLoading = false;

            if (this.isOtpRegistrationResponse(res)) {
              const r = res as { message?: string; email?: string };
              const msg =
                typeof r.message === 'string' && r.message.trim()
                  ? r.message.trim()
                  : 'Verification code sent. Check your email (and spam).';
              this.otpSentMessage = msg;
              this.pendingEmail = (typeof r.email === 'string' && r.email) || this.email;
              this.otpDigits = ['', '', '', '', '', ''];
              this.registerError = '';
              this.currentStep = 4;
              this.startOtpTimer();
              this.scrollRegisterPanelTop();
            } else {
              const r = res as { role?: string; access_token?: string; accessToken?: string };
              this.redirectByRole(r?.role);
            }

            this.cdr.detectChanges();
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.registerError =
              err instanceof TimeoutError
                ? 'Request timed out. Check that the backend is running and Brevo is configured.'
                : err instanceof Error
                  ? err.message
                  : 'Registration failed.';
            this.scrollRegisterPanelTop();
            this.cdr.detectChanges();
          });
        },
      });
  }

  private startOtpTimer(): void {
    const totalSeconds = 5 * 60;
    let s = totalSeconds;
    this.otpResendDisabled = true;

    if (this.otpTimer) clearInterval(this.otpTimer);
    this.otpTimer = setInterval(() => {
      s--;
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      this.otpCountdown = `${mm}:${ss}`;
      if (s <= 0) {
        if (this.otpTimer) clearInterval(this.otpTimer);
        this.otpTimer = null;
        this.otpCountdown = '00:00';
        this.otpResendDisabled = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  get otpComplete(): boolean {
    return (
      this.otpDigits.length === 6 &&
      this.otpDigits.every((d) => /^[0-9]$/.test(String(d)))
    );
  }

  verifyOtp(): void {
    if (!this.otpComplete || this.isLoading) return;
    this.isLoading = true;
    this.registerError = '';

    const code = this.otpDigits.join('');
    this.authService
      .verifyEmail(this.pendingEmail, code)
      .pipe(
        timeout(60_000),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (res) => {
          this.ngZone.run(() => {
            if (this.otpTimer) clearInterval(this.otpTimer);
            this.redirectByRole((res as { role?: string })?.role);
            this.cdr.detectChanges();
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.registerError =
              err instanceof TimeoutError
                ? 'Request timed out. Try again.'
                : err instanceof Error
                  ? err.message
                  : 'Verification failed.';
            this.scrollRegisterPanelTop();
            this.cdr.detectChanges();
          });
        },
      });
  }

  resendOtp(): void {
    if (this.otpResendDisabled || !this.pendingEmail || this.isLoading) return;
    this.isLoading = true;
    this.registerError = '';

    this.authService
      .resendCode(this.pendingEmail)
      .pipe(
        timeout(60_000),
        finalize(() => {
          this.ngZone.run(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe({
        next: (res: { message?: string }) => {
          this.ngZone.run(() => {
            const m = res?.message?.trim();
            if (m) this.otpSentMessage = m;
            this.otpDigits = ['', '', '', '', '', ''];
            this.startOtpTimer();
            this.cdr.detectChanges();
          });
        },
        error: (err: unknown) => {
          this.ngZone.run(() => {
            this.registerError =
              err instanceof TimeoutError
                ? 'Request timed out.'
                : err instanceof Error
                  ? err.message
                  : 'Could not resend code.';
            this.scrollRegisterPanelTop();
            this.cdr.detectChanges();
          });
        },
      });
  }

  backToRegisterFromOtp(): void {
    this.currentStep = 3;
    this.registerError = '';
    this.otpSentMessage = '';
    this.cdr.detectChanges();
  }
}
