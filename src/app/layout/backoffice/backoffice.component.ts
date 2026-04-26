import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MarketingCampaign, CustomerSegment } from '../../models/marketing.model';
import { FinancialIndicator, TreasuryAccount, FundingSimulation } from '../../models/steering.model';
import { MarketingCampaignService } from '../../services/marketing/marketing-campaign.service';
import { CustomerSegmentService } from '../../services/marketing/customer-segment.service';
import { FinancialIndicatorService } from '../../services/steering/financial-indicator.service';
import { TreasuryAccountService } from '../../services/steering/treasury-account.service';
import { FundingSimulationService } from '../../services/steering/funding-simulation.service';
import { CashMovementService, CashMovement } from '../../services/steering/cash-movement.service';
import { CampaignSegmentLinkService } from '../../services/marketing/campaign-segment-link.service';
import { CampaignCreditLinkService } from '../../services/marketing/campaign-credit-link.service';
import { CampaignCreditLink } from '../../models/marketing.model';
// [ML ADDED] MLPrediction added to the existing import — no duplicate import
import { DashboardService, FinancialSteeringDashboard, DefaultRateSegmentDTO, RiskIndicatorDTO, MLPrediction } from '../../services/steering/dashboard.service';

interface PipelineCard {
  name: string;
  ref: string;
  amount: string;
  type: string;
  warn?: boolean;
}

interface PipelineColumn {
  title: string;
  class: string;
  count: number;
  cards: PipelineCard[];
}

interface SegmentWithCampaignsDTO {
  segmentId: number;
  segmentName: string;
  minIncome: number;
  maxIncome: number;
  employmentType: string;
  geographicZone: string;
  campaignIds: number[];
  campaignNames: string[];
}

