import { Component, OnInit } from '@angular/core';
import { AdminFilterOption } from '../../../../models';
import { DelinquencyCaseDto, DelinquencyService } from '../../../../services/delinquency/delinquency.service';

@Component({
  selector: 'app-delinquency-list',
  standalone: false,
  templateUrl: './delinquency-list.html',
  styleUrl: './delinquency-list.css',
})
export class DelinquencyList implements OnInit {
  readonly pageTitle    = 'Dossiers de délinquance';
  readonly pageSubtitle = 'Suivi des retards de remboursement par niveau de risque et catégorie.';
  readonly backRoute    = '/admin/repayments';

  // Filtres
  readonly statusOptions: AdminFilterOption[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'NEW', label: 'NEW' },
    { value: 'CONTACTED', label: 'CONTACTED' },
    { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
    { value: 'RECOVERED', label: 'RECOVERED' },
    { value: 'CLOSED', label: 'CLOSED' },
  ];
  readonly riskOptions: AdminFilterOption[] = [
    { value: '', label: 'Tous les risques' },
    { value: 'LOW', label: 'LOW' },
    { value: 'MODERATE', label: 'MODERATE' },
    { value: 'HIGH', label: 'HIGH' },
    { value: 'CRITICAL', label: 'CRITICAL' },
  ];
  readonly categoryOptions: AdminFilterOption[] = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'FRIENDLY', label: 'FRIENDLY (Amiable)' },
    { value: 'PRE_LEGAL', label: 'PRE_LEGAL' },
    { value: 'LEGAL', label: 'LEGAL' },
    { value: 'WRITTEN_OFF', label: 'WRITTEN_OFF' },
  ];

  // État
  allCases: DelinquencyCaseDto[] = [];
  filteredCases: DelinquencyCaseDto[] = [];
  loading = true;
  error = '';

  // Valeurs des filtres actifs
  selectedStatus   = '';
  selectedRisk     = '';
  selectedCategory = '';

  constructor(private delinquencyService: DelinquencyService) {}

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.loading = true;
    this.delinquencyService.getAllCases().subscribe({
      next: (data) => {
        this.allCases = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur de chargement des dossiers.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredCases = this.allCases.filter(c => {
      const matchStatus   = !this.selectedStatus   || c.status === this.selectedStatus;
      const matchRisk     = !this.selectedRisk     || c.riskLevel === this.selectedRisk;
      const matchCategory = !this.selectedCategory || c.category === this.selectedCategory;
      return matchStatus && matchRisk && matchCategory;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // Helpers d'affichage
  riskClass(risk: string): string {
    const map: Record<string, string> = {
      LOW:      'bg-green-50 text-green-700',
      MODERATE: 'bg-amber-50 text-amber-700',
      HIGH:     'bg-orange-50 text-orange-700',
      CRITICAL: 'bg-red-50 text-red-700',
    };
    return map[risk] ?? 'bg-gray-100 text-gray-600';
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      NEW:         'bg-gray-100 text-gray-600',
      CONTACTED:   'bg-blue-50 text-blue-600',
      IN_PROGRESS: 'bg-blue-50 text-[#135bec]',
      PLAN_ACTIVE: 'bg-purple-50 text-purple-700',
      RECOVERED:   'bg-green-50 text-green-700',
      CLOSED:      'bg-gray-50 text-gray-400',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  categoryClass(cat: string): string {
    const map: Record<string, string> = {
      FRIENDLY:    'bg-teal-50 text-teal-700',
      PRE_LEGAL:   'bg-amber-50 text-amber-700',
      LEGAL:       'bg-red-50 text-red-700',
      WRITTEN_OFF: 'bg-gray-200 text-gray-500',
    };
    return map[cat] ?? 'bg-gray-100 text-gray-600';
  }

  detailRoute(id: number): string {
    return `/admin/repayments/delinquency/${id}`;
  }
}
