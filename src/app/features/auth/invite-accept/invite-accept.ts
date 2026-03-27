import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-invite-accept',
  standalone: false,
  templateUrl: './invite-accept.html',
  styleUrls: ['./invite-accept.css', '../login/login.component.css'],
})
export class InviteAccept implements OnInit {
  token = '';
  loading = true;
  valid = false;
  errorMessage = '';
  email = '';
  firstName = '';
  role = '';
  expiresAt = '';

  password = '';
  password2 = '';
  submitting = false;
  successMessage = '';

  readonly signInRoute = '/login';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.token = params.get('token')?.trim() ?? '';
      if (!this.token) {
        this.loading = false;
        this.valid = false;
        this.errorMessage = 'Missing invitation token. Open the link from your email.';
        this.cdr.detectChanges();
        return;
      }
      this.validate();
    });
  }

  private validate(): void {
    this.loading = true;
    this.errorMessage = '';
    this.auth
      .validateInviteToken(this.token)
      .pipe(
        catchError((err) => {
          this.errorMessage = err?.message || 'Unable to validate invitation.';
          return of({ valid: false });
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((res) => {
        const r = res as {
          valid?: boolean;
          message?: string;
          email?: string;
          firstName?: string;
          role?: string;
          expiresAt?: string;
        };
        this.valid = !!r?.valid;
        if (!this.valid) {
          this.errorMessage = r?.message || 'Invalid or expired invitation link.';
          return;
        }
        this.email = r?.email ?? '';
        this.firstName = r?.firstName ?? '';
        this.role = r?.role ?? '';
        this.expiresAt = r?.expiresAt ?? '';
      });
  }

  get canSubmit(): boolean {
    return (
      this.valid &&
      this.password.length >= 8 &&
      this.password === this.password2 &&
      !this.submitting
    );
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.submitting = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.auth
      .acceptInvite(this.token, this.password)
      .pipe(
        catchError((err) => {
          this.errorMessage = err?.message || 'Could not set password.';
          return of(null);
        }),
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((res) => {
        if (!res) return;
        this.successMessage = res.message || 'Password set. You can sign in.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      });
  }
}
