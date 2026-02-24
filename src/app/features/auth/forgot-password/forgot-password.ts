import { Component } from '@angular/core';

/**
 * ViewModel: forgot password (MVVM).
 */
@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  emailSent = false;
  email = '';

  readonly recoveryLabel = 'Password Recovery';
  readonly pageTitle = 'Forgot your';
  readonly pageTitleBreak = 'password?';
  readonly pageSubtitle = "Enter your account email and we'll send you a reset link.";
  readonly emailLabel = 'Email Address';
  readonly emailPlaceholder = 'you@example.com';
  readonly sendLabel = 'Send Reset Link';
  readonly rememberPasswordLabel = 'Remember your password?';
  readonly signInLinkLabel = 'Sign in';
  readonly signInRoute = '/auth/login';
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
  readonly backToLoginRoute = '/auth/login';

  sendReset(): void {
    if (this.email) {
      this.emailSent = true;
    }
  }

  resend(): void {
    console.log('Resending reset email...');
  }
}
