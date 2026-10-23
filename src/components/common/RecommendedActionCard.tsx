import React, { useState } from 'react';
import { 
  RecommendedAction, 
  UrgencyLevel,
  EvidenceItem 
} from '../../types';
import { 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Building2, 
  ArrowRight, 
  HelpCircle, 
  Layers, 
  CheckCircle, 
  GitBranch, 
  Flame,
  FileCheck2,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface RecommendedActionCardProps {
  action: RecommendedAction;
  evidenceItems?: EvidenceItem[];
  onUpdateStatus?: (newStatus: RecommendedAction['actionStatus']) => void;
  className?: string;
}

export const RecommendedActionCard: React.FC<RecommendedActionCardProps> = ({
  action,
  evidenceItems = [],
  onUpdateStatus,
  className = '',
}) => {
  const [showAllAlternatives, setShowAllAlternatives] = useState(false);
  const [activeTab, setActiveTab] = useState<'rationale' | 'alternatives' | 'timeline' | 'uncertainties'>('rationale');

  const urgencyStyles: Record<UrgencyLevel, { badge: string; text: string; border: string }> = {
    critical: {
      badge: 'bg-coral/15 text-coral border-coral/30',
      text: 'text-coral',
      border: 'border-coral/40',
    },
    high: {
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    moderate: {
      badge: 'bg-cobalt/15 text-cobalt border-cobalt/30',
      text: 'text-cobalt',
      border: 'border-cobalt/30',
    },
    low: {
      badge: 'bg-slate-700/20 text-slate-300 border-slate-700/40',
      text: 'text-slate-300',
      border: 'border-slate-700/40',
    },
  };

  const currentUrgency = urgencyStyles[action.urgency] || urgencyStyles.moderate;

  return (
    <div className={`bg-cloud-card border ${currentUrgency.border} rounded-2xl shadow-subtle-card overflow-hidden transition-all ${className}`}>
      {/* Top Banner: Urgency & Action Category */}
      <div className="bg-midnight-950 text-white p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-md border ${currentUrgency.badge}`}>
              Priority: {action.urgency.toUpperCase()}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-md bg-aqua/10 text-aqua border border-aqua/30">
              AI-Routed Action
            </span>
          </div>

          {/* Current Action Status Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Action Status:</span>
            <select
              value={action.actionStatus}
              onChange={(e) => onUpdateStatus?.(e.target.value as RecommendedAction['actionStatus'])}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-aqua focus:outline-none cursor-pointer"
            >
              <option value="not_started">Not Started</option>
              <option value="dispatched">Dispatched</option>
              <option value="in_progress">In Progress</option>
              <option value="verified_resolved">Verified Resolved</option>
            </select>
          </div>
        </div>

        {/* Primary Recommended Title */}
        <h3 className="text-lg sm:text-xl font-display font-bold text-white tracking-tight">
          {action.title}
        </h3>

        {/* Suggested Responsible Authority */}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            <Building2 className="w-3.5 h-3.5 text-aqua" />
            <span className="font-semibold text-slate-200">
              {action.responsibleAuthority.name}
            </span>
            <span className="text-slate-400">({action.responsibleAuthority.department})</span>
          </div>
          {action.responsibleAuthority.isVerifiedService && (
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Public Service</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs for In-depth Scrutiny */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-semibold px-4 sm:px-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rationale')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'rationale'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          <span>Why Appropriate & Evidence</span>
        </button>

        <button
          onClick={() => setActiveTab('alternatives')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'alternatives'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Alternatives Comparison ({action.alternativesConsidered.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'timeline'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Execution Steps ({action.nextStepsTimeline.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('uncertainties')}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeTab === 'uncertainties'
              ? 'border-cobalt text-cobalt'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Uncertainties & Gaps ({action.missingOrUncertainDetails.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5 sm:p-6 bg-white">
        {/* TAB 1: Rationale & Evidence */}
        {activeTab === 'rationale' && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 mb-2">
                Detailed Decision Rationale
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 border border-slate-200/80 p-4 rounded-xl">
                {action.whyAppropriate}
              </p>
            </div>

            {/* Supporting evidence citations */}
            {evidenceItems.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 mb-2">
                  Corroborating Ground Evidence
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {evidenceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs"
                    >
                      <FileCheck2 className="w-4 h-4 text-aqua mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 truncate">{item.name}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {item.extractedSnippet || `${(item.sizeBytes / 1024).toFixed(0)} KB • ${item.category}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Alternatives Comparison */}
        {activeTab === 'alternatives' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-xs text-slate-600 mb-2">
              The AI evaluated multiple potential interventions before recommending the primary action. Here is the comparative evaluation:
            </div>

            {action.alternativesConsidered.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 bg-slate-50 rounded-lg">
                No viable alternatives met the minimum safety threshold for this scenario.
              </div>
            ) : (
              action.alternativesConsidered.map((alt) => (
                <div
                  key={alt.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <GitBranch className="w-4 h-4 text-slate-400" />
                      <span>{alt.title}</span>
                    </h5>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-semibold">
                      {alt.riskAssessment}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 mb-2">
                    <span className="font-semibold text-slate-900">Why not preferred: </span>
                    {alt.whyNotPreferred}
                  </div>

                  {alt.tradeOffs.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Trade-Off Factors:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                        {alt.tradeOffs.map((to, i) => (
                          <li key={i}>{to}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: Next Steps Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-xs text-slate-600 mb-2">
              Sequential checklist of actions required to bring this incident to resolution:
            </div>

            <div className="space-y-3">
              {action.nextStepsTimeline.map((step) => {
                const isDone = step.status === 'completed';
                const isInProgress = step.status === 'in_progress';

                return (
                  <div
                    key={step.stepNumber}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs transition-colors ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : isInProgress
                        ? 'bg-cobalt/5 border-cobalt/30 text-slate-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isInProgress
                          ? 'bg-cobalt text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isDone ? '✓' : step.stepNumber}
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold text-sm text-slate-900">
                        {step.description}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>Assigned: <strong className="text-slate-700">{step.responsibleParty}</strong></span>
                        {step.estimatedMinutes && (
                          <span>ETA: ~{step.estimatedMinutes} mins</span>
                        )}
                        <span className="capitalize font-mono px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-700">
                          {step.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Uncertainties */}
        {activeTab === 'uncertainties' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="text-xs text-slate-600 mb-2">
              Responsible AI Transparency: SutrAI highlights missing details instead of fabricating certainty.
            </div>

            {action.missingOrUncertainDetails.length === 0 ? (
              <div className="p-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>All critical decision criteria were established with sufficient certainty.</span>
              </div>
            ) : (
              action.missingOrUncertainDetails.map((unc) => (
                <div
                  key={unc.id}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">
                        {unc.question}
                      </span>
                      <div className="text-slate-700 mt-1">
                        <strong>Impact on Action:</strong> {unc.impactOnAction}
                      </div>
                      <div className="text-slate-600 mt-1 bg-white/70 p-2 rounded border border-amber-200/60">
                        <strong>Recommended way to resolve:</strong> {unc.suggestedWayToResolve}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
