import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../../services/auth/auth.service';
import {
  ChatMessageKind,
  EventChatMessageDto,
  EventChatSendPayload,
  EventDto,
  EventService,
} from '../../../services/event.service';
import { EventChatSocketService } from '../../../services/event/event-chat-socket.service';
import { environment } from '../../../../environments/environment';
import type { LocationPickResult } from './location-map-picker/location-map-picker.component';
import { LocationBubbleComponent } from './location-bubble/location-bubble.component';
import { LocationMapPickerComponent } from './location-map-picker/location-map-picker.component';
import { VoicePlayerComponent } from './voice-player/voice-player.component';

type ChatGroupVm = {
  eventId: number;
  title: string;
  city: string;
  address: string;
  unreadCount: number;
};

type TimelineRow =
  | { kind: 'day'; label: string }
  | { kind: 'msg'; msg: EventChatMessageDto };

const EMOJI_PRESET = [
  '😀',
  '😂',
  '😍',
  '😎',
  '🙏',
  '👍',
  '❤️',
  '🔥',
  '✅',
  '⚠️',
  '🎉',
  '🎯',
];

@Component({
  selector: 'app-client-group-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VoicePlayerComponent,
    LocationBubbleComponent,
    LocationMapPickerComponent,
  ],
  templateUrl: './group-chat.html',
  styleUrl: './group-chat.scss',
})
export class ClientGroupChat implements OnInit, OnDestroy {
  @ViewChild('msgScroll') msgScroll?: ElementRef<HTMLElement>;
  @ViewChild('emojiPanel', { static: false }) emojiPanel?: ElementRef<HTMLElement>;

  groups: ChatGroupVm[] = [];
  selectedGroup: ChatGroupVm | null = null;
  sidebarOpen = false;

  loadingGroups = false;
  groupsError = '';

  loadingMessages = false;
  timelineRows: TimelineRow[] = [];
  messages: EventChatMessageDto[] = [];
  messageInput = '';
  sendLoading = false;
  leaveLoading = false;
  messageError = '';
  canChat = false;

  showEmojiPicker = false;

  recordingUi = false;
  recordingActive = false;
  discardRecording = false;

  /** After recording stops: user must tap "Send voice message". */
  voiceDraft: { blob: Blob; mime: string } | null = null;

  locationPickerOpen = false;
  locationPickerLat = 36.8065;
  locationPickerLng = 10.1815;

  private readonly boundDocPu = () => void this.finishRecordingFlow();

  private mediaRecorder: MediaRecorder | null = null;
  private recordMime = 'audio/webm';
  private recordChunks: Blob[] = [];
  private recordStream: MediaStream | null = null;

  private routeSub?: Subscription;
  private chatSub?: Subscription;

