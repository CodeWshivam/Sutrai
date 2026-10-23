import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft, 
  FileCheck, 
  HelpCircle, 
  LayoutDashboard, 
  Layers, 
  Building2,
  FileText,
  Sparkles,
  Download
} from 'lucide-react';
import { IncidentService } from '../services/incidentService';
import { StructuredIncident, VerificationStatus } from '../types';
import { SignalPath } from '../components/common/SignalPath';
import { RecommendedActionCard } from '../components/common/RecommendedActionCard';
import { RouteComparisonCard } from '../components/common/RouteComparisonCard';
import { EmergencyBanner } from '../components/common/EmergencyBanner';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<StructuredIncident | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      const data = IncidentService.getById(id);
      if (data) {
        setIncident(data);
      } else {
        // Fallback to first demo incident if id not found
        const first = IncidentService.getAll()[0];
        setIncident(first);
      }
    }
  }, [id]);

  if (!incident) {
    return (
      <div className="min-h-screen bg-cloud flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cobalt/20 border-t-cobalt rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-600 font-mono">Loading structured results...</p>
        </div>
      </div>
    );
  }

  const { analysis } = incident;

  const handleCopySummary = () => {
    const textToCopy = `[SutrAI Incident Summary: ${incident.id}]\nCategory: ${incident.category.toUpperCase()}\nUrgency: ${incident.urgency.toUpperCase()}\nSummary: ${incident.summary}\nLocation: ${incident.reportedLocation.address}\nRecommended Action: ${analysis.recommendedAction.title}\nResponsible Authority: ${analysis.recommendedAction.responsibleAuthority.name}\nStatus: ${incident.status}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateActionStatus = (newStatus: any) => {
    const updated = IncidentService.updateStatus(incident.id, newStatus, 'Control Operator', 'Status adjusted from Results View');
    if (updated) setIncident({ ...updated });
  };

  const verificationBadge: Record<VerificationStatus, { text: string; bg: string }> = {
    user_reported: { text: 'Citizen Observation', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    ai_extracted: { text: 'AI-Extracted Claim', bg: 'bg-cobalt/10 text-cobalt border-cobalt/20' },
    corroborated: { text: 'Corroborated by Evidence', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    independently_verified: { text: 'Independently Verified', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
    unverified: { text: 'Unverified Flag', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    conflicting: { text: 'Conflicting Signals', bg: 'bg-coral/10 text-coral border-coral/30' },
  };

  return (
    <div className="min-h-screen bg-cloud py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-midnight transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Multimodal Workspace</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Summary Copied!' : 'Copy Summary'}</span>
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-midnight-950 text-white hover:bg-midnight-900 text-xs font-semibold shadow-sm transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-aqua" />
              <span>Operations Console</span>
            </Link>
          </div>
        </div>

        {/* Dedicated Emergency Advisory Banner (if critical) */}
        {incident.urgency === 'critical' && (
          <EmergencyBanner
            location={incident.reportedLocation}
            scenarioName={incident.title}
            isSimulated={true}
          />
        )}

        {/* Signal Path Progress Bar (Stage 4: Act) */}
        <SignalPath currentStage="act" interactive={false} />

        {/* Report Overview Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-subtle-card space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-midnight-950 text-aqua">
                Category: {incident.category.toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                Incident ID: {incident.id}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: {incident.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Reported {new Date(incident.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-midnight tracking-tight">
              {incident.title}
            </h1>
            <p className="text-sm text-slate-700 mt-2 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              {incident.summary}
            </p>
          </div>

          {/* Location & Impact Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-coral mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block">Reported Location:</strong>
                <span className="text-slate-600">
                  {incident.reportedLocation.address}
                </span>
                {incident.reportedLocation.landmark && (
                  <div className="text-slate-400 text-[11px]">
                    Landmark: {incident.reportedLocation.landmark}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-cobalt mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block">Estimated Affected Scope:</strong>
                <span className="text-slate-600">{incident.affectedParties}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY SIGNATURE: INTELLIGENT ACTION ROUTING CARD */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cobalt animate-pulse" />
            <h2 className="text-lg font-display font-bold text-midnight tracking-tight">
              Intelligent Action Recommendation
            </h2>
          </div>

          <RecommendedActionCard
            action={analysis.recommendedAction}
            evidenceItems={incident.originalSubmission.evidenceFiles}
            onUpdateStatus={handleUpdateActionStatus}
          />
        </section>

        {/* ROUTE COMPARISON CARD (If applicable to incident) */}
        {analysis.routeComparison && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-aqua" />
              <h2 className="text-lg font-display font-bold text-midnight tracking-tight">
                Alternative Route & Access Comparison
              </h2>
            </div>
            <RouteComparisonCard data={analysis.routeComparison} />
          </section>
        )}

        {/* EVIDENCE EXAMINE & CLAIM VERIFICATION MATRIX */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Extracted Claims with Verification Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cobalt" />
                <span>Extracted Claims & Ground Verification</span>
              </h3>
            </div>

            <div className="space-y-3">
              {analysis.extractedClaims.map((claim) => {
                const badge = verificationBadge[claim.verificationStatus] || verificationBadge.user_reported;
                return (
                  <div
                    key={claim.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${badge.bg}`}>
                        {badge.text}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        Source: {claim.sourceType}
                      </span>
                    </div>

                    <p className="text-slate-900 font-medium">{claim.claim}</p>

                    {claim.notes && (
                      <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                        {claim.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Evidence Files & Missing Data Uncertainty */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-subtle-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-aqua" />
                <span>Gaps, Uncertainties & Attachments</span>
              </h3>
            </div>

            {/* Uncertainties */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Decision Gaps (No Hallucinated Certainty):
              </span>
              {analysis.uncertainties.length === 0 ? (
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-200">
                  No blocking uncertainties detected.
                </div>
              ) : (
                analysis.uncertainties.map((unc) => (
                  <div
                    key={unc.id}
                    className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-1"
                  >
                    <strong className="block">{unc.question}</strong>
                    <div className="text-[11px] text-slate-600">
                      <strong>Impact:</strong> {unc.impactOnAction}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Evidence Attachments */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Attached Evidence Files ({incident.originalSubmission.evidenceFiles.length}):
              </span>
              <div className="space-y-1.5">
                {incident.originalSubmission.evidenceFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {(file.sizeBytes / 1024).toFixed(0)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Processed in <strong className="font-mono text-slate-800 dark:text-slate-200">{analysis.processingTimeMs} ms</strong> via SutrAI Multimodal Ingestion Pipeline.
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/incidents/${incident.id}`}
              className="text-cobalt hover:underline font-semibold"
            >
              Open Full Incident Record & Operator Audit Logs →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
