import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

export type LocationPickResult = {
  lat: number;
  lng: number;
  address?: string;
};

@Component({
  selector: 'app-location-map-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-map-picker.component.html',
  styleUrl: './location-map-picker.component.scss',
})
export class LocationMapPickerComponent implements AfterViewInit, OnDestroy {
  @Input() initialLat = 36.8065;
  @Input() initialLng = 10.1815;

  /** Renamed so Angular never treats `$event` as DOM `Event` when the picker isn’t wired as a directive. */
  @Output() readonly pickerClosed = new EventEmitter<void>();
  @Output() readonly locationChosen = new EventEmitter<LocationPickResult>();

  @ViewChild('mapEl') mapEl?: ElementRef<HTMLDivElement>;

  lat = 0;
  lng = 0;
  confirming = false;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor(
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit(): void {
    this.lat = Number(this.initialLat);
    this.lng = Number(this.initialLng);
    this.zone.runOutsideAngular(() => {
      queueMicrotask(() => this.initMap());
    });
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  cancel(): void {
    this.pickerClosed.emit();
  }

  onBackdropClick(ev: MouseEvent): void {
    if (ev.target === ev.currentTarget) {
      this.cancel();
    }
  }

  async confirmPick(): Promise<void> {
    if (this.confirming) return;
    this.confirming = true;
    let address: string | undefined;
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(String(this.lat))}&lon=${encodeURIComponent(String(this.lng))}&zoom=18&accept-language=fr`;
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (r.ok) {
        const j = (await r.json()) as { display_name?: string };
        if (typeof j?.display_name === 'string') {
          address = j.display_name;
        }
      }
    } catch {
      // CORS/network: still share coordinates
    }

    this.confirming = false;
    this.zone.run(() => {
      this.cdr.markForCheck();
      this.locationChosen.emit({
        lat: this.lat,
        lng: this.lng,
        address: address?.trim() || undefined,
      });
    });
  }

  /** For template binding — values update from marker; avoid mutating unrelated state in hooks. */
  coordsLabel(): string {
    const la = Number(this.lat);
    const ln = Number(this.lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) return '';
    return `${la.toFixed(5)}, ${ln.toFixed(5)}`;
  }

  private initMap(): void {
    const el = this.mapEl?.nativeElement;
    if (!el) return;

    const map = L.map(el, { zoomControl: true }).setView([this.lat, this.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const icon = L.divIcon({
      className: 'lmp-pin-host',
      html: '<div class="lmp-pin-dot"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    this.marker = L.marker([this.lat, this.lng], { icon, draggable: true }).addTo(map);
    this.map = map;

    const syncFromMarker = (): void => {
      const ll = this.marker!.getLatLng();
      this.lat = ll.lat;
      this.lng = ll.lng;
      this.zone.run(() => {
        /* trigger template coords update */
      });
    };

    this.marker.on('dragend', () => {
      syncFromMarker();
      this.zone.run(() => this.cdr.markForCheck());
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker!.setLatLng(e.latlng);
      this.lat = e.latlng.lat;
      this.lng = e.latlng.lng;
      this.zone.run(() => this.cdr.markForCheck());
    });

    queueMicrotask(() => {
      map.invalidateSize();
    });
  }

  private destroyMap(): void {
    try {
      this.map?.remove();
    } finally {
      this.map = null;
      this.marker = null;
    }
  }
}
