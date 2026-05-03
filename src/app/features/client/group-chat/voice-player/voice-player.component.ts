import { CommonModule } from '@angular/common';
import { Component, HostBinding, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-voice-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voice-player.component.html',
  styleUrl: './voice-player.component.scss',
})
export class VoicePlayerComponent implements OnDestroy {
  @Input() audioUrl = '';
  @Input() variant: 'incoming' | 'outgoing' = 'incoming';

  @HostBinding('class.voice-player--playing') playing = false;

  durationLabel = '00:00';
  readonly barIndexes = Array.from({ length: 20 }, (_, i) => i);

  private audio: HTMLAudioElement | null = null;

  toggle(): void {
    if (!this.audioUrl) {
      return;
    }
    if (!this.audio) {
      this.audio = new Audio(this.audioUrl);
      this.audio.preload = 'metadata';
      this.audio.addEventListener('ended', () => {
        this.playing = false;
      });
      this.audio.addEventListener('pause', () => {
        this.playing = false;
      });
      this.audio.addEventListener('play', () => {
        this.playing = true;
      });
      this.audio.addEventListener('loadedmetadata', () => this.refreshDurationLabel());
      this.audio.addEventListener('timeupdate', () => this.refreshDurationLabel());
    }
    if (this.audio.paused) {
      void this.audio.play().catch(() => {
        this.playing = false;
      });
    } else {
      this.audio.pause();
    }
  }

  barScale(i: number): number {
    const v =
      Math.sin(i * 0.85 + 0.35) * 0.42 +
      Math.sin(i * 1.73 + 1.12) * 0.38 +
      0.92;
    return Math.max(0.25, Math.min(1, v));
  }

  ngOnDestroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
  }

  private refreshDurationLabel(): void {
    const a = this.audio;
    if (!a || !Number.isFinite(a.duration) || a.duration === Infinity) {
      return;
    }
    const secs = Math.max(0, Math.floor(a.duration));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    this.durationLabel = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}
