import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  SCORING_METRICS,
  SCORING_FACTORS,
  SCORING_HISTORY,
  ScoreFactor,
  ScoreHistoryPoint,
  ScoreMetric,
} from '../mock-data/scoring.mock';

@Injectable({
  providedIn: 'root',
})
export class ScoringService {
  getMetrics(): Observable<ScoreMetric[]> {
    return of(SCORING_METRICS);
  }

  getFactors(): Observable<ScoreFactor[]> {
    return of(SCORING_FACTORS);
  }

  getHistory(): Observable<ScoreHistoryPoint[]> {
    return of(SCORING_HISTORY);
  }
}

