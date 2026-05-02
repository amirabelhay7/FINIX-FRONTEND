import { Component, Input } from '@angular/core';
import { VehicleCondition, VehicleDto, VehicleStatus } from '../../../../../../models';

@Component({
  selector: 'app-vehicle-card',
  standalone: false,
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.css',
})
export class VehicleCardComponent {
  private _vehicle!: VehicleDto;
  private imageUrls: string[] = [];
  currentImageIndex = 0;

  @Input({ required: true })
  set vehicle(value: VehicleDto) {
    this._vehicle = value;
    this.imageUrls = this.parseImageUrls(value?.imageUrl ?? null);
    this.currentImageIndex = 0;
    this.hasImageError = false;
  }

  get vehicle(): VehicleDto {
    return this._vehicle;
  }
  @Input() disableReserve = false;
  @Input() statusLabels: Record<VehicleStatus, string> = {
    DISPONIBLE: 'Available',
    RESERVE: 'Reserved',
    VENDU: 'Sold',
    INACTIF: 'Inactive',
  };

  readonly conditionLabels: Record<VehicleCondition, string> = {
    NEUF: 'New',
    TRES_BON: 'Very good',
    BON: 'Good',
    MOYEN: 'Fair',
    MAUVAIS: 'Poor',
  };

  hasImageError = false;

  get showImage(): boolean {
    return !!this.activeImageUrl && !this.hasImageError;
  }

  get hasMultipleImages(): boolean {
    return this.imageUrls.length > 1;
  }

  get activeImageUrl(): string | null {
    if (!this.imageUrls.length) return null;
    const idx = Math.min(Math.max(this.currentImageIndex, 0), this.imageUrls.length - 1);
    return this.imageUrls[idx];
  }

  get imageDotIndexes(): number[] {
    return this.imageUrls.map((_, idx) => idx);
  }

  onImageError(): void {
    this.hasImageError = true;
  }

  prevImage(ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    if (this.imageUrls.length <= 1) return;
    this.hasImageError = false;
    const total = this.imageUrls.length;
    this.currentImageIndex = (this.currentImageIndex - 1 + total) % total;
  }

  nextImage(ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    if (this.imageUrls.length <= 1) return;
    this.hasImageError = false;
    const total = this.imageUrls.length;
    this.currentImageIndex = (this.currentImageIndex + 1) % total;
  }

  setImage(index: number, ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    if (this.imageUrls.length <= 1) return;
    if (index < 0 || index >= this.imageUrls.length) return;
    this.hasImageError = false;
    this.currentImageIndex = index;
  }

  private parseImageUrls(raw: string | null): string[] {
    if (!raw) return [];
    return raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  get canReserve(): boolean {
    return this.vehicle.status === 'DISPONIBLE' && this.vehicle.active && !this.disableReserve;
  }

  get conditionLabel(): string {
    const c = this.vehicle?.etatVehicule;
    if (!c) return 'Not specified';
    return this.conditionLabels[c] ?? c;
  }
}
