import { Component, OnInit } from '@angular/core';
import {
  ScoreFactor,
  ScoreHistoryPoint,
  ScoreMetric,
} from '../../core/mock-data/scoring.mock';
import { ScoringService } from '../../core/services/scoring.service';

@Component({
  selector: 'app-scoring',
  standalone: false,
  templateUrl: './scoring.html',
  styleUrl: './scoring.scss',
})
export class Scoring implements OnInit {
  metrics: ScoreMetric[] = [];
  factors: ScoreFactor[] = [];
  history: ScoreHistoryPoint[] = [];

  constructor(private scoringService: ScoringService) {}

  ngOnInit(): void {
    this.scoringService.getMetrics().subscribe((m) => (this.metrics = m));
    this.scoringService.getFactors().subscribe((f) => (this.factors = f));
    this.scoringService.getHistory().subscribe((h) => (this.history = h));
  }
}

