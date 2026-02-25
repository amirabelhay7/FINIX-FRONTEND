import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import {
  UserScoreApi,
  ScoringResultApi,
  UserTierApi,
  UserTierRequest,
  ScoreHistoryEntryApi,
  ScoreConfigApi,
  ScoreConfigRequest,
  TutorialApi,
  TutorialRequest,
  AchievementApi,
  AchievementRequest,
  GuaranteeApi,
  GuaranteeRequest,
  UserDocumentApi,
  DocumentVerificationLogApi
} from '../../models';

const API = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class ScoreService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ---------- Me: score, tier, history, eligibility ----------
  getMyScore(): Observable<UserScoreApi> {
    return this.http.get<UserScoreApi>(`${API}/scoring/me/score`);
  }

  getMyScoreDetailed(): Observable<ScoringResultApi> {
    return this.http.get<ScoringResultApi>(`${API}/scoring/me/score/detailed`);
  }

  getMyTier(): Observable<UserTierApi> {
    return this.http.get<UserTierApi>(`${API}/scoring/me/tier`);
  }

  getMyEligibility(requiredScore?: number): Observable<boolean> {
    const url = `${API}/scoring/me/eligibility`;
    if (requiredScore != null) {
      return this.http.get<boolean>(url, { params: { requiredScore: String(requiredScore) } });
    }
    return this.http.get<boolean>(url);
  }

  getMyScoreHistory(): Observable<ScoreHistoryEntryApi[]> {
    return this.http.get<ScoreHistoryEntryApi[]>(`${API}/score-history/me`);
  }

  // ---------- Rules (ScoreConfig) ----------
  getRules(): Observable<ScoreConfigApi[]> {
    return this.http.get<ScoreConfigApi[]>(`${API}/scoring/rules`);
  }

  getRulesActive(): Observable<ScoreConfigApi[]> {
    return this.http.get<ScoreConfigApi[]>(`${API}/scoring/rules/active`);
  }

  getRuleById(id: number): Observable<ScoreConfigApi> {
    return this.http.get<ScoreConfigApi>(`${API}/scoring/rules/${id}`);
  }

  createRule(request: ScoreConfigRequest): Observable<ScoreConfigApi> {
    return this.http.post<ScoreConfigApi>(`${API}/scoring/rules`, request);
  }

  updateRule(id: number, request: ScoreConfigRequest): Observable<ScoreConfigApi> {
    return this.http.put<ScoreConfigApi>(`${API}/scoring/rules/${id}`, request);
  }

  deleteRule(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/scoring/rules/${id}`);
  }

  // ---------- Tiers ----------
  getTiers(): Observable<UserTierApi[]> {
    return this.http.get<UserTierApi[]>(`${API}/user-tiers`);
  }

  getTierById(id: number): Observable<UserTierApi> {
    return this.http.get<UserTierApi>(`${API}/user-tiers/${id}`);
  }

  getTierByScore(score: number): Observable<UserTierApi> {
    return this.http.get<UserTierApi>(`${API}/user-tiers/score/${score}`);
  }

  createTier(request: UserTierRequest): Observable<UserTierApi> {
    return this.http.post<UserTierApi>(`${API}/user-tiers`, request);
  }

  updateTier(id: number, request: UserTierRequest): Observable<UserTierApi> {
    return this.http.put<UserTierApi>(`${API}/user-tiers/${id}`, request);
  }

  activateTier(id: number): Observable<UserTierApi> {
    return this.http.post<UserTierApi>(`${API}/user-tiers/${id}/activate`, {});
  }

  deactivateTier(id: number): Observable<UserTierApi> {
    return this.http.post<UserTierApi>(`${API}/user-tiers/${id}/deactivate`, {});
  }

  deleteTier(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/user-tiers/${id}`);
  }

  // ---------- Tutorials ----------
  getTutorials(): Observable<TutorialApi[]> {
    return this.http.get<TutorialApi[]>(`${API}/tutorials`);
  }

  getTutorialById(id: number): Observable<TutorialApi> {
    return this.http.get<TutorialApi>(`${API}/tutorials/${id}`);
  }

  getMyTutorials(): Observable<TutorialApi[]> {
    return this.http.get<TutorialApi[]>(`${API}/tutorials/me`);
  }

  getMyCompletedTutorials(): Observable<TutorialApi[]> {
    return this.http.get<TutorialApi[]>(`${API}/tutorials/me/completed`);
  }

  getMyAvailableTutorials(): Observable<TutorialApi[]> {
    return this.http.get<TutorialApi[]>(`${API}/tutorials/me/available`);
  }

  startTutorialMe(id: number): Observable<TutorialApi> {
    return this.http.post<TutorialApi>(`${API}/tutorials/${id}/me/start`, {});
  }

  completeTutorialMe(id: number): Observable<TutorialApi> {
    return this.http.post<TutorialApi>(`${API}/tutorials/${id}/me/complete`, {});
  }

  createTutorial(request: TutorialRequest): Observable<TutorialApi> {
    return this.http.post<TutorialApi>(`${API}/tutorials`, request);
  }

  deleteTutorial(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/tutorials/${id}`);
  }

  // ---------- Achievements ----------
  getAchievements(): Observable<AchievementApi[]> {
    return this.http.get<AchievementApi[]>(`${API}/achievements`);
  }

  getAchievementById(id: number): Observable<AchievementApi> {
    return this.http.get<AchievementApi>(`${API}/achievements/${id}`);
  }

  getMyAchievements(): Observable<AchievementApi[]> {
    return this.http.get<AchievementApi[]>(`${API}/achievements/me`);
  }

  getMyCompletedAchievements(): Observable<AchievementApi[]> {
    return this.http.get<AchievementApi[]>(`${API}/achievements/me/completed`);
  }

  getMyAvailableAchievements(): Observable<AchievementApi[]> {
    return this.http.get<AchievementApi[]>(`${API}/achievements/me/available`);
  }

  unlockAchievementMe(achievementType: string): Observable<AchievementApi> {
    return this.http.post<AchievementApi>(`${API}/achievements/me/unlock/${encodeURIComponent(achievementType)}`, {});
  }

  completeAchievementMe(id: number): Observable<AchievementApi> {
    return this.http.post<AchievementApi>(`${API}/achievements/${id}/me/complete`, {});
  }

  createAchievement(request: AchievementRequest): Observable<AchievementApi> {
    return this.http.post<AchievementApi>(`${API}/achievements`, request);
  }

  deleteAchievement(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/achievements/${id}`);
  }

  // ---------- Guarantees ----------
  getGuarantees(): Observable<GuaranteeApi[]> {
    return this.http.get<GuaranteeApi[]>(`${API}/guarantees`);
  }

  getGuaranteeById(id: number): Observable<GuaranteeApi> {
    return this.http.get<GuaranteeApi>(`${API}/guarantees/${id}`);
  }

  getMyGuaranteesGiven(): Observable<GuaranteeApi[]> {
    return this.http.get<GuaranteeApi[]>(`${API}/guarantees/me/given`);
  }

  getMyGuaranteesReceived(): Observable<GuaranteeApi[]> {
    return this.http.get<GuaranteeApi[]>(`${API}/guarantees/me/received`);
  }

  getMyActiveGuarantees(): Observable<GuaranteeApi[]> {
    return this.http.get<GuaranteeApi[]>(`${API}/guarantees/me/active`);
  }

  createGuaranteeMe(request: GuaranteeRequest): Observable<GuaranteeApi> {
    return this.http.post<GuaranteeApi>(`${API}/guarantees/me`, request);
  }

  acceptGuaranteeMe(id: number): Observable<GuaranteeApi> {
    return this.http.post<GuaranteeApi>(`${API}/guarantees/${id}/me/accept`, {});
  }

  rejectGuaranteeMe(id: number): Observable<void> {
    return this.http.post<void>(`${API}/guarantees/${id}/me/reject`, {});
  }

  deleteGuarantee(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/guarantees/${id}`);
  }

  // ---------- User documents (upload / verification) ----------
  getMyDocuments(): Observable<UserDocumentApi[]> {
    return this.http.get<UserDocumentApi[]>(`${API}/user-documents/me`);
  }

  uploadDocument(file: File, documentType: string, description?: string): Observable<UserDocumentApi> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (description != null && description.trim()) formData.append('description', description.trim());
    const token = this.auth.getToken();
    const options: { headers?: Record<string, string>; responseType: 'json' } = { responseType: 'json' };
    if (token) options.headers = { Authorization: `Bearer ${token}` };
    return this.http.post<UserDocumentApi>(`${API}/user-documents/me`, formData, options);
  }

  getPendingDocuments(): Observable<UserDocumentApi[]> {
    const token = this.auth.getToken();
    const options: { headers?: Record<string, string> } = {};
    if (token) options.headers = { Authorization: `Bearer ${token}` };
    return this.http.get<UserDocumentApi[]>(`${API}/user-documents/pending`, options);
  }

  verifyDocument(id: number, notes?: string): Observable<UserDocumentApi> {
    const token = this.auth.getToken();
    const opts: { headers?: Record<string, string>; params?: Record<string, string> } = {};
    if (token) opts.headers = { Authorization: `Bearer ${token}` };
    if (notes != null && notes.trim()) opts.params = { notes: notes.trim() };
    return this.http.post<UserDocumentApi>(`${API}/user-documents/${id}/verify`, null, opts);
  }

  rejectDocument(id: number, notes?: string): Observable<UserDocumentApi> {
    const token = this.auth.getToken();
    const opts: { headers?: Record<string, string>; params?: Record<string, string> } = {};
    if (token) opts.headers = { Authorization: `Bearer ${token}` };
    if (notes != null && notes.trim()) opts.params = { notes: notes.trim() };
    return this.http.post<UserDocumentApi>(`${API}/user-documents/${id}/reject`, null, opts);
  }

  /** Admin: list documents by status (pending, verified, rejected, all). */
  getDocumentsByStatus(status: string): Observable<UserDocumentApi[]> {
    const token = this.auth.getToken();
    const options: { headers?: Record<string, string>; params?: Record<string, string> } = { params: { status } };
    if (token) options.headers = { Authorization: `Bearer ${token}` };
    return this.http.get<UserDocumentApi[]>(`${API}/user-documents/all`, options);
  }

  /** Get verification/rejection history for a document. */
  getDocumentHistory(documentId: number): Observable<DocumentVerificationLogApi[]> {
    const token = this.auth.getToken();
    const options: { headers?: Record<string, string> } = {};
    if (token) options.headers = { Authorization: `Bearer ${token}` };
    return this.http.get<DocumentVerificationLogApi[]>(`${API}/user-documents/${documentId}/history`, options);
  }

  /** Get document file as blob (for viewing). Opens in new tab via URL.createObjectURL. */
  getDocumentFile(id: number): Observable<Blob> {
    const token = this.auth.getToken();
    const options: { headers?: Record<string, string>; responseType: 'blob' } = { responseType: 'blob' };
    if (token) options.headers = { Authorization: `Bearer ${token}` };
    return this.http.get(`${API}/user-documents/${id}/file`, options);
  }
}
