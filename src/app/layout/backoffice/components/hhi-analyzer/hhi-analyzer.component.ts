import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HhiService } from '../../../../services/steering/hhi.service';
import { HHIResult, SimulatorRequest } from '../../../../models/hhi.model';

@Component({
  selector: 'app-hhi-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hhi-analyzer.component.html',
  styleUrls: ['./hhi-analyzer.component.scss']
})
export class HhiAnalyzerComponent implements OnInit {

  result: HHIResult | null = null;
  loading = true;
  simulating = false;

  regionalShares: Record<string, number> = {
    'Tunis': 40, 'Sfax': 35, 'Sousse': 15, 'Bizerte': 6, 'Nabeul': 4
  };
  salaryShares: Record<string, number> = {
    'BELOW_800': 45, 'BETWEEN_800_1500': 35, 'ABOVE_1500': 20
  };

  regionalKeys = ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Nabeul'];
  salaryKeys   = ['BELOW_800', 'BETWEEN_800_1500', 'ABOVE_1500'];
  salaryLabels: Record<string, string> = {
    'BELOW_800': '< 800 DT',
    'BETWEEN_800_1500': '800–1500 DT',
    'ABOVE_1500': '> 1500 DT'
  };

  constructor(
    private hhiService: HhiService,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.hhiService.getAnalysis().subscribe({
      next: (data: HHIResult) => {
        this.zone.run(() => {
          this.result  = data;
          this.loading = false;
          data.regionalSegments.forEach(s =>
            this.regionalShares[s.label] = Math.round(s.share * 100));
          data.salarySegments.forEach(s =>
            this.salaryShares[s.label] = Math.round(s.share * 100));
        });
      },
      error: () => {
        this.zone.run(() => { this.loading = false; });
      }
    });
  }

  onSliderChange(): void {
    this.normalize(this.regionalShares, this.regionalKeys);
    this.normalize(this.salaryShares, this.salaryKeys);
  }

  runSimulation(): void {
    this.simulating = true;
    const req: SimulatorRequest = {
      regionalShares: { ...this.regionalShares },
      salaryShares:   { ...this.salaryShares }
    };
    this.hhiService.simulate(req).subscribe({
      next: (data: HHIResult) => {
        this.zone.run(() => {
          this.result     = data;
          this.simulating = false;
        });
      },
      error: (err) => {
        console.error('Simulation error:', err);
        this.zone.run(() => { this.simulating = false; });
      }
    });
  }

  resetToReal(): void {
    this.zone.run(() => {
      this.loading = true;
      this.result  = null;
    });
    this.hhiService.getAnalysis().subscribe({
      next: (data: HHIResult) => {
        this.zone.run(() => {
          this.result  = data;
          this.loading = false;
          data.regionalSegments.forEach(s =>
            this.regionalShares[s.label] = Math.round(s.share * 100));
          data.salarySegments.forEach(s =>
            this.salaryShares[s.label] = Math.round(s.share * 100));
        });
      },
      error: () => {
        this.zone.run(() => { this.loading = false; });
      }
    });
  }

  private normalize(map: Record<string, number>, keys: string[]): void {
    const total = keys.reduce((s, k) => s + (map[k] || 0), 0);
    if (total === 0) return;
    keys.forEach(k => map[k] = Math.round((map[k] / total) * 100));
  }

  levelClass(level: string): string {
    if (level === 'DIVERSIFIED') return 'badge-safe';
    if (level === 'MODERATE')    return 'badge-warn';
    return 'badge-danger';
  }

  diversificationClass(label: string): string {
    if (label === 'HEALTHY') return 'score-healthy';
    if (label === 'FRAGILE') return 'score-fragile';
    return 'score-critical';
  }

  progressColor(hhi: number): string {
    if (hhi < 0.15) return '#22c55e';
    if (hhi < 0.25) return '#f59e0b';
    return '#ef4444';
  }

  hhiBarWidth(hhi: number): string {
    return Math.min(hhi / 0.5 * 100, 100) + '%';
  }

  shareBarWidth(share: number): string {
    return (share * 100) + '%';
  }

  trackByLabel(_: number, item: any): string { return item.label; }
}
