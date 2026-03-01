import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {

  @Output() pageChanged = new EventEmitter<string>();

  currentPage = 'dashboard';

  switchPage(page: string) {
    this.currentPage = page;
    this.pageChanged.emit(page);
  }
}