@Component({
  selector: 'app-backoffice',
  standalone: false,
  templateUrl: './backoffice.component.html',
  styleUrl: './backoffice.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class BackofficeComponent implements OnInit, OnDestroy {
  selectedPage = 'dashboard';
  hover = false;
  showModal = false;
  decisionNote = '';
  currentTheme: 'light' | 'dark' = 'light';

  private readonly API = 'http://localhost:8081/api';

  /* ── Users management ── */
  usersList: any[] = [];
  usersLoading = false;
  showUserModal = false;
  editingUserId: number | null = null;
  addUserError = '';
  addUserLoading = false;
  newUser: any = { firstName: '', lastName: '', email: '', password: '', role: 'AGENT', phoneNumber: '', address: '', city: '', agenceCode: '', region: '', insurerName: '', insurerEmail: '' };
  showViewUserModal = false;
  viewUser: any = null;

  /* ── Logs ── */
  logsList: any[] = [];
  logsLoading = false;
  usersTab: 'users' | 'logs' = 'users';

  /* ── Marketing ── */
  campaigns: MarketingCampaign[] = [];
  campaignPage = 0;
  campaignPageSize = 5;
  campaignTotalPages = 0;
  pagedCampaigns: MarketingCampaign[] = [];
  segments: CustomerSegment[] = [];
  segmentsWithCampaigns: SegmentWithCampaignsDTO[] = [];
  indicators: FinancialIndicator[] = [];
  treasuryAccounts: TreasuryAccount[] = [];
  simulations: FundingSimulation[] = [];

  showCampaignModal = false;
  campaignForm: any = {
    name: '', description: '', campaignType: 'PROMOTION',
    startDate: '', endDate: '', budget: null, status: 'PLANNED'
  };
  editingCampaignId: number | null = null;
  campaignError = '';

  selectedCampaignForSegments: any = null;
  assignedSegmentIds: number[] = [];
  selectedSegmentToAssign: number | null = null;

  selectedCampaignForCredits: any = null;
  campaignCredits: CampaignCreditLink[] = [];
  showCreditForm = false;
  creditLinkError = '';
  creditForm: any = {
    campaignId: null, creditId: null, creditAmount: null,
    interestAmount: null, appliedDiscountRate: null, grantedDate: ''
  };
  today = new Date().toISOString().split('T')[0];

  showSegmentModal = false;
  segmentError = '';
  editingSegmentId: number | null = null;
  segmentForm: any = {
    name: '', description: '', minIncome: null, maxIncome: null,
    employmentType: 'SALARIED', geographicZone: ''
  };

  /* ── Clients ── */
  clients: any[] = [];
  clientsLoading = false;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private campaignService: MarketingCampaignService,
    private segmentService: CustomerSegmentService,
    private indicatorService: FinancialIndicatorService,
    private treasuryService: TreasuryAccountService,
    private simulationService: FundingSimulationService,
    private campaignSegmentLinkService: CampaignSegmentLinkService,
    private campaignCreditLinkService: CampaignCreditLinkService,
    private cashMovementService: CashMovementService,
    private dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    console.log('>>> BackofficeComponent ngOnInit <<<', new Date().getTime());
    console.trace();
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'light';
    this.applyTheme();
    this.loadCampaigns();
    this.loadSegments();
    this.loadIndicators();
    this.loadTreasuryAccounts();
    this.loadSimulations();
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  logout(): void {
    localStorage.removeItem('finix_access_token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  onPageChange(page: string) {
    this.selectedPage = page;
    if (page === 'users') {
      this.usersTab = 'users';
      this.loadUsers();
      this.loadLogs();
    }
    if (page === 'clients') {
      this.loadClients();
    }
    if (page === 'financial-steering') {
      this.loadSteeringDashboard();
    }
  }

  switchPage(page: string): void {
    this.onPageChange(page);
  }

  switchUsersTab(tab: 'users' | 'logs'): void {
    this.usersTab = tab;
  }

  countByStatus(status: string): number {
    return this.campaigns.filter(c => c.status === status).length;
  }

  // ── Campaign ──
  openCampaignForm() {
    this.campaignForm = { name: '', description: '', campaignType: 'PROMOTION', startDate: '', endDate: '', budget: null, status: 'PLANNED' };
    this.editingCampaignId = null;
    this.showCampaignModal = true;
  }

  editCampaign(c: any) {
    this.campaignForm = { name: c.name, description: c.description, campaignType: c.campaignType, startDate: c.startDate, endDate: c.endDate, budget: c.budget, status: c.status };
    this.editingCampaignId = c.id;
    this.showCampaignModal = true;
  }

  closeCampaignModal() {
    this.showCampaignModal = false;
    this.campaignError = '';
  }

  saveCampaign() {
    const action = this.editingCampaignId
      ? this.campaignService.update(this.editingCampaignId, this.campaignForm)
      : this.campaignService.add(this.campaignForm);
    action.subscribe({
      next: () => { this.loadCampaigns(); this.closeCampaignModal(); },
      error: err => {
        if (err.status === 409) this.campaignError = 'A campaign with this name already exists.';
        else if (err.status === 400) this.campaignError = err.error?.message || 'Invalid data.';
        else this.campaignError = 'An error occurred. Please try again.';
      }
    });
  }

  deleteCampaign(id: any): void {
    if (!id) return;
    this.campaignService.delete(id).subscribe({
      next: () => this.loadCampaigns(),
      error: err => console.error('Delete campaign error', err)
    });
  }

  // ── Segment ──
  openSegmentForm() {
    this.segmentForm = { name: '', description: '', minIncome: null, maxIncome: null, employmentType: 'SALARIED', geographicZone: '' };
    this.editingSegmentId = null;
    this.segmentError = '';
    this.showSegmentModal = true;
  }

  editSegment(s: any) {
    this.segmentForm = { name: s.name, description: s.description, minIncome: s.minIncome, maxIncome: s.maxIncome, employmentType: s.employmentType, geographicZone: s.geographicZone };
    this.editingSegmentId = s.id;
    this.segmentError = '';
    this.showSegmentModal = true;
  }

  closeSegmentModal() {
    this.showSegmentModal = false;
    this.segmentError = '';
  }

  saveSegment() {
    if (this.editingSegmentId) {
      this.segmentService.update(this.editingSegmentId, this.segmentForm).subscribe({
        next: () => { this.loadSegments(); this.loadSegmentsWithCampaigns(); this.closeSegmentModal(); },
        error: err => {
          if (err.status === 409) this.segmentError = 'A segment with this name already exists.';
          else if (err.status === 400) this.segmentError = err.error?.message || 'Invalid data.';
          else this.segmentError = 'An error occurred.';
        }
      });
    } else {
      this.segmentService.add(this.segmentForm).subscribe({
        next: (newSegment) => {
          this.segments = [...this.segments, newSegment];
          this.segmentsWithCampaigns = [...this.segmentsWithCampaigns, {
            segmentId: newSegment.id as number, segmentName: newSegment.name,
            minIncome: newSegment.minIncome, maxIncome: newSegment.maxIncome,
            employmentType: newSegment.employmentType, geographicZone: newSegment.geographicZone,
            campaignIds: [], campaignNames: []
          }];
          this.closeSegmentModal();
          this.loadSegmentsWithCampaigns();
        },
        error: err => {
          if (err.status === 409) this.segmentError = 'A segment with this name already exists.';
          else if (err.status === 400) this.segmentError = err.error?.message || 'Invalid data.';
          else this.segmentError = 'An error occurred.';
        }
      });
    }
  }

  deleteSegment(id: any): void {
    if (!id) return;
    this.segmentService.delete(id).subscribe({
      next: () => {
        this.segments = this.segments.filter(s => s.id !== id);
        this.segmentsWithCampaigns = this.segmentsWithCampaigns.filter(s => s.segmentId !== id);
        this.loadSegmentsWithCampaigns();
      },
      error: err => console.error('Delete segment error', err)
    });
  }

  loadCampaigns(): void {
    this.campaignService.getAll().subscribe({
      next: data => {
        this.campaigns = data;
        this.campaignPage = 0;
        this.updatePagedCampaigns();
        this.loadSegmentsWithCampaigns();
      },
      error: err => console.error('Campaigns error', err)
    });
  }

  loadSegmentsWithCampaigns() {
    this.segmentService.getAll().subscribe({
      next: (segments) => {
        this.segmentsWithCampaigns = segments.map(s => ({
          segmentId: s.id as number, segmentName: s.name, description: s.description,
          minIncome: s.minIncome, maxIncome: s.maxIncome,
          employmentType: s.employmentType, geographicZone: s.geographicZone,
          campaignIds: [] as number[], campaignNames: [] as string[]
        }));
        this.campaigns.forEach(campaign => {
          this.campaignSegmentLinkService.getSegmentIdsByCampaign(campaign.id!).subscribe({
            next: (segmentIds) => {
              segmentIds.forEach(segId => {
                const dto = this.segmentsWithCampaigns.find(d => d.segmentId === segId);
                if (dto && !dto.campaignIds.includes(campaign.id!)) {
                  dto.campaignIds.push(campaign.id!);
                  dto.campaignNames.push(campaign.name);
                }
              });
            },
            error: (err) => console.error('Error loading segments for campaign', campaign.id, err)
          });
        });
      },
      error: (err) => console.error('Error loading segments', err)
    });
  }

  updatePagedCampaigns(): void {
    const start = this.campaignPage * this.campaignPageSize;
    this.pagedCampaigns = this.campaigns.slice(start, start + this.campaignPageSize);
    this.campaignTotalPages = Math.ceil(this.campaigns.length / this.campaignPageSize);
  }

  campaignNextPage(): void {
    if (this.campaignPage < this.campaignTotalPages - 1) {
      this.campaignPage++;
      this.updatePagedCampaigns();
    }
  }

  campaignPrevPage(): void {
    if (this.campaignPage > 0) {
      this.campaignPage--;
      this.updatePagedCampaigns();
    }
  }

  campaignGoToPage(page: number): void {
    this.campaignPage = page;
    this.updatePagedCampaigns();
  }

  get campaignPages(): number[] {
    return Array.from({ length: this.campaignTotalPages }, (_, i) => i);
  }

  loadSegments(): void {
    this.segmentService.getAll().subscribe({ next: data => this.segments = data, error: err => console.error('Segments error', err) });
  }

  // ── Segment Assignment ──
  isAssigned(segmentId: number): boolean {
    return this.assignedSegmentIds.includes(segmentId);
  }

  openSegmentAssignment(campaign: any) {
    this.selectedCampaignForSegments = campaign;
    this.selectedSegmentToAssign = null;
    this.assignedSegmentIds = [];
    this.campaignSegmentLinkService.getSegmentIdsByCampaign(campaign.id).subscribe({
      next: ids => { this.assignedSegmentIds = [...ids]; this.cleanupOrphanAssignedSegments(); this.selectedSegmentToAssign = null; this.cdr.detectChanges(); },
      error: err => console.error('Error loading segments', err)
    });
  }

  closeSegmentAssignment() {
    this.selectedCampaignForSegments = null;
    this.assignedSegmentIds = [];
    this.selectedSegmentToAssign = null;
  }

  assignSegment() {
    if (!this.selectedSegmentToAssign || !this.selectedCampaignForSegments) return;
    this.campaignSegmentLinkService.assign(this.selectedCampaignForSegments.id, this.selectedSegmentToAssign).subscribe({
      next: () => {
        this.campaignSegmentLinkService.getSegmentIdsByCampaign(this.selectedCampaignForSegments.id).subscribe({
          next: ids => { this.assignedSegmentIds = [...ids]; this.cleanupOrphanAssignedSegments(); this.selectedSegmentToAssign = null; this.cdr.detectChanges(); },
          error: err => console.error('Error reloading segments', err)
        });
      },
      error: err => console.error('Assign error', err)
    });
  }

  unassignSegment(segmentId: number) {
    if (!this.selectedCampaignForSegments) return;
    this.campaignSegmentLinkService.unassign(this.selectedCampaignForSegments.id, segmentId).subscribe({
      next: () => {
        this.campaignSegmentLinkService.getSegmentIdsByCampaign(this.selectedCampaignForSegments.id).subscribe({
          next: ids => { this.assignedSegmentIds = [...ids]; this.cleanupOrphanAssignedSegments(); this.selectedSegmentToAssign = null; this.cdr.detectChanges(); },
          error: err => console.error('Error reloading segments', err)
        });
      },
      error: err => console.error('Unassign error', err)
    });
  }

  cleanupOrphanAssignedSegments() {
    this.assignedSegmentIds = this.assignedSegmentIds.filter(id => this.segments.some(s => s.id === id));
  }

  get validAssignedSegments(): number[] {
    return this.assignedSegmentIds.filter(id => this.segments.some(s => s.id === id));
  }

  getSegmentName(segmentId: number): string {
    const segment = this.segments.find(s => s.id === segmentId);
    return segment ? segment.name : 'Segment #' + segmentId;
  }

  // ── Credit Link ──
  openCreditLink(campaign: any) {
    this.selectedCampaignForCredits = campaign;
    this.showCreditForm = false;
    this.creditLinkError = '';
    this.campaignCredits = [];
    this.creditForm = { campaignId: campaign.id, creditId: null, creditAmount: null, interestAmount: null, appliedDiscountRate: null, grantedDate: '' };
    this.campaignCreditLinkService.getByCampaign(campaign.id).subscribe({
      next: data => this.campaignCredits = data,
      error: err => console.error('Error loading credits', err)
    });
  }

  closeCreditLink() {
    this.selectedCampaignForCredits = null;
    this.campaignCredits = [];
    this.showCreditForm = false;
    this.creditLinkError = '';
  }

  saveCreditLink() {
    this.campaignCreditLinkService.add(this.creditForm).subscribe({
      next: () => {
        this.showCreditForm = false;
        this.creditLinkError = '';
        this.campaignCreditLinkService.getByCampaign(this.selectedCampaignForCredits.id).subscribe({
          next: data => this.campaignCredits = [...data],
          error: err => console.error('Error reloading credits', err)
        });
      },
      error: err => {
        if (err.status === 409) this.creditLinkError = 'This credit is already linked to a campaign.';
        else if (err.status === 400) this.creditLinkError = err.error?.message || 'Invalid data.';
        else this.creditLinkError = 'An error occurred.';
      }
    });
  }

  deleteCreditLink(id: any) {
    this.campaignCreditLinkService.delete(id).subscribe({
      next: () => { this.campaignCredits = this.campaignCredits.filter(c => c.id !== id); },
      error: err => console.error('Delete credit link error', err)
    });
  }

  getTotalFinanced(): number {
    return this.campaignCredits.reduce((sum, c) => sum + (c.creditAmount || 0), 0);
  }

  getTotalInterest(): number {
    return this.campaignCredits.reduce((sum, c) => sum + (c.interestAmount || 0), 0);
  }

  // ── Steering ──
  savingIndicator = false;
  savingTreasury = false;
  savingSimulation = false;
  showIndicatorForm = false;
  indicatorError = '';
  indicatorForm: any = {
    name: '', referenceIndicator: '', value: null,
    warningThreshold: null, criticalThreshold: null
  };

  showTreasuryForm = false;
  editingTreasuryId: number | null = null;
  treasuryError = '';
  treasuryForm: any = {
    name: '', type: 'MAIN', initialBalance: null,
    currentBalance: null, currency: 'TND'
  };
  treasuryUpdateForm: any = { name: '', currency: 'TND', status: 'ACTIVE' };

  showSimulationForm = false;
  simulationError = '';
  simulationForm: any = {
    projectedAmount: null, averageDefaultRate: null,
    estimatedProvisionNeeded: null, decision: null
  };

  showMovementsPanel = false;
  selectedTreasuryId: number | null = null;
  movements: CashMovement[] = [];
  showMovementForm = false;

  /* ── Financial Steering Dashboard ── */
  steeringDashboard: FinancialSteeringDashboard | null = null;
  steeringLoading = false;
  steeringError = false;
  steeringSelectedMonth = '2025-01';
  steeringActiveTab: 'salary' | 'region' | 'risk' = 'salary';
  steeringSalarySegments: DefaultRateSegmentDTO[] = [];
  steeringRegionSegments: DefaultRateSegmentDTO[] = [];
  steeringRiskIndicators: RiskIndicatorDTO[] = [];
  steeringMonths = [
  { value: '2025-01', label: 'January 2025' },
  { value: '2025-03', label: 'March 2025' },
  { value: '2025-05', label: 'May 2025' },
  { value: '2025-06', label: 'June 2025' },
  { value: '2025-07', label: 'July 2025' },
  { value: '2025-08', label: 'August 2025' },
  { value: '2025-09', label: 'September 2025' },
  { value: '2025-10', label: 'October 2025' },
  { value: '2025-11', label: 'November 2025' },
  { value: '2025-12', label: 'December 2025' }
];
  movementError = '';
  movementForm: any = {
    treasuryAccountId: null, movementDirection: 'INFLOW',
    description: '', amount: null
  };

  // [ML ADDED] ML prediction properties
  mlPrediction: MLPrediction | null = null;
  mlLoading = false;
  mlError = false;
  // [ML ADDED] needed to use Math.abs() in the HTML template
  protected Math = Math;

  // ── Indicator ──
  openIndicatorForm() {
    this.indicatorForm = { name: '', referenceIndicator: '', value: null, warningThreshold: null, criticalThreshold: null };
    this.indicatorError = '';
    this.showIndicatorForm = true;
  }

  closeIndicatorForm() {
    this.showIndicatorForm = false;
    this.indicatorError = '';
  }

  saveIndicator() {
    if (this.savingIndicator) return;
    this.savingIndicator = true;
    this.indicatorService.add(this.indicatorForm).subscribe({
      next: () => { this.loadIndicators(); this.closeIndicatorForm(); this.savingIndicator = false; },
      error: err => {
        if (err.status === 400) this.indicatorError = err.error?.message || JSON.stringify(err.error?.errors) || 'Invalid data.';
        else this.indicatorError = 'An error occurred.';
        this.savingIndicator = false;
      }
    });
  }

  // ── Treasury ──
  openTreasuryForm() {
    this.treasuryForm = { name: '', type: 'MAIN', initialBalance: null, currentBalance: null, currency: 'TND' };
    this.editingTreasuryId = null;
    this.treasuryError = '';
    this.showTreasuryForm = true;
  }

  editTreasury(t: any) {
    this.editingTreasuryId = t.id;
    this.treasuryUpdateForm = { name: t.name, currency: t.currency, status: t.status };
    this.treasuryError = '';
    this.showTreasuryForm = true;
  }

  closeTreasuryForm() {
    this.showTreasuryForm = false;
    this.treasuryError = '';
    this.editingTreasuryId = null;
  }

  saveTreasury() {
    if (this.savingTreasury) return;
    this.savingTreasury = true;
    if (this.editingTreasuryId) {
      this.treasuryService.update(this.editingTreasuryId, this.treasuryUpdateForm).subscribe({
        next: () => { this.loadTreasuryAccounts(); this.closeTreasuryForm(); this.savingTreasury = false; },
        error: err => {
          if (err.status === 400) this.treasuryError = err.error?.message || 'Invalid data.';
          else this.treasuryError = 'An error occurred.';
          this.savingTreasury = false;
        }
      });
    } else {
      this.treasuryForm.currentBalance = this.treasuryForm.initialBalance;
      this.treasuryService.add(this.treasuryForm).subscribe({
        next: () => { this.loadTreasuryAccounts(); this.closeTreasuryForm(); this.savingTreasury = false; },
        error: err => {
          if (err.status === 400) this.treasuryError = err.error?.message || 'Invalid data.';
          else if (err.status === 409) this.treasuryError = 'An account of this type and currency already exists.';
          else this.treasuryError = 'An error occurred.';
          this.savingTreasury = false;
        }
      });
    }
  }

  // ── Simulation ──
  openSimulationForm() {
    this.simulationForm = { projectedAmount: null, averageDefaultRate: null, estimatedProvisionNeeded: null, decision: null };
    this.simulationError = '';
    this.showSimulationForm = true;
  }

  closeSimulationForm() {
    this.showSimulationForm = false;
    this.simulationError = '';
  }

  saveSimulation() {
    if (this.savingSimulation) return;
    this.savingSimulation = true;
    this.simulationService.add(this.simulationForm).subscribe({
      next: () => { this.loadSimulations(); this.closeSimulationForm(); this.savingSimulation = false; },
      error: err => {
        if (err.status === 400) this.simulationError = err.error?.message || 'Invalid data.';
        else this.simulationError = 'An error occurred.';
        this.savingSimulation = false;
      }
    });
  }

  // ── Movements ──
  viewMovements(id: any) {
    this.selectedTreasuryId = id;
    this.showMovementsPanel = true;
    this.showMovementForm = false;
    this.movementError = '';
    this.movements = [];
    this.cashMovementService.getByAccount(id).subscribe({
      next: data => this.movements = data,
      error: err => console.error('Movements error', err)
    });
  }

  closeMovementsPanel() {
    this.showMovementsPanel = false;
    this.selectedTreasuryId = null;
    this.movements = [];
  }

  openMovementForm() {
    this.movementForm = { treasuryAccountId: this.selectedTreasuryId, movementDirection: 'INFLOW', description: '', amount: null };
    this.movementError = '';
    this.showMovementForm = true;
  }

  saveMovement() {
    this.cashMovementService.add(this.movementForm).subscribe({
      next: () => {
        this.showMovementForm = false;
        this.movementError = '';
        this.loadTreasuryAccounts();
        const id = this.selectedTreasuryId;
        this.cashMovementService.getByAccount(id!).subscribe({
          next: data => this.movements = [...data],
          error: err => console.error('Movements reload error', err)
        });
      },
      error: err => {
        if (err.status === 400) this.movementError = err.error?.message || 'Invalid data.';
        else this.movementError = 'An error occurred.';
      }
    });
  }

  loadIndicators(): void {
    this.indicatorService.getAll().subscribe({ next: data => this.indicators = data, error: err => console.error('Indicators error', err) });
  }

  loadTreasuryAccounts(): void {
    this.treasuryService.getAll().subscribe({ next: data => this.treasuryAccounts = data, error: err => console.error('Treasury error', err) });
  }

  loadSimulations(): void {
    this.simulationService.getAll().subscribe({ next: data => this.simulations = data, error: err => console.error('Simulations error', err) });
  }

  // ── Clients API ──
  loadClients(): void {
    this.clientsLoading = true;
    this.http.get<any[]>(`${this.API}/users`).subscribe({
      next: (users) => {
        this.clients = users.filter((u: any) => u.role === 'CLIENT').map((u: any) => ({
          id: u.id,
          initials: ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase(),
          name: (u.firstName || '') + ' ' + (u.lastName || ''),
          email: u.email || '—', phone: u.phoneNumber ? '+216 ' + u.phoneNumber : '—',
          cin: u.cin || '—', city: u.city || '—', status: 'Active', statusClass: 'b-actif'
        }));
        this.clientsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.clientsLoading = false; this.cdr.detectChanges(); }
    });
  }

  // ── Logs API ──
  loadLogs(): void {
    this.logsLoading = true;
    this.http.get<any[]>(`${this.API}/users/logs`).subscribe({
      next: (logs) => { this.logsList = logs; this.logsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.logsLoading = false; this.cdr.detectChanges(); }
    });
  }

  // ── Users API ──
  loadUsers(): void {
    this.usersLoading = true;
    this.http.get<any[]>(`${this.API}/users`).subscribe({
      next: (users) => { this.usersList = users.filter((u: any) => u.role === 'AGENT' || u.role === 'INSURER'); this.usersLoading = false; this.cdr.detectChanges(); },
      error: () => { this.usersLoading = false; this.cdr.detectChanges(); }
    });
  }

  openAddUser(): void {
    this.editingUserId = null;
    this.newUser = { firstName: '', lastName: '', email: '', password: '', role: 'AGENT', phoneNumber: '', address: '', city: '', agenceCode: '', region: '', insurerName: '', insurerEmail: '' };
    this.addUserError = '';
    this.showUserModal = true;
  }

  openEditUser(user: any): void {
    this.editingUserId = user.id;
    this.newUser = { firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', password: '', role: user.role || 'AGENT', phoneNumber: user.phoneNumber || '', address: user.address || '', city: user.city || '', agenceCode: user.agenceCode || '', region: user.region || '', insurerName: user.insurerName || '', insurerEmail: user.insurerEmail || '' };
    this.addUserError = '';
    this.showUserModal = true;
  }

  closeUserModal(): void { this.showUserModal = false; }
  openViewUser(user: any): void { this.viewUser = user; this.showViewUserModal = true; }
  closeViewUser(): void { this.showViewUserModal = false; }

  submitUser(): void {
    this.addUserError = '';
    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.email) { this.addUserError = 'Please fill in all required fields.'; return; }
    if (!this.editingUserId && !this.newUser.password) { this.addUserError = 'Password is required for a new account.'; return; }
    this.addUserLoading = true;
    if (this.editingUserId) {
      const payload: any = { firstName: this.newUser.firstName, lastName: this.newUser.lastName, email: this.newUser.email, phoneNumber: this.newUser.phoneNumber ? Number(this.newUser.phoneNumber) : null, address: this.newUser.address || null, city: this.newUser.city || null, role: this.newUser.role };
      if (this.newUser.password) payload.password = this.newUser.password;
      if (this.newUser.role === 'AGENT') { payload.agenceCode = this.newUser.agenceCode ? Number(this.newUser.agenceCode) : null; payload.region = this.newUser.region ? Number(this.newUser.region) : null; }
      else if (this.newUser.role === 'INSURER') { payload.insurerName = this.newUser.insurerName; payload.insurerEmail = this.newUser.insurerEmail; }
      this.http.put(`${this.API}/users/${this.editingUserId}`, payload).subscribe({
        next: () => { this.addUserLoading = false; this.showUserModal = false; this.cdr.detectChanges(); this.loadUsers(); },
        error: (err: any) => { this.addUserLoading = false; this.addUserError = err.error?.message || 'Error updating user.'; this.cdr.detectChanges(); }
      });
    } else {
      const payload: any = { firstName: this.newUser.firstName, lastName: this.newUser.lastName, email: this.newUser.email, password: this.newUser.password, role: this.newUser.role, phoneNumber: this.newUser.phoneNumber ? Number(this.newUser.phoneNumber) : null };
      if (this.newUser.role === 'AGENT') { payload.agenceCode = this.newUser.agenceCode ? Number(this.newUser.agenceCode) : null; payload.region = this.newUser.region ? Number(this.newUser.region) : null; }
      else if (this.newUser.role === 'INSURER') { payload.insurerName = this.newUser.insurerName; payload.insurerEmail = this.newUser.insurerEmail; }
      this.http.post(`${this.API}/auth/register`, payload).subscribe({
        next: () => { this.addUserLoading = false; this.showUserModal = false; this.cdr.detectChanges(); this.loadUsers(); },
        error: (err: any) => { this.addUserLoading = false; this.addUserError = err.error?.message || err.message || 'Error creating user.'; this.cdr.detectChanges(); }
      });
    }
  }

  deleteUser(id: number): void {
    this.http.delete(`${this.API}/users/${id}`).subscribe({
      next: () => this.loadUsers(),
      error: (err: any) => console.error('[ADMIN] Delete error:', err)
    });
  }

  getUserInitials(user: any): string {
    return ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase();
  }

  // ── Static data ──
  dossiers = [
    { ref: '#CR-2025-043', initials: 'BM', client: 'Bilel Mrabet', clientSince: 'Client since 2021', type: 'Real estate', amount: '85,000 TND', score: '742', scoreColor: '#2ECC71', status: 'Under review', statusClass: 'b-review' },
    { ref: '#CR-2025-051', initials: 'LB', client: 'Leila Bourguiba', clientSince: 'Client since 2023', type: 'Car loan', amount: '32,500 TND', score: '610', scoreColor: '#F39C12', status: 'Under review', statusClass: 'b-review' },
    { ref: '#CR-2025-059', initials: 'KH', client: 'Karim Hadj', clientSince: 'New client', type: 'Consumption', amount: '8,000 TND', score: '520', scoreColor: '#E74C3C', status: 'Pending', statusClass: 'b-pending' }
  ];

  activities = [
    { title: "Payment received — <b>Bilel Mrabet</b>", meta: "4 min ago · Transfer · #PAY-2026-028", value: "850 TND", color: "text-success", dotColor: "var(--success)" },
    { title: "New file submitted — <b>Karim Hadj</b>", meta: "18 min ago · Consumption", value: "8,000 TND", color: "", dotColor: "var(--blue)" },
    { title: "Default detected — <b>Farouk Ben Ali</b>", meta: "1h ago · #CR-2024-018 · D+3", value: "310 TND", color: "text-danger", dotColor: "var(--danger)" },
    { title: "Insurance renewed — <b>Amira Selmi</b>", meta: "2h ago · STAR · Toyota Corolla", value: "1,200 TND", color: "text-success", dotColor: "var(--success)" }
  ];

  topAgents = [
    { rank: 1, initials: "SA", name: "Sami Allani", desc: "18 approved files", score: "98%", scoreClass: "text-success" },
    { rank: 2, initials: "RK", name: "Rania Khelifi", desc: "14 approved files", score: "91%", scoreClass: "text-warning" },
    { rank: 3, initials: "MN", name: "Mohamed Naifar", desc: "11 approved files", score: "87%", scoreClass: "text-blue" }
  ];

  chartBars = [55, 70, 85, 60, 75, 90, 65, 80, 70, 95, 88, 100];

  creditDistribution = [
    { name: "Car loan", value: 20, pct: "42%", color: "#3B82F6" },
    { name: "Real estate", value: 12, pct: "26%", color: "#06B6D4" },
    { name: "Consumption", value: 10, pct: "21%", color: "#8B5CF6" },
    { name: "Other", value: 5, pct: "11%", color: "#CBD5E1" }
  ];

  delinquencies = [
    { initials: "FB", name: "Farouk Ben Ali", city: "Tunis", phone: "+216 20 111 222", dossier: "#CR-2024-018", product: "Consumption · 24 months", amount: "310 TND", delay: "D+3", risk: "Moderate", sms: "1 SMS · 0 call" },
    { initials: "HG", name: "Hanen Gharbi", city: "Sfax", phone: "+216 24 333 444", dossier: "#CR-2023-092", product: "Car loan · 60 months", amount: "890 TND", delay: "D+14", risk: "High", sms: "3 SMS · 2 calls" }
  ];

  pipelineColumns: PipelineColumn[] = [
    { title: "New", class: "ph-new", count: 8, cards: [{ name: "Karim Hadj", ref: "#CR-2025-059", amount: "8,000 TND", type: "Consumption" }, { name: "Marwa Ferchichi", ref: "#CR-2025-062", amount: "15,000 TND", type: "Car loan" }, { name: "Nizar Jlassi", ref: "#CR-2025-064", amount: "6,500 TND", type: "Consumption" }] },
    { title: "Analysis", class: "ph-analysis", count: 12, cards: [{ name: "Bilel Mrabet", ref: "#CR-2025-043", amount: "85,000 TND", type: "Real estate · 48h+", warn: true }, { name: "Leila Bourguiba", ref: "#CR-2025-051", amount: "32,500 TND", type: "Car loan · 48h+", warn: true }, { name: "Sonia Karray", ref: "#CR-2025-055", amount: "12,000 TND", type: "Consumption" }] }
  ];

  analysisFiles = [
    { ref: "#CR-2025-043", initials: "BM", name: "Bilel Mrabet", clientInfo: "Loyal client · 5 years", type: "Real estate", amount: "85,000 TND", duration: "180 months", score: 742, debtRatio: 28, seniority: "5 years", recommendation: "Favorable" },
    { ref: "#CR-2025-051", initials: "LB", name: "Leila Bourguiba", clientInfo: "Client · 2 years", type: "Car loan", amount: "32,500 TND", duration: "60 months", score: 610, debtRatio: 41, seniority: "2 years", recommendation: "To analyze" }
  ];

  payments = [
    { ref: "#PAY-2026-028", client: "Bilel Mrabet", file: "#CR-2024-001", fileType: "Car loan", amount: "260 TND", date: "28 Feb 2026", mode: "Transfer", status: "Paid", agent: "Auto" },
    { ref: "#PAY-2026-027", client: "Bilel Mrabet", file: "#CR-2024-018", fileType: "Consumption", amount: "310 TND", date: "28 Feb 2026", mode: "Direct Debit", status: "Paid", agent: "Auto" },
    { ref: "#PAY-2026-024", client: "Amira Selmi", file: "#CR-2024-015", fileType: "Consumption", amount: "420 TND", date: "25 Feb 2026", mode: "Cash", status: "Paid", agent: "Sami A." },
    { ref: "#PAY-2026-019", client: "Farouk Ben Ali", file: "#CR-2024-018", fileType: "Consumption", amount: "310 TND", date: "D+3", mode: "", status: "Pending", agent: "Rania K." }
  ];

  riskAlerts = [
    { initials: "FB", name: "Farouk Ben Ali", score: 468, motif: "Overdue D+3", encours: "7,800 TND", actionLabel: "Process", badgeClass: "b-danger" },
    { initials: "HG", name: "Hanen Gharbi", score: 412, motif: "Overdue D+14", encours: "12,400 TND", actionLabel: "Legal", badgeClass: "b-danger" },
    { initials: "RK", name: "Ridha Khelil", score: 538, motif: "Debt ratio 58%", encours: "19,200 TND", actionLabel: "Analyze", badgeClass: "b-review" }
  ];

  scoreDistribution = [
    { label: "800–850", pct: 18, color: "var(--success)" },
    { label: "700–799", pct: 54, color: "var(--success)" },
    { label: "600–699", pct: 19, color: "var(--warning)" },
    { label: "500–599", pct: 6, color: "var(--danger)" },
    { label: "< 500", pct: 3, color: "var(--danger)" }
  ];

  notificationsCritical = [
    { title: "Critical overdue — Hanen Gharbi — D+14", meta: "2 hours ago · #CR-2023-092 · 890 TND · Action required", type: "danger" },
    { title: "File waiting > 48h — #CR-2025-043 — Bilel Mrabet", meta: "3 hours ago · Real estate · 85,000 TND · Decision required", type: "warning" },
    { title: "Insurance expired — Toyota Corolla — Bilel Mrabet", meta: "5 hours ago · STAR-2025-048291 · Expires in 2 days", type: "danger" }
  ];

  notificationsRecent = [
    { title: "Payment received — Bilel Mrabet — 850 TND", meta: "4 min ago · Bank transfer · #PAY-2026-028", color: "success" },
    { title: "New file submitted — Karim Hadj", meta: "18 min ago · Consumption · 8,000 TND", color: "blue" },
    { title: "New client registered — Marwa Ferchichi", meta: "3 hours ago · Web channel · Sfax · KYC pending", color: "purple" },
    { title: "File approved — Amira Selmi — #CR-2025-037", meta: "Yesterday 16:42 · Car loan · 45,000 TND", color: "success" },
    { title: "Monthly report January 2026 available", meta: "Yesterday 08:00 · Auto generated", color: "blue" }
  ];

  reports = [
    { title: "Monthly report — Feb 2026", date: "Generated on 28/02/2026", actionLabel: "Download", outline: false },
    { title: "Monthly report — Jan 2026", date: "Generated on 31/01/2026", actionLabel: "Download", outline: true },
    { title: "Annual report — 2025", date: "Generated on 05/01/2026", actionLabel: "Download", outline: true }
  ];

  vehicles = [
    { plate: "267 TN 2022", name: "Toyota Corolla", desc: "Auto · Petrol · 2022", owner: "Bilel Mrabet", credit: "#CR-2024-001", value: "42,000 TND", km: "32,450 km", insurance: "⚠ 2 days", status: "Insured", statusClass: "b-review" },
    { plate: "158 TN 2019", name: "Kia Picanto", desc: "Manual · Petrol · 2019", owner: "Bilel Mrabet", credit: "Settled ✓", value: "18,500 TND", km: "78,200 km", insurance: "106 days", status: "Insured", statusClass: "b-actif" },
    { plate: "445 TN 2021", name: "Volkswagen Golf", desc: "Auto · Diesel · 2021", owner: "Amira Selmi", credit: "#CR-2024-015", value: "58,000 TND", km: "41,200 km", insurance: "210 days", status: "Insured", statusClass: "b-actif" }
  ];

  insuranceContracts = [
    { number: "STAR-2025-048291", client: "Bilel Mrabet", vehicle: "Toyota Corolla 2022", insurer: "STAR Assurance", type: "All Risks", premium: "1,200 TND", expiry: "28 Feb 2026", delay: "⚠ 2 days", delayClass: "b-danger", actions: ["Renew", "View"] },
    { number: "GAT-2024-019384", client: "Sonia Karray", vehicle: "Renault Clio 2020", insurer: "GAT Assurance", type: "Third Party Extended", premium: "640 TND", expiry: "10 Mar 2026", delay: "⚠ 10 days", delayClass: "b-review", actions: ["Renew", "View"] },
    { number: "MAGHREBIA-018742", client: "Hadi Jouini", vehicle: "Peugeot 208 2023", insurer: "Maghrebia", type: "All Risks", premium: "1,100 TND", expiry: "25 Mar 2026", delay: "25 days", delayClass: "b-pending", actions: ["Prepare", "View"] }
  ];

  settingsUsers = [
    { initials: "SA", name: "Sami Allani", email: "s.allani@finix.tn", role: "Super Admin", roleClass: "b-purple", lastLogin: "Today · 09:14", status: "Active" },
    { initials: "RK", name: "Rania Khelifi", email: "r.khelifi@finix.tn", role: "Advisor", roleClass: "b-blue", lastLogin: "Today · 08:45", status: "Active" },
    { initials: "MN", name: "Mohamed Naifar", email: "m.naifar@finix.tn", role: "Advisor", roleClass: "b-blue", lastLogin: "Yesterday · 17:30", status: "Active" }
  ];

  notificationsConfig: any = { overdueSms: true, renewalReminder: true, monthlyReport: true, fileAlert: true, autoScoring: false };

  dossier = {
    reference: '#CR-2025-043', status: 'Under review', submittedDate: '26/02/2026',
    client: { name: 'Bilel Mrabet', cin: '08 123 456', phone: '+216 20 123 456', email: 'bilel.mrabet@email.com' }
  };

  selectedFile: any;

  openModal(file: any) { this.selectedFile = file; this.showModal = true; }
  closeModal(event?: Event) { if (event) event.stopPropagation(); this.showModal = false; }
  approveCase() { console.log("Approved", this.decisionNote); this.closeModal(); }
  rejectCase() { console.log("Rejected", this.decisionNote); this.closeModal(); }
  requestMoreInfo() { console.log("More info requested", this.decisionNote); }
  goCredits() { console.log('Navigate credits'); }
  toggleConfig(key: string): void { if (this.notificationsConfig && key in this.notificationsConfig) this.notificationsConfig[key] = !this.notificationsConfig[key]; }

  loadSteeringDashboard(): void {
    this.steeringLoading = true;
    this.steeringError = false;
    this.dashboardService.getFullDashboard().subscribe({
      next: (data) => {
        this.steeringDashboard = data;
        this.steeringSalarySegments = data.defaultBySalary;
        this.steeringRegionSegments = data.defaultByRegion;
        this.steeringRiskIndicators = data.riskIndicators;
        this.steeringLoading = false;
        // [ML ADDED] load ML prediction after dashboard data is ready
        this.loadMlPrediction(this.steeringSelectedMonth);
        this.cdr.detectChanges();
      },
      error: () => {
        this.steeringError = true;
        this.steeringLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  
onSteeringMonthChange(month: string): void {
  console.log('[Dashboard] Month changed to:', month);
  this.steeringSelectedMonth = month; // force la valeur explicitement

  this.dashboardService.getDefaultRateBySalary(month).subscribe(
    data => { this.steeringSalarySegments = data; this.cdr.detectChanges(); }
  );
  this.dashboardService.getDefaultRateByRegion(month).subscribe(
    data => { this.steeringRegionSegments = data; this.cdr.detectChanges(); }
  );
  this.loadMlPrediction(month);
}

  getSteeringStatusClass(status: string): string {
    if (status === 'CRITICAL') return 'b-danger';
    if (status === 'WARNING') return 'b-review';
    return 'b-actif';
  }

  getSteeringTauxColor(taux: number): string {
    if (taux >= 40) return 'var(--danger)';
    if (taux >= 20) return 'var(--warning)';
    return 'var(--success)';
  }

  getSteeringBarWidth(taux: number): string {
    return Math.min(taux, 100) + '%';
  }

  // ─────────────────────────────────────────────────────────────
  // [ML ADDED] — All methods below are new — do not touch above
  // ─────────────────────────────────────────────────────────────

  /** Calls Spring Boot GET /api/dashboard/prediction?month=... */
  loadMlPrediction(month: string): void {
    this.mlLoading = true;
    this.mlError = false;
    this.dashboardService.getPrediction(month).subscribe({
      next: (data) => {
        this.mlPrediction = data;
        this.mlLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.mlError = true;
        this.mlLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Maps alertLevel string to existing badge CSS class */
  getMlAlertClass(level: string): string {
    const map: { [k: string]: string } = {
      SAFE:        'b-actif',
      WARNING:     'b-review',
      CRITICAL:    'b-danger',
      UNAVAILABLE: 'b-pending'
    };
    return map[level] || 'b-pending';
  }

  /** Returns contributions sorted by absolute value (most impactful first) */
  getMlContributions(): { label: string; value: number }[] {
    if (!this.mlPrediction?.contributions) return [];
    // Human-readable labels for each feature key coming from Flask
    const labels: { [k: string]: string } = {
      prev_default_rate:  'Previous Default Rate',
      sfax_concentration: 'Sfax Concentration',
      low_salary_share:   'Low Salary Share',
      avg_delay_days:     'Avg Delay Days',
      contract_volume:    'Contract Volume'
    };
    return Object.entries(this.mlPrediction.contributions)
      .map(([k, v]) => ({ label: labels[k] || k, value: v as number }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }

  /** Returns the largest absolute contribution — used to scale bar widths to 100% */
  getMlMaxContrib(): number {
    const c = this.getMlContributions();
    return c.length ? Math.max(...c.map(x => Math.abs(x.value))) : 1;
  }
}
