import React, { useState } from 'react';
import { 
  Radio, 
  FileSearch, 
  Scale, 
  Zap, 
  CheckCircle2, 
  Info,
  ChevronRight
} from 'lucide-react';

export type SignalStage = 'capture' | 'structure' | 'examine' | 'act' | 'follow_through';

interface SignalPathProps {
  currentStage: SignalStage;
  interactive?: boolean;
  onSelectStage?: (stage: SignalStage) => void;
  className?: string;
  stageDetails?: Partial<Record<SignalStage, string>>;
}

export const SignalPath: React.FC<SignalPathProps> = ({
  currentStage,
  interactive = true,
  onSelectStage,
  className = '',
  stageDetails,
}) => {
  const [hoveredStage, setHoveredStage] = useState<SignalStage | null>(null);

  const stages: {
    id: SignalStage;
    number: number;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'capture',
      number: 1,
      title: 'Capture',
      subtitle: 'Raw inputs & evidence',
      icon: Radio,
      accentColor: 'text-aqua border-aqua bg-aqua/10',
    },
    {
      id: 'structure',
      number: 2,
      title: 'Structure',
      subtitle: 'Organized core facts',
      icon: FileSearch,
      accentColor: 'text-aqua border-aqua bg-aqua/10',
    },
    {
      id: 'examine',
      number: 3,
      title: 'Examine',
      subtitle: 'Gaps & conflicts',
      icon: Scale,
      accentColor: 'text-cobalt border-cobalt bg-cobalt/10',
    },
    {
      id: 'act',
      number: 4,
      title: 'Act',
      subtitle: 'Best action routing',
      icon: Zap,
      accentColor: 'text-cobalt border-cobalt bg-cobalt/10',
    },
    {
      id: 'follow_through',
      number: 5,
      title: 'Follow Through',
      subtitle: 'Tracking & closure',
      icon: CheckCircle2,
      accentColor: 'text-coral border-coral bg-coral/10',
    },
  ];

  const stageOrder: SignalStage[] = ['capture', 'structure', 'examine', 'act', 'follow_through'];
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className={`w-full bg-midnight-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-subtle-card ${className}`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-aqua animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
            Signal Path Progress
          </span>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Stage {currentIndex + 1} of 5:{' '}
          <span className="font-semibold text-aqua capitalize">
            {currentStage.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Desktop Horizontal Progression */}
      <div className="hidden lg:grid grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isPending = idx > currentIndex;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="relative flex flex-col">
              {/* Connecting thread bar */}
              {idx < stages.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-[2px] -z-0 transition-all duration-300 ${
                    idx < currentIndex ? 'bg-aqua' : 'bg-slate-800'
                  }`}
                />
              )}

              <button
                type="button"
                disabled={!interactive}
                onClick={() => interactive && onSelectStage?.(stage.id)}
                onMouseEnter={() => setHoveredStage(stage.id)}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative z-10 flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 text-left ${
                  isCurrent
                    ? 'bg-slate-900 border-aqua shadow-glow-aqua/30 ring-1 ring-aqua/50'
                    : isPassed
                    ? 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                } ${interactive ? 'cursor-pointer hover:bg-slate-900' : 'cursor-default'}`}
              >
                {/* Node circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                    isCurrent
                      ? 'bg-aqua text-midnight font-extrabold shadow-glow-aqua scale-110'
                      : isPassed
                      ? 'bg-slate-800 text-aqua border border-aqua/40'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="text-xs font-semibold text-white tracking-tight flex items-center gap-1">
                  <span>{stage.title}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {stage.subtitle}
                </div>

                {stageDetails?.[stage.id] && (
                  <div className="mt-2 text-[10px] text-slate-300 bg-slate-950/70 border border-slate-800 rounded px-2 py-1 max-w-full text-left leading-tight break-words">
                    {stageDetails[stage.id]}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Vertical / Wrap Progression */}
      <div className="lg:hidden space-y-2.5">
        {stages.map((stage, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = stage.icon;

          return (
            <button
              key={stage.id}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onSelectStage?.(stage.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'bg-slate-900 border-aqua ring-1 ring-aqua/40'
                  : isPassed
                  ? 'bg-slate-900/50 border-slate-700/60 text-slate-300'
                  : 'bg-slate-950/30 border-slate-800/40 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isCurrent
                      ? 'bg-aqua text-midnight'
                      : isPassed
                      ? 'bg-slate-800 text-aqua border border-aqua/30'
                      : 'bg-slate-900 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{stage.number}. {stage.title}</span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.2 text-[9px] font-mono bg-aqua/20 text-aqua rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{stage.subtitle}</div>
                </div>
              </div>

              <ChevronRight className={`w-4 h-4 ${isCurrent ? 'text-aqua' : 'text-slate-600'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
