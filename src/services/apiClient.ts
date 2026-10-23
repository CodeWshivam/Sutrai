import {
  StructuredIncident,
  IncidentStatus,
  InputMethod,
  LocationData,
  AuditEvent,
  TaskItem,
  ReferralRecord,
  WeatherData,
  DirectoryEntry,
  ScheduledReminder,
  NotificationItem,
  RouteComparisonData,
} from '../types';
import { IncidentService } from './incidentService';

export interface IntegrationItem {
  name: string;
  isConfigured: boolean;
  status: 'connected' | 'mock_mode' | 'not_configured' | 'degraded' | 'unavailable' | string;
  provider: string;
  description: string;
  lastChecked: string;
  model?: string;
}

export interface IntegrationStatus {
  status: string;
  checkedAt?: string;
  integrations: Record<string, IntegrationItem>;
  capabilities: Record<string, boolean>;
}


export interface AnalyzeResultResponse {
  success: boolean;
  incident: StructuredIncident;
  modelInfo: {
    model: string;
    isFallback: boolean;
    multimodalFilesCount: number;
  };
}

class ApiClient {
  private baseUrl = '/api';

  public async getHealth(): Promise<{ status: string; uptime: number; version: string } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async getIntegrationStatus(): Promise<IntegrationStatus | null> {
    try {
      const res = await fetch(`${this.baseUrl}/integrations/status`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  public async analyzeSubmission(
    rawText: string,
    language: string,
    location?: LocationData,
    files: File[] = [],
    sensitiveConsent = true,
    clientSubmissionId?: string
  ): Promise<AnalyzeResultResponse> {
    try {
      if (!sensitiveConsent) {
        throw new Error('Explicit consent is required to process sensitive incident data.');
      }

      const formData = new FormData();
      formData.append('rawText', rawText);
      formData.append('language', language);
      formData.append('sensitiveConsent', String(sensitiveConsent));
      if (clientSubmissionId) {
        formData.append('clientSubmissionId', clientSubmissionId);
      }
      if (location) {
        formData.append('location', JSON.stringify(location));
      }

      files.forEach((file) => {
        formData.append('evidenceFiles', file);
      });

      const res = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data: AnalyzeResultResponse = await res.json();
      
      // Also cache to local storage for offline continuity
      try {
        const existing = IncidentService.getAll();
        const updated = [data.incident, ...existing.filter((i) => i.id !== data.incident.id)];
        localStorage.setItem('sutrai_incidents_v1', JSON.stringify(updated));
      } catch {
        // Ignore localStorage quota warnings
      }

      return data;
    } catch (err) {
      console.warn('Backend API analyze failed, falling back to local reasoning engine:', err);
      // Client-side fallback if backend server is unreachable
      const fallbackSubmission = {
        id: `sub-${Date.now()}`,
        rawText,
        inputMethodsUsed: (files.length > 0 ? ['text', 'document'] : ['text']) as InputMethod[],
        evidenceFiles: files.map((f, i) => ({
          id: `evi-local-${i}`,
          name: f.name,
          type: f.type,
          sizeBytes: f.size,
          uploadedAt: new Date().toISOString(),
          category: f.type.startsWith('image')
            ? ('photo' as const)
            : f.type.startsWith('audio')
            ? ('audio_file' as const)
            : ('document' as const),
        })),
        location: location || { address: 'Not provided', source: 'unknown' as const, isUnknown: true },
        language,
        sensitiveConsentGiven: true,
        createdAt: new Date().toISOString(),
      };

      const localIncident = IncidentService.createFromSubmission(fallbackSubmission);
      return {
        success: true,
        incident: localIncident,
        modelInfo: {
          model: 'sutrai-deterministic-engine',
          isFallback: true,
          multimodalFilesCount: files.length,
        },
      };
    }
  }

  public async getIncidents(): Promise<StructuredIncident[]> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents`);
      if (res.ok) {
        const data = await res.json();
        if (data.incidents && Array.isArray(data.incidents)) {
          // Sync with local storage
          try {
            localStorage.setItem('sutrai_incidents_v1', JSON.stringify(data.incidents));
          } catch {
            // Ignore storage quota
          }
          return data.incidents;
        }
      }
    } catch (err) {
      console.warn('Backend fetch incidents failed, using local store:', err);
    }
    return IncidentService.getAll();
  }

  public async getIncidentById(id: string): Promise<StructuredIncident | undefined> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.incident) {
          return data.incident;
        }
      }
    } catch (err) {
      console.warn(`Backend fetch incident ${id} failed, using local store:`, err);
    }
    return IncidentService.getById(id);
  }

  public async updateIncidentStatus(
    id: string,
    status: IncidentStatus,
    operatorNote?: string,
    author = 'Demo Operator'
  ): Promise<StructuredIncident | undefined> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, operatorNote, author }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.incident) {
          return data.incident;
        }
      }
    } catch (err) {
      console.warn(`Backend patch incident ${id} failed, using local store:`, err);
    }

    // Local fallback
    IncidentService.updateStatus(id, status, author);
    if (operatorNote) {
      return IncidentService.addNote(id, operatorNote, author);
    }
    return IncidentService.getById(id);
  }

  public async addIncidentNote(
    id: string,
    note: string,
    author = 'Demo Operator'
  ): Promise<StructuredIncident | undefined> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorNote: note, author }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.incident) {
          return data.incident;
        }
      }
    } catch (err) {
      console.warn(`Backend add note incident ${id} failed, using local store:`, err);
    }

    return IncidentService.addNote(id, note, author);
  }

  public async getIncidentActivity(id: string): Promise<AuditEvent[]> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${id}/activity`);
      if (res.ok) {
        const data = await res.json();
        if (data.activity && Array.isArray(data.activity)) {
          return data.activity;
        }
      }
    } catch (err) {
      console.warn(`Backend activity fetch failed for ${id}:`, err);
    }

    const incident = IncidentService.getById(id);
    return incident ? incident.auditTimeline : [];
  }

