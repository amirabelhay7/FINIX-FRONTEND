import { Component, OnDestroy } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';

/**
 * ViewModel: forgot password (MVVM).
 */
@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css', '../login/login.component.css'],
})
export class ForgotPassword implements OnDestroy {
  emailSent = false;
  resetSuccess = false;
  email = '';
  pendingEmail = '';

  readonly recoveryLabel = 'Password Recovery';
  readonly pageTitle = 'Forgot your';
  readonly pageTitleBreak = 'password?';
  readonly pageSubtitle = "Enter your account email and we'll send you a reset link.";
  readonly emailLabel = 'Email Address';
  readonly emailPlaceholder = 'you@example.com';
  readonly sendLabel = 'Send Reset Link';
  readonly rememberPasswordLabel = 'Remember your password?';
  readonly signInLinkLabel = 'Sign in';
  readonly signInRoute = '/login';
  readonly leftTitle = "It happens to";
  readonly leftTitleBreak = "the best of us.";
  readonly leftSubtitle = "We'll send a secure reset link directly to your inbox. You'll be back in a few seconds.";
  readonly securityPromiseLabel = 'Security Promise';
  readonly securityNote1 = 'Reset links expire after 15 minutes and are single-use.';
  readonly securityNote2 = 'We never store your password in plain text.';
  readonly checkInboxTitle = 'Check your inbox';
  readonly checkInboxText = 'We sent a secure reset link to';
  readonly checkInboxEmail = 'your@email.com';
  readonly checkInboxExpiry = 'It expires in 15 minutes.';
  readonly didntReceiveLabel = "Didn't receive it?";
  readonly checkSpamLabel = 'Check your spam / junk folder';
  readonly waitResendLabel = 'Wait a minute and try resending';
  readonly resendLabel = 'Resend Email';
  readonly backToLoginLabel = 'Back to Login';
  readonly backToLoginRoute = '/login';

  otpDigits: string[] = ['', '', '', '', '', ''];
  otpCountdown = '05:00';
  otpResendDisabled = true;
  private otpTimer: any = null;

  otpLoading = false;
  isLoading = false;
  resetError = '';

  newPassword = '';
  newPassword2 = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnDestroy(): void {
    if (this.otpTimer) clearInterval(this.otpTimer);
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
        clearInterval(this.otpTimer);
        this.otpTimer = null;
        this.otpCountdown = '00:00';
        this.otpResendDisabled = false;
      }
    }, 1000);
  }

  private get otpComplete(): boolean {
    return this.otpDigits.every((d) => d.length === 1);
  }

  sendReset(): void {
    this.resetError = '';
    this.isLoading = true;

    if (!this.email || !this.email.includes('@')) {
      this.isLoading = false;
      this.resetError = 'Please enter a valid email address.';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.pendingEmail = this.email;
        this.emailSent = true;
        this.resetSuccess = false;
        this.otpDigits = ['', '', '', '', '', ''];
        this.startOtpTimer();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.resetError = err.message;
      },
    });
  }

  resend(): void {
    if (this.otpResendDisabled || this.isLoading) return;

    this.resetError = '';
    this.isLoading = true;

    this.authService.forgotPassword(this.pendingEmail).subscribe({
      next: () => {
        this.isLoading = false;
        this.otpDigits = ['', '', '', '', '', ''];
        this.startOtpTimer();
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.resetError = err.message;
      },
    });
  }

  handleResetPassword(): void {
    this.resetError = '';
    if (!this.otpComplete) {
      this.resetError = 'Please enter the verification code.';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 6) {
      this.resetError = 'The password must be at least 6 characters long.';
      return;
    }
    if (this.newPassword !== this.newPassword2) {
      this.resetError = 'Passwords do not match.';
      return;
    }
    if (this.isLoading) return;

    const code = this.otpDigits.join('');
    this.isLoading = true;

    this.authService.resetPassword(this.pendingEmail, code, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.resetSuccess = true;
        this.emailSent = false;
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.resetError = err.message;
      },
    });
  }
}
