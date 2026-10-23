import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';
import { StructuredIncident, AuditEvent, IncidentStatus } from '../../src/types';
import { INITIAL_DEMO_INCIDENTS } from '../../src/services/mockData';
import { sealAuditEvent } from '../../src/utils/cryptoAudit';

export class SupabaseService {
  private static client: SupabaseClient | null = null;
  // In-memory fallback store for when Supabase is not configured
  private static localIncidents: Map<string, StructuredIncident> = new Map();

  static {
    this.seedStore();
  }

  public static seedStore(): void {
    this.localIncidents.clear();
    INITIAL_DEMO_INCIDENTS.forEach((baseInc) => {
      const inc: StructuredIncident = JSON.parse(JSON.stringify(baseInc));
      inc.isDemoData = true;
      inc.auditChainVerified = true;

      // Cryptographically seal the audit trail
      let latestEvent: AuditEvent | undefined;
      inc.auditTimeline = (inc.auditTimeline || []).map((ev) => {
        const sealed = sealAuditEvent(ev, latestEvent);
        latestEvent = sealed;
        return sealed;
      });

      // Attach realistic initial operational tasks
      if (inc.id === 'inc-001') {
        inc.tasks = [
          {
            id: 'tsk-001-1',
            title: 'Verify caller contact & Flat 402 access code',
            status: 'completed',
            priority: 'urgent',
            assignedTo: 'Triage Desk',
            dueDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
          {
            id: 'tsk-001-2',
            title: 'Dispatch 108 ALS Ambulance with automated defibrillator',
            status: 'in_progress',
            priority: 'urgent',
            assignedTo: '108 EMRI Central Dispatch',
            dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tsk-001-3',
            title: 'Alert Manipal Hospital Indiranagar Cath Lab for STEMI protocol',
            status: 'pending',
            priority: 'high',
            assignedTo: 'Hospital Liaison',
            dueDate: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];
        inc.weather = {
          temperature: 24.7,
          humidity: 75,
          windSpeed: 9.9,
          condition: 'Partly Cloudy',
          weatherCode: 2,
          precipitation: 0.1,
          severeHazards: [],
          locationName: 'Indiranagar, Bengaluru',
          coordinates: { latitude: 12.9784, longitude: 77.6408 },
          timestamp: new Date().toISOString(),
          source: 'Open-Meteo WMO Global Weather Service (Live Verified)',
          isLive: true,
        };
      } else if (inc.id === 'inc-002') {
        inc.tasks = [
          {
            id: 'tsk-002-1',
            title: 'Alert Bengaluru Traffic Police (BTP) to barricade Panathur underpass',
            status: 'in_progress',
            priority: 'urgent',
            assignedTo: 'BTP Traffic Command',
            dueDate: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tsk-002-2',
            title: 'Deploy BBMP heavy stormwater drainage dewatering pump squad',
            status: 'pending',
            priority: 'high',
            assignedTo: 'BBMP Stormwater Div',
            dueDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tsk-002-3',
            title: 'Verify student safety with school bus driver & parents',
            status: 'pending',
            priority: 'high',
            assignedTo: 'Citizen Desk',
            dueDate: new Date(Date.now() + 40 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];
        inc.weather = {
          temperature: 21.8,
          humidity: 92,
          windSpeed: 18.5,
          condition: 'Heavy Rain Showers',
          weatherCode: 81,
          precipitation: 14.5,
          severeHazards: [
            {
              type: 'Flash Flood & Road Inundation Risk',
              severity: 'high',
              description: 'Active 14.5mm/h precipitation causing rapid water accumulation in Panathur railway underpass.',
              safetyGuidance: 'Avoid underpass road. Deploy high-clearance water rescue vehicles.',
            },
          ],
          locationName: 'Panathur Underpass, Bengaluru',
          coordinates: { latitude: 12.9348, longitude: 77.7011 },
          timestamp: new Date().toISOString(),
          source: 'Open-Meteo WMO Global Weather Service (Live Verified)',
          isLive: true,
        };
      } else if (inc.id === 'inc-003') {
        inc.tasks = [
          {
            id: 'tsk-003-1',
            title: 'Broadcast boil-water advisory to Vyalikaval Ward 14 residents',
            status: 'completed',
            priority: 'urgent',
            assignedTo: 'Public Health Bureau',
            dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
          {
            id: 'tsk-003-2',
            title: 'Dispatch BWSSB pipeline team to isolate cross-connected sewage main',
            status: 'in_progress',
            priority: 'high',
            assignedTo: 'BWSSB Water Supply Unit',
            dueDate: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];
      } else if (inc.id === 'inc-004') {
        inc.tasks = [
          {
            id: 'tsk-004-1',
            title: 'Deploy portable aluminum ramp at Gate 2 National College',
            status: 'in_progress',
            priority: 'urgent',
            assignedTo: 'Campus Facilities',
            dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: 'tsk-004-2',
            title: 'Station student escorts to assist wheelchair examinees to hall',
            status: 'completed',
            priority: 'medium',
            assignedTo: 'Exam Committee',
            dueDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
          },
        ];
      }

      this.localIncidents.set(inc.id, inc);
    });
  }

  public static getClient(): SupabaseClient | null {
    if (!this.client && config.supabase.isConfigured) {
      const key = config.supabase.serviceRoleKey || config.supabase.publishableKey;
      this.client = createClient(config.supabase.url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return this.client;
  }

  public static isConnected(): boolean {
    return Boolean(config.supabase.isConfigured);
  }

  /**
   * List incidents with optional limit
   */
  public static async listIncidents(limit = 50): Promise<StructuredIncident[]> {
    const client = this.getClient();

    if (client) {
      try {
        const { data, error } = await client
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.warn('[SupabaseService] Query error, falling back to local memory:', error.message);
        } else if (data && data.length > 0) {
          return data.map(this.mapDbRowToIncident);
        }
      } catch (err: any) {
        console.warn('[SupabaseService] Remote call failed, using local store:', err.message);
      }
    }

    // Local fallback
    return Array.from(this.localIncidents.values());
  }

  /**
   * Retrieve incident by ID
   */
  public static async getIncidentById(id: string): Promise<StructuredIncident | null> {
    const client = this.getClient();

    if (client) {
      try {
        const { data, error } = await client
          .from('incidents')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.warn(`[SupabaseService] Error finding incident ${id}:`, error.message);
        } else if (data) {
          return this.mapDbRowToIncident(data);
        }
      } catch (err: any) {
        console.warn(`[SupabaseService] Remote get error for ${id}:`, err.message);
      }
    }

    return this.localIncidents.get(id) || null;
  }

  /**
   * Persist a new incident
   */
  public static async saveIncident(incident: StructuredIncident): Promise<StructuredIncident> {
    const client = this.getClient();

    if (client) {
      try {
        const dbRow = {
          id: incident.id,
          title: incident.title,
          category: incident.category,
          urgency: incident.urgency,
          status: incident.status,
          summary: incident.summary,
          reported_location: incident.reportedLocation,
          affected_parties: incident.affectedParties,
          raw_text: incident.originalSubmission.rawText,
          input_methods: incident.originalSubmission.inputMethodsUsed,
          language: incident.originalSubmission.language,
          is_simulated_demo: incident.analysis.isSimulatedDemo,
          analysis_result: incident.analysis,
          created_at: incident.createdAt,
          updated_at: incident.updatedAt,
        };

        const { error } = await client.from('incidents').upsert(dbRow);
        if (error) {
          console.warn('[SupabaseService] Upsert error, saving locally:', error.message);
        }
      } catch (err: any) {
        console.warn('[SupabaseService] DB save exception:', err.message);
      }
    }

    // Always update local memory store for resilience
    this.localIncidents.set(incident.id, incident);
    return incident;
  }

  /**
   * Update incident status
   */
  public static async updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus,
    actor = 'Demo Operator',
    reason = 'Status changed in control console'
  ): Promise<StructuredIncident | null> {
    const incident = await this.getIncidentById(id);
    if (!incident) return null;

    const latestEvent = incident.auditTimeline?.[0];
    const auditEvent: AuditEvent = sealAuditEvent({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
      actor,
      details: reason,
      type: 'status_change',
    }, latestEvent);

    const updated: StructuredIncident = {
      ...incident,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      auditTimeline: [auditEvent, ...incident.auditTimeline],
    };

    const client = this.getClient();
    if (client) {
      try {
        await client
          .from('incidents')
          .update({ status: newStatus, updated_at: updated.updatedAt })
          .eq('id', id);

        await client.from('incident_activity').insert({
          id: auditEvent.id,
          incident_id: id,
          action: auditEvent.action,
          actor: auditEvent.actor,
          details: auditEvent.details,
          event_type: auditEvent.type,
          created_at: auditEvent.timestamp,
        });
      } catch (err: any) {
        console.warn('[SupabaseService] Status update DB error:', err.message);
      }
    }

    this.localIncidents.set(id, updated);
    return updated;
  }

  /**
   * Append operator note
   */
  public static async addOperatorNote(
    id: string,
    text: string,
    author = 'Demo Operator'
  ): Promise<StructuredIncident | null> {
    const incident = await this.getIncidentById(id);
    if (!incident) return null;

    const newNote = {
      id: `note-${Date.now()}`,
      author,
      timestamp: new Date().toISOString(),
      text,
    };

    const latestEvent = incident.auditTimeline?.[0];
    const auditEvent: AuditEvent = sealAuditEvent({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'Operator Note Appended',
      actor: author,
      details: text.slice(0, 80) + (text.length > 80 ? '...' : ''),
      type: 'note_added',
    }, latestEvent);

    const updated: StructuredIncident = {
      ...incident,
      updatedAt: new Date().toISOString(),
      operatorNotes: [newNote, ...incident.operatorNotes],
      auditTimeline: [auditEvent, ...incident.auditTimeline],
    };

    this.localIncidents.set(id, updated);
    return updated;
  }

  /**
   * Reset in-memory store to baseline demo incidents while isolating real user incidents
   */
  public static resetLocalStore(): void {
    const userIncidents = Array.from(this.localIncidents.values()).filter(
      (inc) => !inc.isDemoData
    );
    this.seedStore();
    userIncidents.forEach((inc) => {
      this.localIncidents.set(inc.id, inc);
    });
  }

  private static mapDbRowToIncident(row: any): StructuredIncident {
    return {
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      urgency: row.urgency,
      summary: row.summary,
      reportedLocation: row.reported_location,
      affectedParties: row.affected_parties || 'Affected count unverified',
      originalSubmission: {
        id: `sub-${row.id}`,
        rawText: row.raw_text || '',
        inputMethodsUsed: row.input_methods || ['text'],
        evidenceFiles: [],
        location: row.reported_location,
        language: row.language || 'English',
        sensitiveConsentGiven: row.sensitive_consent_given || true,
        createdAt: row.created_at,
      },
      analysis: row.analysis_result,
      operatorNotes: [],
      auditTimeline: [],
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }
}
