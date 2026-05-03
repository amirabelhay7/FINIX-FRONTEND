import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: false,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css',
})
export class EmptyStateComponent {
  @Input() title = 'No result';
  @Input() description = 'No item matches your criteria.';
  @Input() actionLabel = 'Reset filters';
  @Output() action = new EventEmitter<void>();
}
