import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { FeedbackType, FeedbackVehiclePayload } from '../../../../models';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ReservationService } from '../../../../services/vehicle/reservation.service';

@Component({
  selector: 'app-client-feedback-page',
  standalone: false,
  templateUrl: './client-feedback-page.html',
  styleUrl: './client-feedback-page.css',
})
export class ClientFeedbackPage implements OnInit, OnDestroy {
  feedbackType: FeedbackType = 'CLIENT_SERVICE';
  rating = 0;
  comment = '';
  saving = false;
  success = '';
  error = '';
  hover = 0;
  returnTo = '/client/vehicles/suivi';
  returnLabel = 'Back to tracking';
  vehicleId: number | null = null;
  reservationId: number | null = null;
  private returnTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private auth: AuthService,
    private reservationService: ReservationService,
  ) {}

  ngOnInit(): void {
    this.auth.syncRoleFromToken();
    if (!this.auth.hasValidToken() || !this.auth.isClient()) {
      void this.router.navigate(['/login-client']);
      return;
    }
    this.route.queryParamMap.subscribe((params) => {
      // Client page: keep a single allowed type.
      this.feedbackType = 'CLIENT_SERVICE';
      const vehicleIdParam = Number(params.get('vehicleId'));
      const reservationIdParam = Number(params.get('reservationId'));
      if (Number.isFinite(vehicleIdParam) && vehicleIdParam > 0) {
        this.vehicleId = vehicleIdParam;
      } else {
        this.vehicleId = null;
      }
      if (Number.isFinite(reservationIdParam) && reservationIdParam > 0) {
        this.reservationId = reservationIdParam;
      } else {
        this.reservationId = null;
      }
      if (!this.vehicleId && this.reservationId) {
        this.reservationService.getById(this.reservationId).subscribe({
          next: (reservation) => {
            if (reservation?.vehicleId) {
              this.vehicleId = reservation.vehicleId;
            }
          },
          error: () => {
            // Validation message will guide the user if vehicle remains missing.
          },
        });
      }
      const requestedReturn = (params.get('returnTo') || '').trim();
      const requestedLabel = (params.get('returnLabel') || '').trim();
      if (requestedReturn) {
        this.returnTo = requestedReturn;
      }
      if (requestedLabel) {
        this.returnLabel = requestedLabel;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.returnTimer) {
      clearTimeout(this.returnTimer);
      this.returnTimer = null;
    }
  }

  stars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  setRating(value: number): void {
    this.rating = value;
  }

  setHover(value: number): void {
    this.hover = value;
  }

  clearHover(): void {
    this.hover = 0;
  }

  isStarActive(value: number): boolean {
    const threshold = this.hover > 0 ? this.hover : this.rating;
    return value <= threshold;
  }

  submitFeedback(): void {
    if (this.saving) return;
    this.success = '';
    this.error = '';
    if (this.rating < 1 || this.rating > 5) {
      this.error = 'Select a rating between 1 and 5 stars.';
      return;
    }
    if (!this.comment.trim()) {
      this.error = 'Comment is required.';
      return;
    }
    if (!this.vehicleId || this.vehicleId <= 0) {
      this.error = 'Vehicle missing. Go back to tracking and click Leave feedback again.';
      return;
    }

    const payload: FeedbackVehiclePayload = {
      feedbackType: 'CLIENT_SERVICE',
      noteGlobal: this.rating,
      comment: this.comment.trim(),
      vehicleId: this.vehicleId,
    };

    this.saving = true;
    this.vehicleService
      .createFeedback(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.success = 'Thanks! Your feedback has been sent.';
          this.comment = '';
          this.rating = 0;
          this.returnTimer = setTimeout(() => {
            void this.router.navigateByUrl(this.returnTo);
          }, 1200);
        },
        error: (err) => {
          console.error('[client-feedback-page] submit feedback failed', err);
          this.error = this.httpErrorMessage(err);
        },
      });
  }

  goBack(): void {
    void this.router.navigateByUrl(this.returnTo);
  }

  private httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string } | string | null;
      if (typeof body === 'string' && body.trim().length) return body;
      if (body && typeof body === 'object' && typeof body.message === 'string') return body.message;
      if (err.status === 0) return 'Server unreachable.';
      return `HTTP error ${err.status}`;
    }
    return 'An error occurred.';
  }
}

