import {
  StructuredIncident,
  InputSubmission,
  IncidentStatus,
  AuditEvent,
} from '../types';
import { INITIAL_DEMO_INCIDENTS } from './mockData';
import { analyzeSubmissionDemo } from './demoAnalysisService';
import { sealAuditEvent } from '../utils/cryptoAudit';

const STORAGE_KEY = 'sutrai_incidents_v1';

export class IncidentService {
  public static getAll(): StructuredIncident[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_INCIDENTS));
        return INITIAL_DEMO_INCIDENTS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_INCIDENTS;
    }
  }

  public static getById(id: string): StructuredIncident | undefined {
    const list = this.getAll();
    return list.find((inc) => inc.id === id);
  }

  public static createFromSubmission(submission: InputSubmission): StructuredIncident {
    const analysis = analyzeSubmissionDemo(submission);
    const incidentId = `inc-${Date.now().toString().slice(-6)}`;
    analysis.structuredIncidentId = incidentId;

    const ev1 = sealAuditEvent({
      id: `aud-${Date.now()}-1`,
      timestamp: new Date().toISOString(),
      action: 'Signal Captured',
      actor: 'SutrAI Multimodal Gateway',
      details: `Processed via ${submission.inputMethodsUsed.join(', ')} with ${submission.evidenceFiles.length} evidence attachment(s).`,
      type: 'status_change',
    });

    const ev2 = sealAuditEvent({
      id: `aud-${Date.now()}-2`,
      timestamp: new Date().toISOString(),
      action: 'Intelligent Action Routing Completed',
      actor: 'SutrAI Reasoning Engine (Demo)',
      details: `Categorized as ${analysis.extractedCategory.toUpperCase()} with urgency level ${analysis.urgencyScore.toUpperCase()}.`,
      type: 'status_change',
    }, ev1);

    const initialAudit: AuditEvent[] = [ev1, ev2];

    const newIncident: StructuredIncident = {
      id: incidentId,
      title: submission.rawText
        ? submission.rawText.slice(0, 64) + (submission.rawText.length > 64 ? '...' : '')
        : `Report ${incidentId} (${analysis.extractedCategory})`,
      category: analysis.extractedCategory,
      status: analysis.urgencyScore === 'critical' ? 'needs_review' : 'in_progress',
      urgency: analysis.urgencyScore,
      summary: analysis.summary,
      reportedLocation: submission.location,
      affectedParties: 'Reported by citizen. Affected count pending on-ground confirmation.',
      originalSubmission: submission,
      analysis,
      operatorNotes: [],
      auditTimeline: initialAudit,
      isDemoData: false,
      auditChainVerified: true,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const current = this.getAll();
    const updated = [newIncident, ...current];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    return newIncident;
  }

  public static updateStatus(
    id: string,
    newStatus: IncidentStatus,
    actor = 'Demo Operator',
    reason = 'Status updated in control console'
  ): StructuredIncident | undefined {
    const list = this.getAll();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;

    const current = list[idx];
    const latestEvent = current.auditTimeline?.[0];
    const auditEvent: AuditEvent = sealAuditEvent({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
      actor,
      details: reason,
      type: 'status_change',
    }, latestEvent);

    const updated: StructuredIncident = {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      auditTimeline: [auditEvent, ...current.auditTimeline],
    };

    list[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    return updated;
  }

  public static addNote(id: string, text: string, author = 'Demo Operator'): StructuredIncident | undefined {
    const list = this.getAll();
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;

    const current = list[idx];
    const newNote = {
      id: `note-${Date.now()}`,
      author,
      timestamp: new Date().toISOString(),
      text,
    };

    const latestEvent = current.auditTimeline?.[0];
    const auditEvent: AuditEvent = sealAuditEvent({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Operator Note Appended',
      actor: author,
      details: text.slice(0, 80) + (text.length > 80 ? '...' : ''),
      type: 'note_added',
    }, latestEvent);

    const updated: StructuredIncident = {
      ...current,
      updatedAt: new Date().toISOString(),
      operatorNotes: [newNote, ...current.operatorNotes],
      auditTimeline: [auditEvent, ...current.auditTimeline],
    };

    list[idx] = updated;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
    return updated;
  }

  public static resetDemoData(): void {
    try {
      const all = this.getAll();
      const userCases = all.filter((inc) => !inc.isDemoData);
      const combined = [...INITIAL_DEMO_INCIDENTS, ...userCases];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
    } catch (e) {
      console.warn('LocalStorage reset failed', e);
    }
  }
}
