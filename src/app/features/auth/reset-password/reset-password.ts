import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  submitting = false;
  success = false;
  readonly token: string | null;
  showPassword = false;
  showConfirmPassword = false;
  readonly form;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');
    this.form = this.fb.nonNullable.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: (group) => {
          const password = group.get('password')?.value;
          const confirm = group.get('confirmPassword')?.value;
          return password && confirm && password === confirm ? null : { mismatch: true };
        },
      },
    );
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.authService
      .resetPassword(this.token ?? '', this.password.value)
      .subscribe(() => {
        this.submitting = false;
        this.success = true;
      });
  }
}

