import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-location-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-bubble.component.html',
  styleUrl: './location-bubble.component.scss',
})
export class LocationBubbleComponent implements AfterViewInit, OnDestroy {
  @Input() lat = 0;
  @Input() lng = 0;
  @Input() address?: string;

  @ViewChild('mapHost') mapHost?: ElementRef<HTMLDivElement>;

  private map: L.Map | null = null;

  constructor(private zone: NgZone) {}

  /** Derived in a getter — avoids NG0100 (value changed after check) from assigning in ngAfterViewInit. */
  get captionText(): string {
    const addr = this.address?.trim();
    if (addr) return addr;
    const la = Number(this.lat);
    const ln = Number(this.lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return '';
    return `${la.toFixed(5)}, ${ln.toFixed(5)}`;
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      queueMicrotask(() => this.mountMap());
    });
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private destroyMap(): void {
    try {
      this.map?.remove();
    } finally {
      this.map = null;
    }
  }

  private mountMap(): void {
    const el = this.mapHost?.nativeElement;
    if (!el || this.map) return;

    this.destroyMap();

    const map = L.map(el, {
      zoomControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false,
      attributionControl: false,
    }).setView([this.lat, this.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: 'loc-pin-host',
      html: '<div class="loc-pin-dot"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    L.marker([this.lat, this.lng], { icon }).addTo(map);

    this.map = map;
    queueMicrotask(() => {
      map.invalidateSize();
    });
  }
}
