import { Component } from '@angular/core';

@Component({
  selector: 'app-client-insurance',
  standalone: false,
  templateUrl: './insurance.html',
  styleUrl: './insurance.css',
})
/**
 * @deprecated This page is not mounted in routing.
 * Client insurance is implemented in `src/app/features/insurance/*` and is mounted under `/client/insurance/*`.
 */
export class ClientInsurance {}
