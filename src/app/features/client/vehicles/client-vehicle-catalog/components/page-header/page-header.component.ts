import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: false,
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.css',
})
export class PageHeaderComponent {
  @Input() total = 0;
}
