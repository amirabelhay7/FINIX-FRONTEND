import { Component } from '@angular/core';

/**
 * Placeholder for Insurer area (invite-only partners). Full UI in later modules.
 */
@Component({
  selector: 'app-insurer-dashboard',
  standalone: false,
  template: `
    <div class="p-8 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Insurer area</h1>
      <p class="text-gray-600">Micro-insurance products, calculations, and claims will be available here.</p>
    </div>
  `
})
export class InsurerDashboard {}
