import { Component } from '@angular/core';
import { AgentLocation } from '../../../models';

/**
 * ViewModel: agent top-up (MVVM).
 */
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
}
