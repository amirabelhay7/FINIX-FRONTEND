import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Partage la saisie de la barre de recherche du frontoffice avec la page Crédits client
 * pour filtrer les demandes par statut (PENDING, APPROVED, REJECTED).
 */
@Injectable({
  providedIn: 'root',
})
export class ClientCreditsSearchService {
  private readonly query$ = new BehaviorSubject<string>('');

  /** Flux émis à chaque changement de recherche (pour rafraîchir la liste filtrée). */
  readonly searchChanges: Observable<string> = this.query$.asObservable();

  setSearchQuery(value: string): void {
    this.query$.next(value);
  }

  getSearchQuery(): string {
    return this.query$.value;
  }
}
