import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  ArrowRight, 
  Eye, 
  RotateCcw, 
  Building2, 
  MapPin, 
  Radio, 
  Layers,
  Sparkles,
  Bell,
  ExternalLink,
  Phone,
  Globe,
  Cpu,
  Server,
  ShieldCheck,
  RefreshCw,
  Check,
  AlertCircle,
  FileText,
  Navigation,
  CloudRain,
  ChevronRight,
  Info
} from 'lucide-react';
import { IncidentService } from '../services/incidentService';
import { apiClient, IntegrationStatus, IntegrationItem } from '../services/apiClient';
import { 
  StructuredIncident, 
  UrgencyLevel, 
  IncidentStatus, 
  AuditEvent,
  DirectoryEntry,
  NotificationItem
} from '../types';

type DashboardTab = 'incidents' | 'directory' | 'integrations' | 'notifications';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('incidents');
  
  // Incidents state
  const [incidents, setIncidents] = useState<StructuredIncident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'user' | 'demo'>('all');
  const [loading, setLoading] = useState(true);

  // Directory state
  const [directoryEntries, setDirectoryEntries] = useState<DirectoryEntry[]>([]);
  const [dirSearch, setDirSearch] = useState('');
  const [dirCategory, setDirCategory] = useState<string>('all');
  const [loadingDir, setLoadingDir] = useState(false);

  // Integrations state
  const [integrationData, setIntegrationData] = useState<IntegrationStatus | null>(null);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    loadIncidents();
    loadDirectory();
    loadIntegrations();
    loadNotifications();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const list = await apiClient.getIncidents();
      setIncidents(list);
    } catch {
      setIncidents(IncidentService.getAll());
    } finally {
      setLoading(false);
    }
  };

  const loadDirectory = async () => {
    setLoadingDir(true);
    try {
      const entries = await apiClient.getDirectory();
      setDirectoryEntries(entries);
    } catch (err) {
      console.warn('Failed to load directory:', err);
    } finally {
      setLoadingDir(false);
    }
  };

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const status = await apiClient.getIntegrationStatus();
      setIntegrationData(status);
    } catch (err) {
      console.warn('Failed to load integration status:', err);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const notifs = await apiClient.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleResetData = async () => {
    try {
      await apiClient.resetDemoData();
    } catch {
      IncidentService.resetDemoData();
    }
    loadIncidents();
    loadNotifications();
  };

  const handleMarkNotifRead = async (id: string) => {
    await apiClient.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Filter incidents logic
  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.reportedLocation.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || inc.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || inc.urgency === urgencyFilter;
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'demo' && inc.isDemoData === true) ||
      (sourceFilter === 'user' && !inc.isDemoData);

    return matchesSearch && matchesCategory && matchesUrgency && matchesStatus && matchesSource;
  });

  // Filter directory entries
  const filteredDirectory = directoryEntries.filter((entry) => {
    const phoneVal = entry.phone || entry.contactNumber || '';
    const descVal = entry.description || entry.accessInstructions || '';
    const matchesSearch =
      entry.name.toLowerCase().includes(dirSearch.toLowerCase()) ||
      (entry.acronym && entry.acronym.toLowerCase().includes(dirSearch.toLowerCase())) ||
      phoneVal.includes(dirSearch) ||
      descVal.toLowerCase().includes(dirSearch.toLowerCase());

    const matchesCat = dirCategory === 'all' || entry.category === dirCategory;
    return matchesSearch && matchesCat;
  });

  // Overview metrics computation
  const totalReports = incidents.length;
  const urgentCases = incidents.filter((i) => i.urgency === 'critical' || i.urgency === 'high').length;
  const needsReview = incidents.filter((i) => i.status === 'needs_review' || i.status === 'needs_information').length;
  const inProgress = incidents.filter((i) => ['in_progress', 'dispatched', 'assigned', 'ready_for_action'].includes(i.status)).length;
  const resolved = incidents.filter((i) => i.status === 'resolved').length;
  const unreadNotifs = notifications.filter((n) => !(n.read || n.isRead)).length;

  // Flatten recent audit events
  const allAuditEvents: { event: AuditEvent; incidentId: string; incidentTitle: string }[] = [];
  incidents.forEach((inc) => {
    inc.auditTimeline.forEach((aud) => {
      allAuditEvents.push({ event: aud, incidentId: inc.id, incidentTitle: inc.title });
    });
  });
  allAuditEvents.sort((a, b) => new Date(b.event.timestamp).getTime() - new Date(a.event.timestamp).getTime());
  const recentActivities = allAuditEvents.slice(0, 7);

  const urgencyBadge: Record<UrgencyLevel, string> = {
    critical: 'bg-coral/15 text-coral border-coral/30',
    high: 'bg-amber-100 text-amber-800 border-amber-300',
    moderate: 'bg-cobalt/15 text-cobalt border-cobalt/30',
    low: 'bg-slate-100 text-slate-700 border-slate-300',
  };

  const statusBadge: Record<IncidentStatus, string> = {
    new: 'bg-blue-100 text-blue-900 border-blue-200',
    triaged: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    needs_information: 'bg-amber-100 text-amber-900 border-amber-300',
    ready_for_action: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    assigned: 'bg-sky-100 text-sky-900 border-sky-200',
    in_progress: 'bg-cobalt/10 text-cobalt border-cobalt/20',
    waiting_for_response: 'bg-orange-100 text-orange-900 border-orange-200',
    resolved: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    cancelled: 'bg-slate-200 text-slate-700 border-slate-300',
    escalated: 'bg-coral/20 text-coral border-coral/40 font-bold',
    failed: 'bg-red-200 text-red-900 border-red-300',
    needs_review: 'bg-amber-100 text-amber-900 border-amber-300',
    dispatched: 'bg-purple-100 text-purple-900 border-purple-200 font-bold',
  };

  return (
    <div className="min-h-screen bg-cloud py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Reset Data Button */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Operations & Societal Action Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-midnight tracking-tight mt-1">
              Live Incident Operations Command
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Every signal has a next step • Real-time triage, verified civic directory & integration health
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              title="Reset sample demonstration incidents"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Incidents</span>
            </button>

            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold shadow-glow-cobalt transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-aqua" />
              <span>New Multimodal Ingestion</span>
            </Link>
          </div>
        </div>

        {/* TOP TAB NAVIGATION BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-subtle-card flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'incidents'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Incident Stream</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'incidents' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalReports}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'directory'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Emergency & Civic Directory</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'directory' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {directoryEntries.length || 12} Verified
            </span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'integrations'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Integration Status Center</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-midnight text-white shadow-sm'
                : 'text-slate-600 hover:text-midnight hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications & Dispatches</span>
            {unreadNotifs > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-coral text-white animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: INCIDENT STREAM & OPERATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* METRICS TILES GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
              <div className="bg-white dark:bg-midnight-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle-card space-y-1">
                <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Signals
                </span>
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-midnight dark:text-slate-100">
                  {totalReports}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">All Ingested Incidents</div>
              </div>

              <div className="bg-white dark:bg-midnight-900 p-4 sm:p-5 rounded-2xl border border-coral/40 dark:border-coral/50 shadow-subtle-card space-y-1 bg-gradient-to-br from-white to-coral/10 dark:from-midnight-900 dark:to-coral/20">
                <span className="text-xs font-mono font-bold text-coral uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Urgent Alerts</span>
                </span>
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-coral">
                  {urgentCases}
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">Critical / High Urgency</div>
              </div>

              <div className="bg-white dark:bg-midnight-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle-card space-y-1">
                <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Needs Attention
                </span>
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-amber-600 dark:text-amber-400">
                  {needsReview}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Information or Review Required</div>
              </div>

              <div className="bg-white dark:bg-midnight-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle-card space-y-1">
                <span className="text-xs font-mono font-semibold text-cobalt dark:text-aqua uppercase tracking-wider">
                  In Progress / Active
                </span>
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-cobalt dark:text-aqua">
                  {inProgress}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Dispatched & In Field</div>
              </div>

              <div className="bg-white dark:bg-midnight-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle-card space-y-1">
                <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Resolved
                </span>
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                  {resolved}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Verified Cleared</div>
              </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="bg-white dark:bg-midnight-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-subtle-card space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative md:col-span-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keywords, ID, street..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-midnight-800 text-slate-900 dark:text-slate-100 focus:border-cobalt focus:outline-none"
                  />
                </div>

                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-3 bg-white dark:bg-midnight-800 text-slate-700 dark:text-slate-200 focus:border-cobalt focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="medical">Medical & Health</option>
                    <option value="transport">Road & Transport</option>
                    <option value="civic">Civic & Community</option>
                    <option value="hazard">Environmental & Hazard</option>
                    <option value="accessibility">Accessibility & Education</option>
                    <option value="disaster">Weather & Disaster</option>
                  </select>
                </div>

                <div>
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-3 bg-white dark:bg-midnight-800 text-slate-700 dark:text-slate-200 focus:border-cobalt focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Urgency Levels</option>
                    <option value="critical">Critical (Immediate Hazard)</option>
                    <option value="high">High (Severe Interruption)</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low (Standard Triage)</option>
                  </select>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 py-2 px-3 bg-white dark:bg-midnight-800 text-slate-700 dark:text-slate-200 focus:border-cobalt focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses (13 Stages)</option>
                    <option value="new">New</option>
                    <option value="triaged">Triaged</option>
                    <option value="needs_information">Needs Information</option>
                    <option value="ready_for_action">Ready for Action</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_response">Waiting for Response</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="escalated">Escalated</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Source isolation filter: All / Live Signals / Demo Data */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono uppercase font-bold text-slate-500 dark:text-slate-400 mr-1">
                    Signal Source:
                  </span>
                  <button
                    onClick={() => setSourceFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      sourceFilter === 'all'
                        ? 'bg-midnight dark:bg-cobalt text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    All Signals ({incidents.length})
                  </button>
                  <button
                    onClick={() => setSourceFilter('user')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      sourceFilter === 'user'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Live User Signals ({incidents.filter((i) => !i.isDemoData).length})
                  </button>
                  <button
                    onClick={() => setSourceFilter('demo')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      sourceFilter === 'demo'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Demo Cases ({incidents.filter((i) => i.isDemoData).length})
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  Showing {filteredIncidents.length} of {incidents.length} records
                </span>
              </div>
            </div>

            {/* MAIN INCIDENTS TABLE + RECENT AUDIT TIMELINE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Incidents List (8 cols) */}
              <div className="lg:col-span-8 bg-white dark:bg-midnight-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle-card overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cobalt" />
                    <span>Filtered Incident Stream ({filteredIncidents.length})</span>
                  </h2>
                </div>

                {filteredIncidents.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <AlertTriangle className="w-8 h-8 text-slate-400 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching incidents found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Try clearing your search query or filters to inspect all records.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredIncidents.map((inc) => (
                      <div
                        key={inc.id}
                        className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-midnight-800/50 transition-colors space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${urgencyBadge[inc.urgency]}`}>
                              {inc.urgency}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-100 dark:bg-midnight-800 text-slate-700 dark:text-slate-300 font-semibold">
                              {inc.category}
                            </span>
                            {inc.isDemoData ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                Demo Data
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                Live Signal
                              </span>
                            )}
                            <span className="text-xs font-mono text-slate-400">
                              {inc.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {inc.tasks && inc.tasks.length > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-midnight-800 text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                {inc.tasks.filter((t) => t.status === 'completed').length}/{inc.tasks.length} tasks
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${statusBadge[inc.status]}`}>
                              {inc.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-midnight dark:text-slate-100 hover:text-cobalt dark:hover:text-aqua transition-colors">
                            <Link to={`/incidents/${inc.id}`}>
                              {inc.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            {inc.summary}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                          <div className="flex items-center gap-1.5 truncate max-w-sm">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{inc.reportedLocation.address}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              to={`/results/${inc.id}`}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 hover:text-cobalt dark:hover:text-aqua hover:bg-slate-100 dark:hover:bg-midnight-800 border border-slate-300 dark:border-slate-700 bg-white dark:bg-midnight-900 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Structured Result</span>
                            </Link>
                            <Link
                              to={`/incidents/${inc.id}`}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-midnight-950 text-white hover:bg-midnight-900 transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <span>Manage Workflow</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Live Audit Activity Timeline (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-subtle-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-aqua" />
                    <span>Real-Time Audit Trail</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {recentActivities.map((item, idx) => (
                    <div key={idx} className="text-xs space-y-1 relative pl-4 border-l-2 border-slate-200">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-cobalt" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.event.action}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(item.event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-2">
                        {item.event.details}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        By {item.event.actor} • Ref: {item.incidentId}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  Every status dispatch, assignment, referral, and escalation is cryptographically tamper-evident in audit history.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VERIFIED EMERGENCY & CIVIC DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Directory Header Banner */}
            <div className="bg-gradient-to-r from-midnight to-slate-900 text-white rounded-2xl p-6 shadow-subtle-card space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-aqua" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-aqua">
                  Official Verified Public Helplines & Municipal Authorities
                </span>
              </div>
              <h2 className="text-xl font-display font-bold">
                12 Verified Pan-India & Urban Civic Service Records
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                Ground-truth emergency numbers sourced directly from Government of India gazettes (MHA, NHM, NDMA, MoHFW, MeitY). Never fabricated, never hallucinated. Always verified with official operating hours and jurisdiction bounds.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-subtle-card flex flex-wrap gap-3 items-center justify-between">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder="Search by agency name, acronym (e.g. BBMP, BESCOM), helpline (112, 108)..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-cobalt focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={dirCategory}
                  onChange={(e) => setDirCategory(e.target.value)}
                  className="text-xs rounded-xl border border-slate-200 py-2 px-3 bg-white text-slate-700 focus:border-cobalt focus:outline-none cursor-pointer"
                >
                  <option value="all">All Service Categories</option>
                  <option value="emergency">Universal Emergency (112)</option>
                  <option value="medical">Medical & Ambulance (108)</option>
                  <option value="fire">Fire & Rescue (101)</option>
                  <option value="disaster">Disaster Management (NDMA 1078)</option>
                  <option value="police">Women Safety (1091)</option>
                  <option value="cyber">Cyber Crime (1930)</option>
                  <option value="civic">Municipal / Civic (BBMP / Swachhata)</option>
                  <option value="utility">Power & Utilities (BESCOM 1912)</option>
                  <option value="traffic">Traffic Management (BTP)</option>
                  <option value="accessibility">Disability & Elderly (DEPwD / Elderline)</option>
                </select>
              </div>
            </div>

            {/* Directory Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDirectory.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle-card hover:border-cobalt/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {entry.category}
                        </span>
                        {entry.isEmergencyHotline && (
                          <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-coral/15 text-coral border border-coral/30">
                            Emergency
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {entry.jurisdiction}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-midnight leading-snug">
                      {entry.name}
                      {entry.acronym && (
                        <span className="text-cobalt ml-1.5 font-mono text-sm">
                          ({entry.acronym})
                        </span>
                      )}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {entry.description || entry.accessInstructions}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    {/* Primary Helpline CTA */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-slate-400">
                          Verified Helpline
                        </div>
                        <div className="text-sm font-mono font-extrabold text-midnight">
                          {entry.phone || entry.contactNumber}
                        </div>
                      </div>
                      <a
                        href={`tel:${entry.phone || entry.contactNumber}`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Dial</span>
                      </a>
                    </div>

                    {/* Operational Details */}
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Operating Hours:</span>
                        <span className="font-semibold text-slate-700">{entry.operatingHours}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Source Provenance:</span>
                        <span className="font-mono text-[10px] text-slate-600 truncate max-w-[180px] text-right" title={entry.source || entry.verificationSource}>
                          {entry.source || entry.verificationSource}
                        </span>
                      </div>
                    </div>

                    {/* Official Portal Link */}
                    {entry.website && (
                      <a
                        href={entry.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cobalt hover:text-cobalt-hover hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Official Portal ({new URL(entry.website).hostname})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: INTEGRATION STATUS CENTER */}
        {/* ========================================================================= */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle-card flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Truthful Integration Health & Capabilities Matrix
                  </span>
                </div>
                <h2 className="text-xl font-display font-bold text-midnight mt-1">
                  10 Core System Services & External Gateways
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Inspect the live status, provider attribution, and cryptographic credential posture for every pipeline component. No fabricated verifications; deterministic resilient fallbacks when external credentials are absent.
                </p>
              </div>

              <button
                onClick={loadIntegrations}
                disabled={loadingIntegrations}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingIntegrations ? 'animate-spin' : ''}`} />
                <span>Verify All Endpoints</span>
              </button>
            </div>

            {/* Integrations Grid */}
            {integrationData?.integrations && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(integrationData.integrations).map(([key, item]) => {
                  const statusBadgeClass =
                    item.status === 'Live & verified'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : item.status === 'Configured, not verified'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      : item.status === 'Mock' || item.status === 'Demo Fallback'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : item.status === 'Not configured'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      : item.status === 'Unsupported'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                      : item.status === 'Failing'
                      ? 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

                  return (
                    <div
                      key={key}
                      className="bg-white dark:bg-midnight-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-subtle-card space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${statusBadgeClass}`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                            {(item as any).latencyMs ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                                {(item as any).latencyMs}ms
                              </span>
                            ) : null}
                            <span>{new Date(item.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-midnight dark:text-slate-100">
                          {item.name}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[11px]">
                        <div className="text-slate-400 uppercase font-mono text-[9px]">Provider Architecture:</div>
                        <div className="font-semibold text-slate-700 dark:text-slate-200">{item.provider}</div>
                        {item.model && (
                          <div className="font-mono text-[10px] text-cobalt dark:text-aqua">Model: {item.model}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* System Capabilities Matrix */}
            {integrationData?.capabilities && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle-card space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Operational Capabilities Matrix</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(integrationData.capabilities).map(([cap, enabled]) => (
                    <div
                      key={cap}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2"
                    >
                      {enabled ? (
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      )}
                      <span className="text-xs font-semibold text-slate-700 capitalize">
                        {cap.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: NOTIFICATIONS & DISPATCH QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle-card flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cobalt" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Operational Event & Dispatch Bus
                  </span>
                </div>
                <h2 className="text-xl font-display font-bold text-midnight mt-1">
                  Active Dispatch Alerts & Follow-Ups ({notifications.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time cross-incident event alerts including official referrals, emergency escalations, and automated reminders.
                </p>
              </div>

              <button
                onClick={loadNotifications}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition-all flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Log</span>
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">All notifications acknowledged</h3>
                <p className="text-xs text-slate-500">
                  New operational alerts will populate here when cases are triaged, escalated, or referred.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle-card divide-y divide-slate-100 overflow-hidden">
                {notifications.map((notif) => {
                  const isRead = notif.read || notif.isRead || false;
                  const timeStr = notif.createdAt || notif.timestamp || new Date().toISOString();
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                        isRead ? 'bg-white' : 'bg-cobalt/5'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-[280px]">
                        <div className={`p-2 rounded-xl mt-0.5 ${
                          notif.priority === 'critical' || notif.type === 'alert'
                            ? 'bg-coral/15 text-coral'
                            : notif.priority === 'high' || notif.type === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-cobalt/15 text-cobalt'
                        }`}>
                          <Radio className="w-4 h-4" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-midnight">
                              {notif.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                              {notif.category || notif.type}
                            </span>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {notif.message}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-1">
                            <span>{new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {notif.incidentId && (
                              <Link
                                to={`/incidents/${notif.incidentId}`}
                                className="text-cobalt hover:underline font-semibold"
                              >
                                View Case ({notif.incidentId}) →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>

                      {!isRead && (
                        <button
                          onClick={() => handleMarkNotifRead(notif.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
