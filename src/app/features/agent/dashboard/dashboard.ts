import { Component } from '@angular/core';

/**
 * Capital Flow Monitor — dashboard body (same markup as `origin/emna` layout/agent).
 */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly chartBars = [35, 42, 55, 48, 38, 52, 60, 45, 58, 72, 65, 85];
  readonly chartMonths = [
    'Mar',
    'Avr',
    'Mai',
    'Jun',
    'Jul',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
    'Jan',
    'Fév',
  ];

  readonly riskClients = [
    {
      initials: 'C',
      name: 'S. Hammami',
      detail: 'Auto · 24 000 TND',
      pct: 72,
      color: '#EF4444',
    },
    {
      initials: 'B',
      name: 'W. Ferchichi',
      detail: 'Immo. · 120 000 TND',
      pct: 48,
      color: '#F59E0B',
    },
    {
      initials: 'D',
      name: 'I. Oueslati',
      detail: 'Conso. · 8 500 TND',
      pct: 35,
      color: '#EF4444',
    },
  ];
}
