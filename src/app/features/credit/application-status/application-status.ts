import { Component } from '@angular/core';
import { ApplicationStep } from '../../../models';

/**
 * ViewModel: application status pipeline (MVVM).
 */
@Component({
  selector: 'app-application-status',
  standalone: false,
  templateUrl: './application-status.html',
  styleUrl: './application-status.css',
})
export class ApplicationStatus {
  readonly pageTitle = 'Application Status';
  readonly pageSubtitle = 'Vehicle credit · Request #REQ-2025-008';
  readonly pipelineTitle = 'Where you are';

  readonly steps: ApplicationStep[] = [
    { title: 'Applied', subtitle: 'Jan 10, 2025', icon: 'check_circle', iconBgClass: 'bg-green-100', iconColorClass: 'text-green-600', isActive: false, isDone: true },
    { title: 'Preliminarily approved', subtitle: 'You were notified · Jan 12, 2025', icon: 'check_circle', iconBgClass: 'bg-green-100', iconColorClass: 'text-green-600', isActive: false, isDone: true },
    { title: 'Agent verification', subtitle: 'Visit an agent with your ID to complete', icon: 'person_search', iconBgClass: 'bg-amber-100', iconColorClass: 'text-amber-600', isActive: true, isDone: false, linkRoute: '/wallet/agent-top-up', linkLabel: 'Find agent' },
    { title: 'Down payment', subtitle: 'Pay from wallet after verification', icon: 'payments', iconBgClass: 'bg-gray-100', iconColorClass: 'text-gray-400', isActive: false, isDone: false },
    { title: 'Seller contacted', subtitle: 'Transfer of ownership outside app', icon: 'handshake', iconBgClass: 'bg-gray-100', iconColorClass: 'text-gray-400', isActive: false, isDone: false },
    { title: 'Contract uploaded', subtitle: 'Vehicle is IMF property until paid', icon: 'description', iconBgClass: 'bg-gray-100', iconColorClass: 'text-gray-400', isActive: false, isDone: false },
  ];
}
