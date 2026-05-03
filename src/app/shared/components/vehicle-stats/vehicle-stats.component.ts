import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { VehicleStatsDto } from '../../../models';

@Component({
  selector: 'app-vehicle-stats',
  standalone: false,
  templateUrl: './vehicle-stats.component.html',
  styleUrl: './vehicle-stats.component.css',
})
export class VehicleStatsComponent implements OnChanges {
  @Input() stats: VehicleStatsDto | null = null;
  @Input() loading = false;
  @Input() error = '';

  @Output() refreshRequested = new EventEmitter<void>();

  /** Répartition par statut métier */
  statusDoughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  statusDoughnutOptions: ChartOptions<'doughnut'> = {};

  /** Actifs (flag) vs masqués */
  activeDoughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  activeDoughnutOptions: ChartOptions<'doughnut'> = {};

  /** Top marques */
  marqueBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  marqueBarOptions: ChartOptions<'bar'> = {};

  /** Jointure réservations : statut -> volume */
  reservationsStatusDoughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  reservationsStatusDoughnutOptions: ChartOptions<'doughnut'> = {};

  /** Jointure réservations -> client : top clients */
  topClientsBarData: ChartData<'bar'> = { labels: [], datasets: [] };
  topClientsBarOptions: ChartOptions<'bar'> = {};

  hasData = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stats']) {
      this.rebuildCharts();
    }
  }

  onRefresh(): void {
    this.refreshRequested.emit();
  }

  private rebuildCharts(): void {
    const s = this.stats;
    if (!s || s.total === 0) {
      this.hasData = false;
      this.clearCharts();
      return;
    }

    this.hasData = true;

    const disp = Number(s.disponibles) || 0;
    const res = Number(s.reserves) || 0;
    const vend = Number(s.vendus) || 0;
    const inact = Number(s.inactifs) || 0;

    this.statusDoughnutData = {
      labels: ['Available', 'Reserved', 'Sold', 'Inactive'],
      datasets: [
        {
          data: [disp, res, vend, inact],
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#64748b'],
          hoverBackgroundColor: ['#059669', '#d97706', '#2563eb', '#475569'],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    };

    const actifs = Number(s.actifs) || 0;
    const total = Number(s.total) || 0;
    const masques = Math.max(0, total - actifs);

    this.activeDoughnutData = {
      labels: ['Active listings', 'Hidden listings'],
      datasets: [
        {
          data: [actifs, masques],
          backgroundColor: ['#8b5cf6', '#e2e8f0'],
          hoverBackgroundColor: ['#7c3aed', '#cbd5e1'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };

    const entries = Object.entries(s.parMarque || {})
      .map(([k, v]) => ({ marque: k, n: Number(v) || 0 }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 14);

    const barLabels = entries.length ? entries.map((e) => e.marque) : ['(no aggregated brand)'];
    const barData = entries.length ? entries.map((e) => e.n) : [0];

    this.marqueBarData = {
      labels: barLabels,
      datasets: [
        {
          label: 'Vehicles',
          data: barData,
          backgroundColor: entries.length
            ? entries.map((_, i) => this.barColor(i))
            : ['#e2e8f0'],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };

    const reservationEntries = Object.entries(s.reservationsParStatut || {})
      .map(([status, n]) => ({ status, n: Number(n) || 0 }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);

    this.reservationsStatusDoughnutData = {
      labels: reservationEntries.length
        ? reservationEntries.map((e) => this.reservationStatusLabel(e.status))
        : ['No reservation'],
      datasets: [
        {
          data: reservationEntries.length ? reservationEntries.map((e) => e.n) : [0],
          backgroundColor: reservationEntries.length
            ? reservationEntries.map((_, i) => this.barColor(i))
            : ['#e2e8f0'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };

    const topClientsEntries = Object.entries(s.topClientsParReservation || {})
      .map(([client, n]) => ({ client, n: Number(n) || 0 }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n)
      .slice(0, 10);

    this.topClientsBarData = {
      labels: topClientsEntries.length
        ? topClientsEntries.map((e) => e.client)
        : ['(no aggregated client)'],
      datasets: [
        {
          label: 'Reservations',
          data: topClientsEntries.length ? topClientsEntries.map((e) => e.n) : [0],
          backgroundColor: topClientsEntries.length
            ? topClientsEntries.map((_, i) => this.barColor(i + 4))
            : ['#e2e8f0'],
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };

    const baseLegend = {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
          font: { family: 'system-ui, sans-serif', size: 12 },
          color: '#475569',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
      },
    } satisfies ChartOptions['plugins'];

    this.statusDoughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        ...baseLegend,
        title: {
          display: true,
          text: 'Distribution by status',
          color: '#0f172a',
          font: { size: 14, weight: 600, family: 'system-ui, sans-serif' },
          padding: { bottom: 8 },
        },
      },
    };

    this.activeDoughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        ...baseLegend,
        title: {
          display: true,
          text: 'Listing visibility',
          color: '#0f172a',
          font: { size: 14, weight: 600, family: 'system-ui, sans-serif' },
          padding: { bottom: 8 },
        },
      },
    };

    this.marqueBarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Top brands (volume)',
          color: '#0f172a',
          font: { size: 14, weight: 600, family: 'system-ui, sans-serif' },
          padding: { bottom: 12 },
        },
        tooltip: baseLegend.tooltip,
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.25)' },
          ticks: { color: '#64748b', font: { size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#334155', font: { size: 11 } },
        },
      },
    };

    this.reservationsStatusDoughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        ...baseLegend,
        title: {
          display: true,
          text: 'Reservations by status',
          color: '#0f172a',
          font: { size: 14, weight: 600, family: 'system-ui, sans-serif' },
          padding: { bottom: 8 },
        },
      },
    };

    this.topClientsBarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Top clients with reservations',
          color: '#0f172a',
          font: { size: 14, weight: 600, family: 'system-ui, sans-serif' },
          padding: { bottom: 12 },
        },
        tooltip: baseLegend.tooltip,
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.25)' },
          ticks: { color: '#64748b', font: { size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: '#334155', font: { size: 11 } },
        },
      },
    };
  }

  private reservationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_ADMIN_APPROVAL: 'Pending admin approval',
      WAITING_CUSTOMER_ACTION: 'Customer action required',
      UNDER_REVIEW: 'Under review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED_BY_CLIENT: 'Cancelled by client',
      CANCELLED_BY_ADMIN: 'Cancelled by admin',
      EXPIRED: 'Expired',
    };
    return labels[status] || status;
  }

  private barColor(i: number): string {
    const palette = [
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#d946ef',
      '#ec4899',
      '#f43f5e',
      '#f97316',
      '#eab308',
      '#22c55e',
      '#14b8a6',
      '#06b6d4',
      '#3b82f6',
      '#64748b',
      '#94a3b8',
    ];
    return palette[i % palette.length];
  }

  private clearCharts(): void {
    this.statusDoughnutData = { labels: [], datasets: [] };
    this.activeDoughnutData = { labels: [], datasets: [] };
    this.marqueBarData = { labels: [], datasets: [] };
    this.reservationsStatusDoughnutData = { labels: [], datasets: [] };
    this.topClientsBarData = { labels: [], datasets: [] };
  }

  /** Pour jauge prix : % fictif visuel (max arbitraire pour le rendu) */
  prixGaugePercent(s: VehicleStatsDto): number {
    const p = Number(s.prixMoyen) || 0;
    if (p <= 0) return 0;
    const cap = 150000;
    return Math.min(100, Math.round((p / cap) * 100));
  }
}
