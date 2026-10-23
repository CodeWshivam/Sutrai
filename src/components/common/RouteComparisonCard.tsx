import React from 'react';
import { RouteComparisonData } from '../../types';
import { 
  Navigation, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Map, 
  Compass, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

interface RouteComparisonCardProps {
  data: RouteComparisonData;
  className?: string;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({
  data,
  className = '',
}) => {
  return (
    <div className={`bg-cloud-card border border-slate-200 rounded-2xl shadow-subtle-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-midnight-950 p-5 text-white border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cobalt/20 border border-cobalt/40 flex items-center justify-center text-cobalt">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-aqua">
              Intelligent Route & Access Routing
            </span>
          </div>

          <span className="px-2.5 py-0.5 text-[11px] font-mono bg-slate-900 border border-slate-700 text-slate-300 rounded-md">
            Freshness: {data.dataFreshness}
          </span>
        </div>

        <h3 className="text-lg font-display font-bold text-white">
          Safe Detour & Access Corridor Comparison
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Ground-truth route evaluation balancing travel time, waterlogging hazards, and vehicle clearances.
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Preferred Route Card */}
        <div className="border-2 border-emerald-500/60 bg-emerald-50/40 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white font-mono text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-lg tracking-wider">
            RECOMMENDED CHOICE
          </div>

          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-base font-bold text-slate-900">
                  {data.preferredRoute.name}
                </h4>
              </div>

              {/* Metrics Pill Grid */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs">
                {data.preferredRoute.distanceKm && (
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-800">
                    Distance: <strong>{data.preferredRoute.distanceKm} km</strong>
                  </span>
                )}
                {data.preferredRoute.etaMinutes && (
                  <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 font-mono text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cobalt" />
                    ETA: <strong>~{data.preferredRoute.etaMinutes} mins</strong>
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Safety Score: {data.preferredRoute.safetyScore}/10
                </span>
              </div>

              {/* Condition Summary */}
              <p className="mt-3 text-xs text-slate-700 bg-white/80 p-3 rounded-lg border border-slate-200/80">
                <strong className="text-slate-900">Road Condition: </strong>
                {data.preferredRoute.conditionSummary}
              </p>

              {/* Why Selected */}
              <div className="mt-2 text-xs text-emerald-900 font-medium">
                <strong>Why Selected: </strong>
                {data.preferredRoute.whySelected}
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Routes Grid */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-500 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Assessed Alternatives & Risk Factors</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="border border-slate-200 bg-slate-50/70 rounded-xl p-4 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-slate-900">{alt.name}</h5>
                  {alt.etaMinutes && (
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      ~{alt.etaMinutes} mins
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-700">
                  <strong className="text-slate-900">Observed Condition: </strong>
                  {alt.tradeOff}
                </div>

                <div className="p-2.5 rounded-lg bg-coral/10 border border-coral/20 text-xs text-coral font-medium flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-coral">Why NOT recommended: </strong>
                    {alt.whyNotRecommended}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing information preventing complete certainty */}
        {data.missingInformationForBetterComparison && data.missingInformationForBetterComparison.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-700" />
              <span>Missing Live Information for Absolute Route Geometry:</span>
            </div>
            <ul className="list-disc list-inside text-slate-700 space-y-0.5 pl-1">
              {data.missingInformationForBetterComparison.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Honest Disclosure Badge */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Routing Data: Powered by live OpenStreetMap OSRM routing engine with emergency dispatch priority.</span>
          <span className="font-mono text-cobalt font-semibold">OSRM Verified Routing</span>
        </div>
      </div>
    </div>
  );
};
