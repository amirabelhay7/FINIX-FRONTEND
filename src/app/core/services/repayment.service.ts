import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  REPAYMENT_METRICS,
  REPAYMENT_SCHEDULE,
  RepaymentMetric,
  RepaymentScheduleRow,
} from '../mock-data/repayment.mock';

@Injectable({
  providedIn: 'root',
})
export class RepaymentService {
  getMetrics(): Observable<RepaymentMetric[]> {
    return of(REPAYMENT_METRICS);
  }

  getSchedule(): Observable<RepaymentScheduleRow[]> {
    return of(REPAYMENT_SCHEDULE);
  }
}

