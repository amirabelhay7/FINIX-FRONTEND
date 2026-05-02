import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { RecommendedVehicleDto, VehicleCondition } from '../../../../../../models';

@Component({
  selector: 'app-vehicle-recommendations',
  standalone: false,
  templateUrl: './vehicle-recommendations.component.html',
  styleUrl: './vehicle-recommendations.component.css',
})
export class VehicleRecommendationsComponent implements OnChanges {
  @Input() recommendations: RecommendedVehicleDto[] = [];
  @Input() loading = false;
  @Input() error = '';
  @Output() refresh = new EventEmitter<void>();

  activeTooltipId: number | null = null;
  imageIndexes: Record<number, number> = {};
  imageUrlsById: Record<number, string[]> = {};
  hasImageError: Record<number, boolean> = {};

  readonly conditionLabels: Record<VehicleCondition, string> = {
    NEUF: 'Neuf',
    TRES_BON: 'Tres bon',
    BON: 'Bon',
    MOYEN: 'Moyen',
    MAUVAIS: 'Mauvais',
  };

  ngOnChanges(_: SimpleChanges): void {
    this.activeTooltipId = null;
    this.imageIndexes = {};
    this.imageUrlsById = {};
    this.hasImageError = {};
    for (const v of this.recommendations) {
      this.imageUrlsById[v.id] = this.parseImageUrls(v.imageUrl ?? null);
      this.imageIndexes[v.id] = 0;
    }
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  toggleTooltip(id: number): void {
    this.activeTooltipId = this.activeTooltipId === id ? null : id;
  }

  scoreColor(score: number): string {
    if (score >= 75) return '#16a34a';
    if (score >= 50) return '#ca8a04';
    return '#dc2626';
  }

  onImageError(id: number): void {
    this.hasImageError[id] = true;
  }

  showImage(v: RecommendedVehicleDto): boolean {
    return !!this.activeImageUrl(v) && !this.hasImageError[v.id];
  }

  conditionLabel(v: RecommendedVehicleDto): string {
    const c = v.etatVehicule;
    if (!c) return 'Non renseigne';
    return this.conditionLabels[c] ?? c;
  }

  hasMultipleImages(v: RecommendedVehicleDto): boolean {
    return this.getImageUrls(v).length > 1;
  }

  imageDotIndexes(v: RecommendedVehicleDto): number[] {
    const urls = this.getImageUrls(v);
    return urls.map((_, idx) => idx);
  }

  activeImageUrl(v: RecommendedVehicleDto): string | null {
    const urls = this.getImageUrls(v);
    if (!urls.length) return null;
    const idxRaw = this.imageIndexes[v.id] ?? 0;
    const idx = Math.min(Math.max(idxRaw, 0), urls.length - 1);
    return urls[idx];
  }

  prevImage(v: RecommendedVehicleDto, ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    const urls = this.getImageUrls(v);
    if (urls.length <= 1) return;
    this.hasImageError[v.id] = false;
    const total = urls.length;
    const idxRaw = this.imageIndexes[v.id] ?? 0;
    this.imageIndexes[v.id] = (idxRaw - 1 + total) % total;
  }

  nextImage(v: RecommendedVehicleDto, ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    const urls = this.getImageUrls(v);
    if (urls.length <= 1) return;
    this.hasImageError[v.id] = false;
    const total = urls.length;
    const idxRaw = this.imageIndexes[v.id] ?? 0;
    this.imageIndexes[v.id] = (idxRaw + 1) % total;
  }

  setImage(v: RecommendedVehicleDto, index: number, ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    const urls = this.getImageUrls(v);
    if (urls.length <= 1) return;
    if (index < 0 || index >= urls.length) return;
    this.hasImageError[v.id] = false;
    this.imageIndexes[v.id] = index;
  }

  private getImageUrls(v: RecommendedVehicleDto): string[] {
    return this.imageUrlsById[v.id] ?? this.parseImageUrls(v.imageUrl ?? null);
  }

  private parseImageUrls(raw: string | null): string[] {
    if (!raw) return [];
    return raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
}