  constructor(
    private authService: AuthService,
    private eventService: EventService,
    private eventChatSocketService: EventChatSocketService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadGroups();
    this.routeSub = this.route.queryParamMap.subscribe((params) => {
      const rawEventId = Number(params.get('eventId'));
      if (Number.isInteger(rawEventId) && rawEventId > 0) {
        this.trySelectGroup(rawEventId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.chatSub?.unsubscribe();
    this.eventChatSocketService.disconnect();
    this.teardownRecording(true);
    document.removeEventListener('pointerup', this.boundDocPu, true);
  }

  /** Mobile drawer: swipe / overlay close support */
  @HostListener('window:keydown.escape')
  onEsc(): void {
    this.sidebarOpen = false;
    this.showEmojiPicker = false;
  }

  @HostListener('window:focus')
  onWinFocus(): void {
    void this.pullUnreadSidebar();
  }

  @HostListener('document:pointerdown', ['$event'])
  onDocPointerDown(ev: PointerEvent): void {
    if (!this.showEmojiPicker || !this.emojiPanel) return;
    const root = this.emojiPanel.nativeElement;
    const t = ev.target as Node | null;
    if (t && !root.contains(t)) {
      this.showEmojiPicker = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleEmoji(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  appendEmoji(ch: string): void {
    this.messageInput += ch;
    this.showEmojiPicker = false;
    this.cdr.markForCheck();
  }

  selectGroup(group: ChatGroupVm): void {
    this.selectedGroup = group;
    this.sidebarOpen = false;
    this.messageInput = '';
    this.messageError = '';
    this.discardRecording = false;
    this.voiceDraft = null;
    this.locationPickerOpen = false;
    this.timelineRows = [];
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { eventId: group.eventId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.loadMessagesForSelectedGroup();
  }

  msgKind(m: EventChatMessageDto): ChatMessageKind {
    const raw = String(m.type || 'TEXT').trim().toUpperCase();
    if (raw === 'VOICE' || raw === 'LOCATION') return raw;
    return 'TEXT';
  }

  resolveMediaUrl(raw?: string): string {
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw.trim();
    const base = environment.apiBaseUrl.replace(/\/api$/i, '');
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${base}${path}`;
  }

  isMine(msg: EventChatMessageDto): boolean {
    const uid = this.getConnectedUserId();
    return uid !== null && Number(msg.userId) === Number(uid);
  }

  sendText(): void {
    const eventId = this.selectedGroup?.eventId;
    const userId = this.getConnectedUserId();
    const content = this.messageInput.trim();
    if (!eventId || !userId || !content || !this.canChat || this.loadingMessages) return;

    this.messageError = '';
    this.messageInput = '';

    const payload: EventChatSendPayload = { userId, type: 'TEXT', content };

    if (this.eventChatSocketService.isConnected()) {
      this.dispatchOverSocket(eventId, payload);
      void this.pullUnreadSidebar();
      this.cdr.markForCheck();
      return;
    }

    this.sendLoading = true;
    this.eventService
      .sendEventChatPayload(eventId, payload)
      .pipe(finalize(() => this.setSendLoading(false)))
      .subscribe({
        next: (response) =>
          this.applyOutgoingHttpResponse(response, eventId, userId, content, 'TEXT'),
        error: (err: unknown) => this.setOutgoingError(err, 'TEXT'),
      });
  }

  /** Opens fullscreen map — user picks any point, then shares location. */
  openLocationPicker(): void {
    if (!this.canChat || this.loadingMessages || this.sendLoading) return;
    if (!this.selectedGroup || !this.getConnectedUserId()) return;

    this.messageError = '';

    const fallback = (): void => this.openLocationPickerAt(36.8065, 10.1815);

    if (!navigator.geolocation) {
      fallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.openLocationPickerAt(pos.coords.latitude, pos.coords.longitude);
      },
      () => fallback(),
      { enableHighAccuracy: false, timeout: 4500, maximumAge: 120_000 },
    );
  }

  onLocationPickerDismiss(): void {
    this.locationPickerOpen = false;
    this.cdr.markForCheck();
  }

  onLocationPicked(ev: LocationPickResult): void {
    this.locationPickerOpen = false;
    const userId = this.getConnectedUserId();
    const eventId = this.selectedGroup?.eventId;
    if (!userId || !eventId || !this.canChat) return;

    const payload: EventChatSendPayload = {
      userId,
      type: 'LOCATION',
      lat: ev.lat,
      lng: ev.lng,
      address: ev.address,
      content: '',
    };
    this.dispatchChatPayload(payload);
    this.cdr.markForCheck();
  }

  private openLocationPickerAt(lat: number, lng: number): void {
    this.locationPickerLat = lat;
    this.locationPickerLng = lng;
    this.locationPickerOpen = true;
    this.ngZone.run(() => this.cdr.markForCheck());
  }

  onMicPointerDown(ev: PointerEvent): void {
    ev.preventDefault();
    if (!this.canChat || this.loadingMessages || this.recordingUi || this.sendLoading) return;
    if (this.voiceDraft) {
      this.messageError = 'Send or delete the current voice message first.';
      return;
    }
    this.discardRecording = false;
    void this.beginRecordingHold();
  }

  clearVoiceDraft(): void {
    this.voiceDraft = null;
    this.messageError = '';
    this.cdr.markForCheck();
  }

  sendVoiceDraft(): void {
    if (!this.voiceDraft || !this.selectedGroup?.eventId || !this.canChat) return;
    const userId = this.getConnectedUserId();
    const eventId = this.selectedGroup.eventId;
    const { blob, mime } = this.voiceDraft;
    this.voiceDraft = null;
    this.messageError = '';

    const ext = /webm/i.test(mime) ? 'webm' : /mp4|aac/i.test(mime) ? 'm4a' : 'wav';
    if (!userId) return;

    this.sendLoading = true;
    this.eventService
      .uploadChatAudio(blob, `voice.${ext}`)
      .pipe(
        finalize(() => this.setSendLoading(false)),
        catchError(() => {
          this.messageError = 'Unable to send voice message.';
          return of(null);
        }),
      )
      .subscribe((resp) => {
        if (!resp?.audioUrl) return;
        const payload: EventChatSendPayload = {
          userId,
          type: 'VOICE',
          audioUrl: resp.audioUrl,
          content: '',
        };
        this.dispatchChatPayload(payload);
      });
  }

  cancelRecording(): void {
    this.discardRecording = true;
    this.finishRecordingFlow();
  }

  leaveGroup(): void {
    const eventId = this.selectedGroup?.eventId;
    const userId = this.getConnectedUserId();
    if (!eventId || !userId) return;

    this.setLeaveLoading(true);
    this.messageError = '';
    this.eventService
      .leaveEventChatGroup(eventId, userId)
      .pipe(finalize(() => this.setLeaveLoading(false)))
      .subscribe({
        next: () => {
          this.canChat = false;
          this.messages = [];
          this.rebuildTimeline();
          this.localStorageForgetRead(eventId);
          this.messageError = 'You left this group.';
          this.eventChatSocketService.disconnect();
          this.chatSub?.unsubscribe();
          this.chatSub = undefined;
          this.groups = this.groups.filter((g) => g.eventId !== eventId);
          this.selectedGroup = this.groups[0] ?? null;
          if (this.selectedGroup) {
            this.loadMessagesForSelectedGroup();
          } else {
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: { eventId: null },
              queryParamsHandling: 'merge',
              replaceUrl: true,
            });
          }
        },
        error: (err: unknown) => {
          this.messageError =
            this.resolveErr(err) || 'Unable to leave the group.';
        },
      });
  }

  /**
   * Must be an arrow function: `*ngFor` trackBy is invoked without a component `this` binding.
   * A plain method would make `this.msgKind` undefined at runtime.
   */
  readonly trackTimeline = (_idx: number, row: TimelineRow): string => {
    if (row.kind === 'day') {
      return `day:${row.label}`;
    }
    const m = row.msg;
    return `m:${String(m.id ?? '')}:${m.sentAt ?? ''}:${String(m.audioUrl ?? '')}:${String(m.lat ?? '')}:${String(m.lng ?? '')}:${this.msgKind(m)}`;
  };

  private async beginRecordingHold(): Promise<void> {
    try {
      this.voiceDraft = null;
      this.recordingUi = true;
      this.messageError = '';
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime =
        typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/mp4';
      this.recordMime = mime;
      this.recordStream = stream;
      this.recordChunks = [];
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) this.recordChunks.push(evt.data);
      };
      this.mediaRecorder = rec;
      rec.start(240);
      this.recordingActive = true;
      document.addEventListener('pointerup', this.boundDocPu, true);
      this.ngZone.run(() => this.cdr.markForCheck());
    } catch {
      this.recordingUi = false;
      this.recordingActive = false;
      this.messageError =
        this.messageError ||
        'Microphone unavailable. Please allow microphone access.';
      this.ngZone.run(() => this.cdr.markForCheck());
    }
  }

  private async finishRecordingFlow(): Promise<void> {
    document.removeEventListener('pointerup', this.boundDocPu, true);
    const shouldDiscard = this.discardRecording;
    this.discardRecording = false;
    const rec = this.mediaRecorder;
    this.mediaRecorder = null;
    const stream = this.recordStream;
    this.recordStream = null;
    stream?.getTracks().forEach((tr) => tr.stop());

    if (!rec || rec.state === 'inactive') {
      this.recordingUi = false;
      this.recordingActive = false;
      if (shouldDiscard) {
        this.recordChunks = [];
      }
      this.ngZone.run(() => this.cdr.markForCheck());
      return;
    }

    await new Promise<void>((resolve) => {
      rec.addEventListener('stop', () => resolve(), { once: true });
      try {
        rec.stop();
      } catch {
        resolve();
      }
    });

    this.recordingUi = false;
    this.recordingActive = false;
    const blob = new Blob(this.recordChunks, { type: this.recordMime });
    this.recordChunks = [];
    if (shouldDiscard) {
      this.ngZone.run(() => this.cdr.markForCheck());
      return;
    }

    if (blob.size < 520) {
      this.messageError = 'Recording is too short.';
      this.ngZone.run(() => this.cdr.markForCheck());
      return;
    }

    this.voiceDraft = { blob, mime: this.recordMime };
    this.ngZone.run(() => this.cdr.markForCheck());
  }

  private teardownRecording(force: boolean): void {
    this.discardRecording = force;
    void this.finishRecordingFlow();
  }

  private dispatchChatPayload(payload: EventChatSendPayload): void {
    const eventId = this.selectedGroup!.eventId;
    if (this.eventChatSocketService.isConnected()) {
      this.dispatchOverSocket(eventId, payload);
      void this.pullUnreadSidebar();
      this.cdr.markForCheck();
      return;
    }
    this.sendLoading = true;
    this.eventService
      .sendEventChatPayload(eventId, payload)
      .pipe(finalize(() => this.setSendLoading(false)))
      .subscribe({
        next: (response) =>
          this.applyOutgoingHttpResponse(
            response,
            eventId,
            payload.userId,
            '',
            payload.type ?? 'TEXT',
            payload,
          ),
        error: (err) => this.setOutgoingError(err, payload.type ?? 'TEXT'),
      });
  }

  private dispatchOverSocket(eventId: number, payload: EventChatSendPayload): void {
    this.eventChatSocketService.publishPayload(eventId, payload as unknown as Record<string, unknown>);
  }

  private setOutgoingError(err: unknown, type: ChatMessageKind): void {
    const base =
      type === 'TEXT'
        ? 'Message was rejected.'
        : type === 'VOICE'
          ? 'Voice message was rejected.'
          : 'Location was rejected.';
    this.ngZone.run(() => {
      this.messageError = this.resolveErr(err) || base;
      this.cdr.markForCheck();
    });
  }

  private applyOutgoingHttpResponse(
    response: unknown,
    eventId: number,
    userId: number,
    content: string,
    type: ChatMessageKind,
    rawPayload?: EventChatSendPayload,
  ): void {
    const msg = this.normalizeOutgoingMessage(
      response as EventChatMessageDto,
      eventId,
      userId,
      content,
      type,
      rawPayload,
    );
    this.ingestRealtimeMessage(msg);
  }

  private loadGroups(): void {
    const userId = this.getConnectedUserId();
    if (!userId) {
      this.groups = [];
      this.setGroupsLoading(false);
      return;
    }

    this.setGroupsLoading(true);
    this.groupsError = '';

    this.eventService.getEventRegistrations(0, 1000).subscribe({
      next: (regs) => {
        const rows = this.extractRows<{ userId?: number; eventId?: number }>(regs);
        const eventIds = Array.from(
          new Set(
            rows
              .filter((r) => !!r && Number(r.userId) === Number(userId) && !!r.eventId)
              .map((r) => Number(r.eventId))
              .filter((id) => Number.isInteger(id) && id > 0),
          ),
        );

        if (eventIds.length === 0) {
          this.groups = [];
          this.setGroupsLoading(false);
          return;
        }

        this.eventService.getEvents(0, 1000).subscribe({
          next: (eventsResp) => {
            const events = this.extractRows<EventDto>(eventsResp);
            const byId = new Map(events.map((ev) => [Number(ev.idEvent), ev]));
            this.groups = eventIds
              .map((id) => byId.get(id))
              .filter((ev): ev is EventDto => !!ev)
              .map((ev) => ({
                eventId: Number(ev.idEvent),
                title: ev.title || `Event #${ev.idEvent}`,
                city: ev.city || '—',
                address: ev.address || '—',
                unreadCount: 0,
              }));
            void this.pullUnreadSidebar();
            this.setGroupsLoading(false);

            const queryEventId = Number(this.route.snapshot.queryParamMap.get('eventId'));
            if (Number.isInteger(queryEventId) && queryEventId > 0) {
              this.trySelectGroup(queryEventId);
              return;
            }
            if (!this.selectedGroup && this.groups.length > 0) {
              this.selectGroup(this.groups[0]);
            }
          },
          error: () => {
            this.groups = [];
            this.groupsError = 'Unable to load your groups.';
            this.setGroupsLoading(false);
          },
        });
      },
      error: () => {
        this.groups = [];
        this.groupsError = 'Unable to load your registrations.';
        this.setGroupsLoading(false);
      },
    });
  }

  private trySelectGroup(eventId: number): void {
    if (!eventId) return;
    const found = this.groups.find((g) => g.eventId === eventId);
    if (!found) return;
    if (this.selectedGroup?.eventId === found.eventId) return;
    this.selectGroup(found);
  }

  private loadMessagesForSelectedGroup(): void {
    const eventId = this.selectedGroup?.eventId;
    const userId = this.getConnectedUserId();
    if (!eventId || !userId) {
      this.messages = [];
      this.rebuildTimeline();
      this.canChat = false;
      return;
    }

    this.setMessagesLoading(true);
    this.messageError = '';
    this.canChat = false;

    this.eventService
      .getEventChatMessages(eventId, userId)
      .pipe(finalize(() => this.setMessagesLoading(false)))
      .subscribe({
        next: (data) => {
          this.canChat = true;
          const rows = this.unwrapChatMessagesPayload(data);
          this.messages = rows.map((row) => this.normalizeChatMessageFromApi(row));
          this.rebuildTimeline();
          this.markReadLocal(eventId);
          this.queueScrollBottom();
          this.chatSub?.unsubscribe();
          this.eventChatSocketService.connect(eventId);
          this.chatSub = this.eventChatSocketService.messages$.subscribe((msg) => {
            if (!msg) return;
            this.ngZone.run(() => {
              const kind = String(msg.status || '').toUpperCase();
              if (kind.includes('REJECT')) {
                const reason = msg.moderationReason || 'Message was rejected.';
                const mine = Number(msg.userId) === Number(this.getConnectedUserId());
                if (mine) this.messageError = reason;
              }
              this.ingestRealtimeMessage(msg);
            });
          });
        },
        error: (err: unknown) => {
          this.messages = [];
          this.rebuildTimeline();
          this.canChat = false;
          this.messageError =
            this.resolveErr(err) || 'Unable to load chat.';
        },
      });
  }

  private ingestRealtimeMessage(msg: EventChatMessageDto): void {
    const normalized = this.normalizeIncomingWs(msg);
    const incomingEventId = normalized.eventId ?? this.selectedGroup?.eventId;
    if (
      this.selectedGroup?.eventId != null &&
      incomingEventId != null &&
      Number(incomingEventId) !== Number(this.selectedGroup.eventId)
    ) {
      void this.pullUnreadSidebar();
      return;
    }
    if (this.hasMessage(normalized)) return;
    this.messages = [...this.messages, normalized];
    this.markReadLocal(this.selectedGroup?.eventId);
    this.rebuildTimeline();
    this.queueScrollBottom();
    void this.pullUnreadSidebar();
    this.ngZone.run(() => this.cdr.markForCheck());
  }

  private normalizeIncomingWs(m: EventChatMessageDto): EventChatMessageDto {
    return this.normalizeChatMessageFromApi({
      ...(m as unknown as Record<string, unknown>),
      eventId: (m.eventId ?? this.selectedGroup?.eventId) as unknown,
    });
  }

  /** Spring/Jackson sometimes wraps lists or uses odd date shapes — normalize everything the UI relies on. */
  private unwrapChatMessagesPayload(data: unknown): unknown[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      const o = data as Record<string, unknown>;
      if (Array.isArray(o['content'])) return o['content'];
      if (Array.isArray(o['data'])) return o['data'];
      if (Array.isArray(o['messages'])) return o['messages'];
    }
    return [];
  }

  private normalizeChatMessageFromApi(raw: unknown): EventChatMessageDto {
    const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const typeRaw = String(o['type'] ?? o['messageType'] ?? 'TEXT')
      .trim()
      .toUpperCase();
    const kind: ChatMessageKind =
      typeRaw === 'VOICE' || typeRaw === 'LOCATION' ? typeRaw : 'TEXT';

    return {
      id: o['id'] != null ? Number(o['id']) : undefined,
      eventId: o['eventId'] != null ? Number(o['eventId']) : undefined,
      groupId: o['groupId'] != null ? Number(o['groupId']) : undefined,
      userId: o['userId'] != null ? Number(o['userId']) : undefined,
      senderName: typeof o['senderName'] === 'string' ? o['senderName'] : undefined,
      content: typeof o['content'] === 'string' ? o['content'] : '',
      type: kind,
      audioUrl: typeof o['audioUrl'] === 'string' ? o['audioUrl'] : undefined,
      lat: o['lat'] != null ? Number(o['lat']) : undefined,
      lng: o['lng'] != null ? Number(o['lng']) : undefined,
      address: typeof o['address'] === 'string' ? o['address'] : undefined,
      status: typeof o['status'] === 'string' ? o['status'] : undefined,
      moderationReason:
        typeof o['moderationReason'] === 'string' ? o['moderationReason'] : undefined,
      sentAt: this.coerceSentAtIso(o['sentAt']),
    };
  }

  private coerceSentAtIso(v: unknown): string {
    if (v == null) return new Date().toISOString();
    if (typeof v === 'string') {
      const parsed = new Date(v);
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
      return new Date().toISOString();
    }
    if (typeof v === 'number' && Number.isFinite(v)) {
      return new Date(v).toISOString();
    }
    if (Array.isArray(v) && v.length >= 3) {
      const y = Number(v[0]);
      const mo = Number(v[1]);
      const day = Number(v[2]);
      const hour = v.length > 3 ? Number(v[3]) : 0;
      const min = v.length > 4 ? Number(v[4]) : 0;
      const sec = v.length > 5 ? Number(v[5]) : 0;
      const d = new Date(y, mo - 1, day, hour, min, sec);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
    return new Date().toISOString();
  }

  private getConnectedUserId(): number | null {
    const payload = this.authService.getPayload();
    if (payload?.userId !== undefined && payload?.userId !== null) {
      const n = Number(payload.userId);
      return Number.isFinite(n) ? n : null;
    }
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const user = JSON.parse(raw) as { userId?: number };
      const n = Number(user?.userId);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }

  private resolveErr(err: unknown): string | null {
    if (!err || typeof err !== 'object') return null;
    const e = err as { error?: unknown; message?: unknown };
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
    const body = e.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as { message?: unknown }).message;
      if (typeof m === 'string' && m.trim()) return m;
    }
    return null;
  }

  private rebuildTimeline(): void {
    const out: TimelineRow[] = [];
    let lastDay: string | null = null;
    for (const raw of this.messages) {
      const msg = raw;
      if (String(msg.status || '').toUpperCase().includes('REJECT')) {
        continue;
      }
      let d = msg.sentAt ? new Date(msg.sentAt) : new Date();
      if (Number.isNaN(d.getTime())) {
        d = new Date();
      }

      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (key !== lastDay) {
        lastDay = key;
        out.push({
          kind: 'day',
          label: d.toLocaleDateString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        });
      }
      out.push({ kind: 'msg', msg });
    }
    this.timelineRows = out;
    this.ngZone.run(() => this.cdr.markForCheck());
  }

  private queueScrollBottom(): void {
    requestAnimationFrame(() => {
      queueMicrotask(() => {
        const el = this.msgScroll?.nativeElement;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
      });
    });
  }

  private markReadLocal(eventId?: number): void {
    const id = Number(eventId);
    const userId = this.getConnectedUserId();
    if (!Number.isInteger(id) || id <= 0 || !userId) return;

    let ms = Date.now();
    const last = this.messages[this.messages.length - 1];
    if (last?.sentAt) {
      const t = new Date(last.sentAt).getTime();
      if (!Number.isNaN(t)) ms = t;
    }
    localStorage.setItem(this.lastReadStorageKey(id), String(ms));

    const g = this.groups.find((x) => x.eventId === id);
    if (g && this.selectedGroup?.eventId === id) {
      g.unreadCount = 0;
    }
  }

  private lastReadStorageKey(eventId: number): string {
    return `gc_last_read_ms_${eventId}_${this.getConnectedUserId() ?? 'anon'}`;
  }

  private localStorageForgetRead(eventId: number): void {
    localStorage.removeItem(this.lastReadStorageKey(eventId));
  }

  private async pullUnreadSidebar(): Promise<void> {
    const userId = this.getConnectedUserId();
    if (!userId || this.groups.length === 0) return;

    const jobs = this.groups.map((g) => {
      const raw = localStorage.getItem(this.lastReadStorageKey(g.eventId));
      let sinceMs: number | undefined;
      if (raw != null && raw.trim() !== '') {
        const n = Number(raw);
        if (!Number.isNaN(n)) sinceMs = n;
      }
      return this.eventService.getEventChatUnreadCount(g.eventId, userId, sinceMs).pipe(
        catchError(() => of(0)),
        map((c) => ({ id: g.eventId, count: typeof c === 'number' ? c : 0 })),
      );
    });

    if (!jobs.length) {
      return;
    }

    forkJoin(jobs).subscribe((rows) => {
      void this.ngZone.run(() => {
        for (const row of rows) {
          const g = this.groups.find((x) => x.eventId === row.id);
          if (!g) continue;
          g.unreadCount = row.id === this.selectedGroup?.eventId ? 0 : row.count ?? 0;
        }
        this.cdr.markForCheck();
      });
    });
  }

  private resolveCurrentUserName(): string {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return 'You';
      const user = JSON.parse(raw) as { firstName?: string; lastName?: string };
      const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
      return full || 'You';
    } catch {
      return 'You';
    }
  }

  private setGroupsLoading(value: boolean): void {
    this.ngZone.run(() => {
      this.loadingGroups = value;
      this.cdr.markForCheck();
    });
  }

  private setMessagesLoading(value: boolean): void {
    this.ngZone.run(() => {
      this.loadingMessages = value;
      this.cdr.markForCheck();
    });
  }

  private setSendLoading(value: boolean): void {
    this.ngZone.run(() => {
      this.sendLoading = value;
      this.cdr.markForCheck();
    });
  }

  private setLeaveLoading(value: boolean): void {
    this.ngZone.run(() => {
      this.leaveLoading = value;
      this.cdr.markForCheck();
    });
  }

  private extractRows<T>(response: unknown): T[] {
    if (Array.isArray(response)) return response.filter((row) => !!row) as T[];
    const r = response as { content?: unknown[]; data?: unknown[] };
    if (Array.isArray(r?.content)) return r.content!.filter(Boolean) as T[];
    if (Array.isArray(r?.data)) return r.data!.filter(Boolean) as T[];
    return [];
  }

  private normalizeOutgoingMessage(
    response: Partial<EventChatMessageDto> | null | undefined,
    eventId: number,
    userId: number,
    content: string,
    type: ChatMessageKind,
    rawPayload?: EventChatSendPayload,
  ): EventChatMessageDto {
    const direct =
      response && typeof response === 'object' ? (response as EventChatMessageDto) : {};

    const typeStr = String(direct.type ?? type).trim().toUpperCase();
    const kind: ChatMessageKind =
      typeStr === 'VOICE' || typeStr === 'LOCATION' ? typeStr : 'TEXT';

    const msg: EventChatMessageDto = {
      ...direct,
      eventId: Number(direct.eventId ?? eventId),
      userId: Number(direct.userId ?? userId),
      senderName: direct.senderName || this.resolveCurrentUserName(),
      sentAt: this.coerceSentAtIso(direct.sentAt ?? null),
      type: kind,
    };

    switch (msg.type) {
      case 'VOICE':
        msg.audioUrl = direct.audioUrl ?? rawPayload?.audioUrl ?? '';
        msg.content = '';
        break;
      case 'LOCATION':
        msg.lat = direct.lat ?? rawPayload?.lat;
        msg.lng = direct.lng ?? rawPayload?.lng;
        msg.address = direct.address ?? rawPayload?.address;
        msg.content = '';
        break;
      default:
        msg.content =
          typeof direct.content === 'string'
            ? direct.content
            : content
              ? content
              : (direct.content ?? '').toString();
    }

    return msg;
  }

  private hasMessage(candidate: EventChatMessageDto): boolean {
    const id = candidate.id;
    if (id !== undefined && id !== null) {
      return this.messages.some((m) => m.id === id);
    }

    return this.messages.some((m) => {
      const sameUser = Number(m.userId ?? -1) === Number(candidate.userId ?? -2);
      const sameTime = (m.sentAt || '') === (candidate.sentAt || '');
      const kinds = `${this.msgKind(m)}:${this.msgKind(candidate)}`;
      const sameVoice =
        String(m.audioUrl || '') === String(candidate.audioUrl || '') &&
        this.msgKind(candidate) === 'VOICE';
      const sameLoc =
        Number(m.lat) === Number(candidate.lat) &&
        Number(m.lng) === Number(candidate.lng) &&
        this.msgKind(candidate) === 'LOCATION';
      const sameText =
        this.msgKind(m) === 'TEXT' &&
        this.msgKind(candidate) === 'TEXT' &&
        (m.content || '').trim() === (candidate.content || '').trim();
      return sameUser && (sameVoice || sameLoc || (sameTime && kinds === 'TEXT:TEXT') || sameText);
    });
  }

  getEmojiOptions(): readonly string[] {
    return EMOJI_PRESET;
  }

  getAvatarInitials(senderName: string | undefined): string {
    if (!senderName) return '?';
    const parts = senderName.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  getAvatarColorFromUsername(senderNameOrId: string | number | undefined): string {
    const str = `${senderNameOrId ?? ''}`.trim() || 'user';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 56%, 48%)`;
  }
}