  public async resetDemoData(): Promise<StructuredIncident[]> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/reset-demo`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.incidents && Array.isArray(data.incidents)) {
          localStorage.setItem('sutrai_incidents_v1', JSON.stringify(data.incidents));
          return data.incidents;
        }
      }
    } catch (err) {
      console.warn('Backend reset demo failed, using local store:', err);
    }
    IncidentService.resetDemoData();
    return IncidentService.getAll();
  }
  /** Alias for getIncidentById — used by IncidentDetailPage */
  public async getIncident(id: string): Promise<StructuredIncident | undefined> {
    return this.getIncidentById(id);
  }

  /** Unified patch call — used by IncidentDetailPage */
  public async updateIncident(
    id: string,
    payload: { status?: IncidentStatus; operatorNote?: string; actor?: string }
  ): Promise<StructuredIncident | undefined> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.incident) {
          return data.incident;
        }
      }
    } catch (err) {
      console.warn(`Backend PATCH incident ${id} failed:`, err);
    }
    return undefined;
  }

  // --- Phase 3 Extensions ---

  /** Fetch live Open-Meteo weather by coordinates or place query */
  public async getWeather(params: { lat?: number; lon?: number; location?: string }): Promise<WeatherData | null> {
    try {
      const searchParams = new URLSearchParams();
      if (params.lat !== undefined) searchParams.append('lat', String(params.lat));
      if (params.lon !== undefined) searchParams.append('lon', String(params.lon));
      if (params.location) searchParams.append('location', params.location);

      const res = await fetch(`${this.baseUrl}/weather?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.weather || null;
      }
    } catch (err) {
      console.warn('Weather fetch failed:', err);
    }
    return null;
  }

  /** Search & list official emergency and civic directory entries */
  public async getDirectory(params?: { category?: string; search?: string; jurisdiction?: string }): Promise<DirectoryEntry[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append('category', params.category);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.jurisdiction) searchParams.append('jurisdiction', params.jurisdiction);

      const res = await fetch(`${this.baseUrl}/directory?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data.entries || [];
      }
    } catch (err) {
      console.warn('Directory fetch failed:', err);
    }
    return [];
  }

  /** Calculate road route and ETA via live OSRM */
  public async calculateRoute(
    origin: { latitude: number; longitude: number; name?: string },
    destination: { latitude: number; longitude: number; name?: string },
    isEmergencyMode = false
  ): Promise<RouteComparisonData | null> {
    try {
      const res = await fetch(`${this.baseUrl}/routing/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, isEmergencyMode }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.route || null;
      }
    } catch (err) {
      console.warn('Route calculation failed:', err);
    }
    return null;
  }

  /** Add an actionable task to incident checklist */
  public async addTask(
    incidentId: string,
    task: { title: string; description?: string; priority?: TaskItem['priority']; assignedTo?: string; dueDate?: string },
    actor = 'Console Operator'
  ): Promise<TaskItem | null> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, actor }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.task || null;
      }
    } catch (err) {
      console.warn(`Add task failed for ${incidentId}:`, err);
    }
    return null;
  }

  /** Update task status or assignment */
  public async updateTask(
    incidentId: string,
    taskId: string,
    updates: Partial<TaskItem>,
    actor = 'Console Operator'
  ): Promise<TaskItem | null> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, actor }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.task || null;
      }
    } catch (err) {
      console.warn(`Update task failed for ${taskId}:`, err);
    }
    return null;
  }

  /** Create official referral docket */
  public async createReferral(
    incidentId: string,
    serviceId: string,
    actor = 'Console Operator'
  ): Promise<ReferralRecord | null> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId, actor }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.referral || null;
      }
    } catch (err) {
      console.warn(`Create referral failed for ${incidentId}:`, err);
    }
    return null;
  }

  /** Escalate incident to critical urgency */
  public async escalateIncident(
    incidentId: string,
    reason: string,
    actor = 'Console Operator'
  ): Promise<StructuredIncident | null> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, actor }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.incident || null;
      }
    } catch (err) {
      console.warn(`Escalate incident failed for ${incidentId}:`, err);
    }
    return null;
  }

  /** Schedule a reminder / follow-up */
  public async scheduleReminder(
    incidentId: string,
    reminder: { title: string; scheduledFor: string; channel?: ScheduledReminder['channel']; recipient?: string }
  ): Promise<ScheduledReminder | null> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminder),
      });
      if (res.ok) {
        const data = await res.json();
        return data.reminder || null;
      }
    } catch (err) {
      console.warn(`Schedule reminder failed for ${incidentId}:`, err);
    }
    return null;
  }

  /** Refresh and link live weather for incident */
  public async refreshIncidentWeather(incidentId: string): Promise<WeatherData | null> {
    try {
      const res = await fetch(`${this.baseUrl}/incidents/${incidentId}/weather/refresh`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        return data.weather || null;
      }
    } catch (err) {
      console.warn(`Weather refresh failed for ${incidentId}:`, err);
    }
    return null;
  }

  /** List notifications */
  public async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/notifications`);
      if (res.ok) {
        const data = await res.json();
        return data.notifications || [];
      }
    } catch (err) {
      console.warn('Fetch notifications failed:', err);
    }
    return [];
  }

  /** Mark notification as read */
  public async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/notifications/${id}/read`, { method: 'PATCH' });
    } catch (err) {
      console.warn(`Mark notification read failed for ${id}:`, err);
    }
  }
}

export const apiClient = new ApiClient();
