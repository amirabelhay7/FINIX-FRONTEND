import { Component } from '@angular/core';

/**
 * ViewModel: upload contract (MVVM).
 */
@Component({
  selector: 'app-upload-contract',
  standalone: false,
  templateUrl: './upload-contract.html',
  styleUrl: './upload-contract.css',
})
export class UploadContract {
  readonly pageTitle = 'Upload Contract';
  readonly pageSubtitle = 'After transfer of ownership with the seller, upload the signed contract.';
  readonly backRoute = '/credit/application/1';
  readonly infoText = 'The vehicle is registered as IMF property until the loan is fully repaid. Once we verify the contract, your loan becomes active.';
  readonly dropLabel = 'Drop signed contract (PDF) or click to browse';
  readonly dropHint = 'PDF · max 10 MB';
  readonly submitLabel = 'Submit contract';
}
