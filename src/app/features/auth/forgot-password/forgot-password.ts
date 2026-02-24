import { Component } from '@angular/core';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  emailSent = false;
  email = '';

  sendReset() {
    if (this.email) {
      this.emailSent = true;
    }
  }

  resend() {
    console.log('Resending reset email...');
  }
}
