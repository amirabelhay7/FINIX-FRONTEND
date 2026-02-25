import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AgentLocation } from '../../../models';
import { AuthService } from '../../../core/auth/auth.service';
import { WalletService } from '../../../core/wallet/wallet.service';

@Component({
  selector: 'app-agent-top-up',
  standalone: false,
  templateUrl: './agent-top-up.html',
  styleUrl: './agent-top-up.css',
})
export class AgentTopUp {
  readonly pageTitle = 'Top up via Agent';
  readonly pageSubtitle = 'Give cash to an agent — they load your wallet. No card needed.';
  readonly howItWorksTitle = 'How it works';
  readonly howItWorksText = '1. Find an agent near you. 2. Give them cash and your phone number. 3. Agent loads your FINIX wallet. 4. You get a notification when the money is in.';
  readonly findAgentTitle = 'Find an agent';
  readonly searchPlaceholder = 'City or address...';
  readonly nearYouTitle = 'Near you';

  readonly agents: AgentLocation[] = [
    { name: 'Agence FINIX Tunis Centre', address: 'Av. Habib Bourguiba, Tunis · Open until 6 PM', distance: '0.8 km', distanceClass: 'text-green-600' },
    { name: 'Point FINIX La Marsa', address: 'Rue de la République, La Marsa · Open until 8 PM', distance: '2.1 km', distanceClass: 'text-gray-500' },
  ];

  /** Shown when current user is AGENT: form to credit a client's wallet */
  clientEmail = '';
  amount: number | null = null;
  description = '';
  submitting = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private router: Router,
  ) {}

  get isAgent(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'AGENT';
  }

  submitTopUp(): void {
    const email = (this.clientEmail || '').trim();
    const amt = this.amount != null ? Number(this.amount) : 0;
    if (!email) {
      this.error = 'Enter client email.';
      return;
    }
    if (amt <= 0) {
      this.error = 'Enter a valid amount.';
      return;
    }
    this.error = null;
    this.submitting = true;
    this.walletService.agentTopUp(email, amt, this.description || undefined).subscribe({
      next: () => this.router.navigate(['/wallet']),
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || err?.message || 'Top-up failed';
      },
    });
  }
}
