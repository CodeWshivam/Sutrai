import { 
  StructuredIncident, 
  IncidentStatus, 
  TaskItem, 
  ReferralRecord, 
  ScheduledReminder, 
  NotificationItem, 
  AuditEvent 
} from '../../src/types';
import { SupabaseService } from './supabaseService';
import { DirectoryService } from './directoryService';

export class WorkflowService {
  // In-memory notifications queue for cross-system alerts
  private static notifications: NotificationItem[] = [];

  /**
   * Allowed state transitions map
   */
  private static readonly VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
    new: ['triaged', 'needs_information', 'in_progress', 'cancelled'],
    triaged: ['ready_for_action', 'needs_information', 'assigned', 'in_progress', 'cancelled', 'escalated'],
    needs_information: ['triaged', 'in_progress', 'cancelled'],
    ready_for_action: ['assigned', 'in_progress', 'dispatched', 'escalated', 'cancelled'],
    assigned: ['in_progress', 'waiting_for_response', 'dispatched', 'escalated', 'cancelled'],
    in_progress: ['waiting_for_response', 'resolved', 'escalated', 'cancelled'],
    waiting_for_response: ['in_progress', 'resolved', 'escalated', 'cancelled'],
    dispatched: ['in_progress', 'resolved', 'escalated'],
    needs_review: ['triaged', 'in_progress', 'dispatched', 'escalated', 'cancelled'],
    escalated: ['in_progress', 'resolved', 'cancelled'],
    resolved: ['new', 'in_progress'], // Allow reopening if needed
    cancelled: ['new'],
    failed: ['new', 'triaged'],
  };

  /**
   * Validates if a state transition is permitted
   */
  public static isValidTransition(currentStatus: IncidentStatus, nextStatus: IncidentStatus): boolean {
    if (currentStatus === nextStatus) return true;
    const allowed = this.VALID_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(nextStatus) : true;
  }

  /**
   * Transitions an incident's operational state with audit logging
   */
  public static async transitionStatus(
    incidentId: string,
    nextStatus: IncidentStatus,
    actor = 'Console Operator',
    reason?: string
  ): Promise<StructuredIncident> {
    const incident = await SupabaseService.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    if (!this.isValidTransition(incident.status, nextStatus)) {
      console.warn(`[WorkflowService] Unorthodox transition from ${incident.status} to ${nextStatus}, recording with override flag.`);
    }

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: `Status Transition: ${incident.status.toUpperCase()} -> ${nextStatus.toUpperCase()}`,
      actor,
      details: reason || `Operational state progressed to ${nextStatus.replace(/_/g, ' ')}.`,
      type: 'status_change',
    };

    incident.status = nextStatus;
    incident.updatedAt = new Date().toISOString();
    incident.auditTimeline = [auditEvent, ...incident.auditTimeline];

    // Auto-create a system notification on critical transitions
    if (['escalated', 'resolved', 'dispatched'].includes(nextStatus)) {
      this.createNotification({
        incidentId,
        title: `Incident ${incidentId.toUpperCase()} is now ${nextStatus.toUpperCase()}`,
        message: `${incident.title} was updated by ${actor}. ${reason || ''}`.trim(),
        type: nextStatus === 'escalated' ? 'alert' : nextStatus === 'resolved' ? 'success' : 'info',
        actionUrl: `/incidents/${incidentId}`,
      });
    }

    await SupabaseService.saveIncident(incident);
    return incident;
  }

  /**
   * Adds an actionable task checklist item to an incident
   */
  public static async addTask(
    incidentId: string,
    params: {
      title: string;
      description?: string;
      priority?: TaskItem['priority'];
      assignedTo?: string;
      dueDate?: string;
    },
    actor = 'Console Operator'
  ): Promise<TaskItem> {
    const incident = await SupabaseService.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const newTask: TaskItem = {
      id: `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: params.title.trim(),
      description: params.description?.trim(),
      status: 'pending',
      priority: params.priority || 'medium',
      assignedTo: params.assignedTo || 'Unassigned Field Unit',
      dueDate: params.dueDate || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!incident.tasks) incident.tasks = [];
    incident.tasks.push(newTask);

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: 'Task Checklist Item Added',
      actor,
      details: `Created task: "${newTask.title}" [Priority: ${newTask.priority.toUpperCase()}]`,
      type: 'status_change',
    };
    incident.auditTimeline = [auditEvent, ...incident.auditTimeline];
    incident.updatedAt = new Date().toISOString();

    await SupabaseService.saveIncident(incident);
    return newTask;
  }

  /**
   * Updates task status (e.g. pending -> in_progress -> completed)
   */
  public static async updateTask(
    incidentId: string,
    taskId: string,
    updates: Partial<TaskItem>,
    actor = 'Console Operator'
  ): Promise<TaskItem> {
    const incident = await SupabaseService.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    if (!incident.tasks) incident.tasks = [];
    const taskIndex = incident.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found in incident ${incidentId}`);
    }

    const existing = incident.tasks[taskIndex];
    const isNowCompleted = updates.status === 'completed' && existing.status !== 'completed';

    const updatedTask: TaskItem = {
      ...existing,
      ...updates,
      completedAt: isNowCompleted ? new Date().toISOString() : existing.completedAt,
    };

    incident.tasks[taskIndex] = updatedTask;

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: `Task Updated: "${updatedTask.title}"`,
      actor,
      details: `Status set to ${updatedTask.status.toUpperCase()}${updatedTask.assignedTo ? ` (Assigned: ${updatedTask.assignedTo})` : ''}`,
      type: 'status_change',
    };
    incident.auditTimeline = [auditEvent, ...incident.auditTimeline];
    incident.updatedAt = new Date().toISOString();

    await SupabaseService.saveIncident(incident);
    return updatedTask;
  }

  /**
   * Creates an official referral docket to an external emergency or civic authority
   */
  public static async createReferral(
    incidentId: string,
    serviceId: string,
    actor = 'Console Operator'
  ): Promise<ReferralRecord> {
    const incident = await SupabaseService.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const service = DirectoryService.getEntryById(serviceId) || DirectoryService.matchServiceForIncident(incident);
    const referral = DirectoryService.generateFormalReferral(incident, service);

    if (!incident.referrals) incident.referrals = [];
    incident.referrals.push(referral);

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: 'Official Referral Docket Generated',
      actor,
      details: `Referred to ${service.name} (Helpline: ${service.phone}) under Reference ${referral.referenceNumber}.`,
      type: 'status_change',
    };
    incident.auditTimeline = [auditEvent, ...incident.auditTimeline];
    incident.updatedAt = new Date().toISOString();

    // Auto-schedule follow-up task
    await this.addTask(incidentId, {
      title: `Follow up with ${service.name} on Docket ${referral.referenceNumber}`,
      description: `Verify dispatch and citizen handoff status with ${service.phone}.`,
      priority: 'high',
      assignedTo: actor,
      dueDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    }, actor);

    await SupabaseService.saveIncident(incident);
    return referral;
  }

  /**
   * Escalates an incident with urgent priority
   */
  public static async escalateIncident(
    incidentId: string,
    reason: string,
    actor = 'Console Operator'
  ): Promise<StructuredIncident> {
    const incident = await SupabaseService.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    incident.status = 'escalated';
    incident.urgency = 'critical';
    incident.escalationReason = reason;
    incident.escalatedAt = new Date().toISOString();

    const auditEvent: AuditEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      action: 'CRITICAL ESCALATION TRIGGERED',
      actor,
      details: `Incident escalated to CRITICAL: "${reason}". Emergency protocol activated.`,
      type: 'status_change',
    };
    incident.auditTimeline = [auditEvent, ...incident.auditTimeline];
    incident.updatedAt = new Date().toISOString();

    this.createNotification({
      incidentId,
      title: `CRITICAL ESCALATION: ${incident.title}`,
      message: `Escalated by ${actor}: ${reason}`,
      type: 'alert',
      actionUrl: `/incidents/${incidentId}`,
    });

    await SupabaseService.saveIncident(incident);
    return incident;
  }

  /**
   * Schedules a reminder / notification for an incident
   */
  public static async scheduleReminder(
    incidentId: string,
    params: {
      title: string;
      scheduledFor: string;
      channel?: ScheduledReminder['channel'];
      recipient?: string;
    }
  ): Promise<ScheduledReminder> {
    const incident = await SupabaseService.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const reminder: ScheduledReminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      incidentId,
      title: params.title.trim(),
      scheduledFor: params.scheduledFor,
      channel: params.channel || 'in_app',
      recipient: params.recipient,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    if (!incident.reminders) incident.reminders = [];
    incident.reminders.push(reminder);

    incident.updatedAt = new Date().toISOString();
    await SupabaseService.saveIncident(incident);

    return reminder;
  }

  /**
   * Dispatches an in-app system notification
   */
  public static createNotification(params: {
    incidentId?: string;
    title: string;
    message: string;
    type: NotificationItem['type'];
    actionUrl?: string;
  }): NotificationItem {
    const notif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      incidentId: params.incidentId,
      title: params.title,
      message: params.message,
      type: params.type,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: params.actionUrl,
    };

    this.notifications = [notif, ...this.notifications.slice(0, 49)];
    return notif;
  }

  /**
   * Lists in-app notifications
   */
  public static listNotifications(): NotificationItem[] {
    return this.notifications;
  }

  /**
   * Marks a notification as read
   */
  public static markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
  }
}
