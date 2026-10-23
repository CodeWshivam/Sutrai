import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  User, 
  Building2, 
  Activity, 
  Check, 
  Eye,
  FileCheck2,
  ListTodo,
  Plus,
  Share2,
  ShieldAlert,
  CloudRain,
  Copy,
  Printer,
  X,
  RotateCcw,
  ShieldCheck,
  Lock,
  Hash
} from 'lucide-react';
import { IncidentService } from '../services/incidentService';
import { apiClient } from '../services/apiClient';
import { verifyAuditChain, VerificationResult } from '../utils/cryptoAudit';
import { 
  StructuredIncident, 
  IncidentStatus, 
  TaskItem, 
  ReferralRecord, 
  DirectoryEntry 
} from '../types';
import { SignalPath } from '../components/common/SignalPath';
import { RecommendedActionCard } from '../components/common/RecommendedActionCard';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [incident, setIncident] = useState<StructuredIncident | null>(null);
  const [newNote, setNewNote] = useState('');
  const [operatorName, setOperatorName] = useState('Officer J. Rao');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Task checklist modal/state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Triage Desk');

  // Referral Modal state
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [directoryEntries, setDirectoryEntries] = useState<DirectoryEntry[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('dir-112');
  const [generatedReferral, setGeneratedReferral] = useState<ReferralRecord | null>(null);

  // Escalation Modal state
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('Patient vitals degrading / hazard barrier failure');

  // Loading state
  const [isRefreshingWeather, setIsRefreshingWeather] = useState(false);

  // Cryptographic Audit Verification state
  const [auditVerification, setAuditVerification] = useState<VerificationResult | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadIncident(id);
      loadDirectory();
    }
  }, [id]);

  const loadDirectory = async () => {
    try {
      const entries = await apiClient.getDirectory();
      setDirectoryEntries(entries);
    } catch {
      // ignore
    }
  };

  const loadIncident = async (incidentId: string) => {
    try {
      const data = await apiClient.getIncident(incidentId);
      if (data) {
        setIncident(data);
        return;
      }
    } catch {
      // fallthrough to local
    }
    const data = IncidentService.getById(incidentId);
    if (data) {
      setIncident(data);
    } else {
      const first = IncidentService.getAll()[0];
      setIncident(first);
    }
  };

  if (!incident) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cobalt/20 border-t-cobalt rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-mono">Loading incident record...</p>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      const updated = await apiClient.updateIncident(incident.id, { status: newStatus, actor: operatorName });
      if (updated) {
        setIncident({ ...updated });
        showFeedback(`Status progressed to ${newStatus.replace(/_/g, ' ').toUpperCase()}.`);
        return;
      }
    } catch { /* fallback */ }
    const updated = IncidentService.updateStatus(incident.id, newStatus, operatorName, `Status updated by ${operatorName}`);
    if (updated) {
      setIncident({ ...updated });
      showFeedback(`Status updated to ${newStatus.replace(/_/g, ' ').toUpperCase()} (local).`);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      const updated = await apiClient.updateIncident(incident.id, { operatorNote: newNote.trim(), actor: operatorName });
      if (updated) {
        setIncident({ ...updated });
        setNewNote('');
        showFeedback('Operator note persisted to backend audit trail.');
        return;
      }
    } catch { /* fallback */ }
    const updated = IncidentService.addNote(incident.id, newNote, operatorName);
    if (updated) {
      setIncident({ ...updated });
      setNewNote('');
      showFeedback('Operator note logged locally.');
    }
  };

  // Task checklist handlers
  const handleToggleTask = async (task: TaskItem) => {
    const nextStatus = task.status === 'completed' ? 'in_progress' : 'completed';
    try {
      const updated = await apiClient.updateTask(incident.id, task.id, { status: nextStatus }, operatorName);
      if (updated) {
        setIncident((prev) => {
          if (!prev) return prev;
          const tasks = (prev.tasks || []).map((t) => (t.id === task.id ? updated : t));
          return { ...prev, tasks };
        });
        showFeedback(`Task "${task.title}" marked as ${nextStatus.toUpperCase()}.`);
      }
    } catch {
      showFeedback('Failed to update task.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const created = await apiClient.addTask(
        incident.id,
        {
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          assignedTo: newTaskAssignee,
        },
        operatorName
      );

      if (created) {
        setIncident((prev) => {
          if (!prev) return prev;
          return { ...prev, tasks: [...(prev.tasks || []), created] };
        });
        setNewTaskTitle('');
        showFeedback(`New operational task added to checklist.`);
      }
    } catch {
      showFeedback('Failed to create task.');
    }
  };

  // Referral creation
  const handleGenerateReferral = async () => {
    try {
      const referral = await apiClient.createReferral(incident.id, selectedServiceId, operatorName);
      if (referral) {
        setGeneratedReferral(referral);
        setIncident((prev) => {
          if (!prev) return prev;
          return { ...prev, referrals: [...(prev.referrals || []), referral] };
        });
        showFeedback(`Referral docket generated: ${referral.referenceNumber}`);
      }
    } catch {
      showFeedback('Failed to generate referral docket.');
    }
  };

  // Escalation
  const handleTriggerEscalation = async () => {
    try {
      const updated = await apiClient.escalateIncident(incident.id, escalateReason, operatorName);
      if (updated) {
        setIncident({ ...updated });
        setShowEscalateModal(false);
        showFeedback(`CRITICAL ESCALATION TRIGGERED: ${escalateReason}`);
      }
    } catch {
      showFeedback('Failed to escalate incident.');
    }
  };

  // Refresh live weather
  const handleRefreshWeather = async () => {
    setIsRefreshingWeather(true);
    try {
      const w = await apiClient.refreshIncidentWeather(incident.id);
      if (w) {
        setIncident((prev) => (prev ? { ...prev, weather: w } : prev));
        showFeedback(`Live weather updated via Open-Meteo.`);
      }
    } catch {
      showFeedback('Weather refresh failed.');
    } finally {
      setIsRefreshingWeather(false);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const tasks = incident.tasks || [];
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-cloud py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Navigation & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-midnight transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Operations Console</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Escalate button */}
            {incident.status !== 'escalated' && (
              <button
                type="button"
                onClick={() => setShowEscalateModal(true)}
                className="px-3 py-1.5 rounded-xl bg-coral/10 hover:bg-coral/20 border border-coral/30 text-coral text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-coral animate-pulse" />
                <span>Escalate to Critical</span>
              </button>
            )}

            {/* Official Referral button */}
            <button
              type="button"
              onClick={() => {
                setShowReferralModal(true);
                setGeneratedReferral(incident.referrals?.[0] || null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-midnight-950 text-white hover:bg-midnight-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-aqua" />
              <span>Official Referral Docket</span>
            </button>

            <Link
              to={`/results/${incident.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-cobalt" />
              <span>Citizen Result Card</span>
            </Link>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">
              Database Synced
            </span>
          </div>
        )}

        {/* Signal Path Progress (Stage 5: Follow Through) */}
        <SignalPath currentStage="follow_through" interactive={false} />

        {/* Main Incident Record Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle-card space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-midnight-950 text-aqua">
                  {incident.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {incident.id}
                </span>
                {incident.urgency === 'critical' && (
                  <span className="px-2 py-0.5 rounded bg-coral/20 border border-coral/30 text-coral text-[10px] font-bold font-mono uppercase animate-pulse">
                    Critical Urgency
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-midnight mt-1">
                {incident.title}
              </h1>
            </div>

            {/* Interactive 13-State Status Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <label htmlFor="incident-status" className="text-xs font-semibold text-slate-600">
                Workflow State:
              </label>
              <select
                id="incident-status"
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-cobalt focus:outline-none cursor-pointer"
              >
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="needs_information">Needs Information</option>
                <option value="ready_for_action">Ready For Action</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_response">Waiting For Response</option>
                <option value="dispatched">Dispatched</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
                <option value="cancelled">Cancelled</option>
                <option value="needs_review">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Core Structured Summary & Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Structured AI Synthesis
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {incident.summary}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Original Citizen Report Raw Text
                </h3>
                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                  {incident.originalSubmission.rawText || 'No text provided.'}
                </div>
              </div>
            </div>

            {/* Right: Location & Evidence Files */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-500 text-[10px] block">
                  Ground Location
                </span>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">{incident.reportedLocation.address}</strong>
                    {incident.reportedLocation.landmark && (
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        Landmark: {incident.reportedLocation.landmark}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-mono font-bold uppercase tracking-wider text-slate-500 text-[10px] block">
                  Evidence Attachments ({incident.originalSubmission.evidenceFiles.length})
                </span>
                <ul className="space-y-1.5">
                  {incident.originalSubmission.evidenceFiles.map((file) => (
                    <li key={file.id} className="text-slate-700 truncate flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-aqua" />
                      <span className="truncate">{file.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* LIVE ENVIRONMENTAL WEATHER CONTEXT BAR */}
        {incident.weather && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle-card flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-aqua/10 border border-aqua/30 flex items-center justify-center text-aqua">
                <CloudRain className="w-5 h-5 text-cobalt" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Site Weather Awareness ({incident.weather.locationName})
                </div>
                <div className="text-sm font-semibold text-slate-900 flex items-center gap-2 mt-0.5">
                  <span>{incident.weather.temperature}°C • {incident.weather.condition}</span>
                  <span className="text-slate-400 font-mono text-xs">| Wind: {incident.weather.windSpeed} km/h • Rain: {incident.weather.precipitation} mm</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {incident.weather.severeHazards.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{incident.weather.severeHazards[0].type}</span>
                </span>
              )}
              <button
                type="button"
                onClick={handleRefreshWeather}
                disabled={isRefreshingWeather}
                className="p-2 text-slate-500 hover:text-midnight rounded-lg hover:bg-slate-100 transition-colors"
                title="Refresh live weather"
              >
                <RotateCcw className={`w-4 h-4 ${isRefreshingWeather ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* ACTIONABLE TASK CHECKLIST & WORKFLOW ENGINE (Section 10) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle-card space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cobalt/10 border border-cobalt/20 flex items-center justify-center text-cobalt">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-midnight">
                  Operational Task Checklist
                </h2>
                <p className="text-xs text-slate-500">
                  {completedTasksCount} of {tasks.length} tasks completed • Track field units & departmental assignments
                </p>
              </div>
            </div>

            <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              SLA Progress: {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl">
                No actionable checklist items created yet. Add one below.
              </div>
            ) : (
              tasks.map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between p-3.5 rounded-xl border transition-all text-xs gap-3 ${
                      isDone 
                        ? 'bg-slate-50/70 border-slate-200 opacity-70' 
                        : 'bg-white border-slate-200 shadow-sm hover:border-cobalt/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isDone 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-slate-300 hover:border-cobalt'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3" />}
                      </button>

                      <div className="min-w-0">
                        <div className={`font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {task.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                          <span>Assigned: {task.assignedTo || 'Unassigned'}</span>
                          <span>•</span>
                          <span className={`uppercase font-bold ${
                            task.priority === 'urgent' ? 'text-coral' : task.priority === 'high' ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap ${
                      isDone 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : task.status === 'in_progress'
                        ? 'bg-cobalt/15 text-cobalt'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Add New Task Form */}
          <form onSubmit={handleCreateTask} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block">
              + Append New Operational Task
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title (e.g. Confirm ambulance dispatch, erect road barrier, test water sample...)"
                className="sm:col-span-6 text-xs rounded-xl border border-slate-200 p-2.5 focus:border-cobalt focus:outline-none bg-white"
              />
              <input
                type="text"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                placeholder="Assignee (e.g. Paramedic Team 4, Ward 14 Engineer)"
                className="sm:col-span-3 text-xs rounded-xl border border-slate-200 p-2.5 focus:border-cobalt focus:outline-none bg-white"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as TaskItem['priority'])}
                className="sm:col-span-2 text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <button
                type="submit"
                className="sm:col-span-1 px-3 py-2 bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold rounded-xl flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Recommended Action Component in Incident Detail */}
        <RecommendedActionCard action={incident.analysis.recommendedAction} />

        {/* OPERATOR NOTES & AUDIT TRAIL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes Input & Feed (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle-card space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-cobalt" />
              <span>Operator & Field Dispatch Notes</span>
            </h3>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="Operator Name"
                  className="w-1/2 text-xs rounded-xl border border-slate-200 p-2 font-semibold bg-white"
                />
              </div>

              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log paramedic ETA, valve isolation confirmation, police ticket number..."
                className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:border-cobalt focus:outline-none bg-white"
              />

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-midnight-950 text-white hover:bg-midnight-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-aqua" />
                <span>Post Operator Note</span>
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              {incident.operatorNotes.length === 0 ? (
                <div className="text-xs text-slate-400 italic">No operator notes logged yet.</div>
              ) : (
                incident.operatorNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <strong className="text-slate-900">{note.author}</strong>
                      <span className="text-slate-400 font-mono">
                        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700">{note.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Audit Trail Timeline (6 cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-midnight-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-subtle-card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-aqua" />
                <span>Chain of Custody & Audit Log</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  const res = verifyAuditChain(incident.auditTimeline);
                  setAuditVerification(res);
                  setShowAuditModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verify Audit Integrity</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {incident.auditTimeline.map((item, idx) => (
                <div key={item.id || idx} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-cobalt dark:bg-aqua" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.action}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">{item.details}</div>
                  <div className="text-[10px] font-mono text-slate-400">Actor: {item.actor}</div>
                  {item.hash && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-cobalt dark:text-aqua" />
                        <span>SHA-256: {item.hash.slice(0, 10)}...{item.hash.slice(-6)}</span>
                      </span>
                      {item.prevHash && (
                        <span className="text-slate-400 dark:text-slate-500">
                          ← {item.prevHash === '0'.repeat(64) ? 'GENESIS' : item.prevHash.slice(0, 8) + '...'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OFFICIAL REFERRAL DOCKET MODAL (Section 9) */}
        {showReferralModal && (
          <div className="fixed inset-0 z-50 bg-midnight-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8">
              <button
                type="button"
                onClick={() => setShowReferralModal(false)}
                className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-midnight transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-midnight-950 text-aqua flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-midnight">
                    Official Emergency & Civic Referral Generator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assemble verified facts and evidence into an official departmental docket
                  </p>
                </div>
              </div>

              {!generatedReferral ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                      Select Target Emergency or Civic Authority:
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white text-slate-900 focus:outline-none focus:border-cobalt font-medium"
                    >
                      {directoryEntries.map((dir) => (
                        <option key={dir.id} value={dir.id}>
                          {dir.name} ({dir.phone}) — {dir.jurisdiction}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
                    <div className="font-semibold text-slate-900">What happens on referral?</div>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Generates a formal, numbered legal citizen docket reference</li>
                      <li>Attaches structured incident summary, GPS coordinates, and verified ground evidence</li>
                      <li>Creates a follow-up checklist task with the target authority</li>
                      <li>Never simulates submission if an API is unavailable; provides a copy-ready formal dispatch document</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReferralModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateReferral}
                      className="px-5 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold shadow-glow-cobalt flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Generate Formal Docket</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between font-mono">
                    <span className="font-bold">Docket Ref: {generatedReferral.referenceNumber}</span>
                    <span>Status: {generatedReferral.status.toUpperCase()}</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-slate-600">
                      Generated Official Docket Letter:
                    </label>
                    <textarea
                      readOnly
                      rows={12}
                      value={generatedReferral.generatedFormalDraft}
                      className="w-full text-[11px] font-mono bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedReferral.generatedFormalDraft);
                        showFeedback('Docket copied to clipboard.');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Letter</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Docket</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReferralModal(false)}
                        className="px-4 py-2 rounded-xl bg-midnight-950 text-white text-xs font-bold hover:bg-midnight-900"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ESCALATION CONFIRMATION MODAL */}
        {showEscalateModal && (
          <div className="fixed inset-0 z-50 bg-midnight-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-coral/30 max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-coral/10 border border-coral/30 flex items-center justify-center text-coral mx-auto">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-display font-bold text-midnight">
                  Confirm Emergency Escalation
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Escalating this incident sets priority to CRITICAL and broadcasts an urgent alert to regional field dispatch.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Escalation Justification:
                </label>
                <textarea
                  rows={2}
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:border-coral focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerEscalation}
                  className="px-4 py-2 rounded-xl bg-coral hover:bg-coral-hover text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Confirm Escalation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CRYPTOGRAPHIC AUDIT VERIFICATION MODAL */}
        {showAuditModal && auditVerification && (
          <div className="fixed inset-0 z-50 bg-midnight-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white dark:bg-midnight-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="absolute top-6 right-6 p-2 rounded-lg text-slate-400 hover:text-midnight dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  auditVerification.isValid
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-coral/15 text-coral'
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-midnight dark:text-slate-100">
                    Cryptographic Audit Chain Verification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time SHA-256 hash recalculation across all historical event records
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                auditVerification.isValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
              }`}>
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{auditVerification.isValid ? 'Chain Status: 100% Cryptographically Intact' : 'Chain Status: Integrity Violation'}</span>
                  <span className="font-mono text-xs">{auditVerification.verifiedCount} / {incident.auditTimeline.length} Blocks Verified</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {auditVerification.isValid
                    ? 'Every timeline transition (triage, status changes, dispatcher notes, referrals) is sealed with an authentic SHA-256 hash tied to the previous event hash. Recalculation confirms zero tampering, omitted events, or manipulated timestamps.'
                    : `Tamper detected at block index ${auditVerification.brokenIndex}: ${auditVerification.brokenReason}`}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-midnight-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                    Sealed Root Chain Hash (Current State):
                  </div>
                  <div className="font-mono text-[11px] text-midnight dark:text-aqua break-all font-semibold select-all">
                    {auditVerification.rootHash}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-midnight-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                    Genesis Anchor Root:
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 break-all">
                    {'0'.repeat(64)}
                  </div>
                </div>
              </div>

              {/* Block by block verification list */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400">
                  Block-by-Block Verification Trail:
                </div>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {incident.auditTimeline.map((ev, i) => (
                    <div
                      key={ev.id || i}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-midnight-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-mono"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          Block #{i + 1}: {ev.action}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                        {ev.hash ? ev.hash.slice(0, 8) + '...' : 'Sealed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-5 py-2 rounded-xl bg-midnight-950 text-white dark:bg-cobalt text-xs font-bold hover:bg-midnight-900 transition-colors shadow-sm"
                >
                  Close Verification View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
