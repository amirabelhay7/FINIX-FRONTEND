import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ClientCreditsSearchService } from '../../services/client-credits-search.service';
import { AuthService } from '../../services/auth/auth.service';
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-frontoffice',
  standalone: true,
  templateUrl: './frontoffice.html',
  styleUrl: './frontoffice.css',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  encapsulation: ViewEncapsulation.None,
})
export class Frontoffice implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';

  navTabs = [
    { label: 'Dashboard', icon: '🏠', route: '/client/dashboard' },
    { label: 'My credits', icon: '💳', route: '/client/credits', badge: '3' },
    { label: 'Remboursements', icon: '💸', route: '/client/repayments', badge: '1', badgeClass: 'warn' },
    { label: 'Véhicules', icon: '🚗', route: '/client/vehicles' },
    { label: 'Events', icon: '📅', route: '/client/events' },
    { label: 'Group Chat', icon: '👥', route: '/client/group-chat' },
    { label: 'Assurance', icon: '🛡️', route: '/client/insurance' },
    { label: 'Wallet', icon: '👛', route: '/client/wallet' },
    { label: 'Mon Score', icon: '📊', route: '/client/score' },
    { label: 'Documents', icon: '📄', route: '/client/documents' }
  ];

  showUserDropdown = false;
  showChatGroupsDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
  userRole = '';
  chatGroups: { eventId: number; title: string; city: string }[] = [];
  chatGroupsLoading = false;
  chatGroupsError = '';

  /** Search box value used to filter credits by status on the credits page. */
  creditsSearchQuery = '';

  private creditsSearchSub?: Subscription;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private clientCreditsSearch: ClientCreditsSearchService,
    private authService: AuthService,
    private eventService: EventService,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadUser();
    this.creditsSearchQuery = this.clientCreditsSearch.getSearchQuery();
    this.creditsSearchSub = this.clientCreditsSearch.searchChanges.subscribe((q: string) => {
      this.creditsSearchQuery = q;
    });
    this.loadChatGroups();
  }

  private loadUser(): void {
    this.userName = this.authService.getUserName();
    this.userInitials = this.authService.getUserInitials();
    const payload = this.authService.getPayload();
    if (payload) {
      this.userEmail = payload.sub || '';
      this.userRole = payload.role || 'CLIENT';
    }
  }

  ngOnDestroy(): void {
    this.creditsSearchSub?.unsubscribe();
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  onCreditsSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.creditsSearchQuery = v;
    this.clientCreditsSearch.setSearchQuery(v);
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout() {
    this.showUserDropdown = false;
    this.authService.logout();
  }

  toggleChatGroupsDropdown(): void {
    this.showChatGroupsDropdown = !this.showChatGroupsDropdown;
    if (this.showChatGroupsDropdown && this.chatGroups.length === 0 && !this.chatGroupsLoading) {
      this.loadChatGroups();
    }
  }

  openChatGroup(eventId: number): void {
    this.showChatGroupsDropdown = false;
    this.router.navigate(['/client/group-chat'], { queryParams: { eventId } });
  }

  private loadChatGroups(): void {
    const userId = this.authService.getPayload()?.userId;
    if (!userId) {
      this.chatGroups = [];
      return;
    }

    this.chatGroupsLoading = true;
    this.chatGroupsError = '';

    this.eventService.getEventRegistrations(0, 1000).subscribe({
      next: (regs) => {
        const rows = Array.isArray(regs?.content) ? regs.content : [];
        const eventIds = Array.from(new Set(
          rows
            .filter((r) => Number(r.userId) === Number(userId) && !!r.eventId)
            .map((r) => Number(r.eventId))
            .filter((id) => Number.isInteger(id) && id > 0)
        ));

        if (eventIds.length === 0) {
          this.chatGroups = [];
          this.chatGroupsLoading = false;
          return;
        }

        this.eventService.getEvents(0, 1000).subscribe({
          next: (eventsResp) => {
            const events = Array.isArray(eventsResp?.content) ? eventsResp.content : [];
            const byId = new Map(events.map((ev) => [Number(ev.idEvent), ev]));
            this.chatGroups = eventIds
              .map((id) => byId.get(id))
              .filter((ev): ev is NonNullable<typeof ev> => !!ev)
              .map((ev) => ({
                eventId: Number(ev.idEvent),
                title: ev.title || `Event #${ev.idEvent}`,
                city: ev.city || '-',
              }));
            this.chatGroupsLoading = false;
          },
          error: () => {
            this.chatGroups = [];
            this.chatGroupsError = 'Unable to load your groups.';
            this.chatGroupsLoading = false;
          },
        });
      },
      error: () => {
        this.chatGroups = [];
        this.chatGroupsError = 'Unable to load your registrations.';
        this.chatGroupsLoading = false;
      },
    });
  }
}
