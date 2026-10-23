import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  FileCheck, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Building2,
  Layers,
  HelpCircle
} from 'lucide-react';

export const ConvergenceVisual: React.FC = () => {
  const [selectedSignal, setSelectedSignal] = useState<'all' | 'voice' | 'photo' | 'document' | 'text'>('all');

  const signals = [
    {
      id: 'voice',
      label: 'Voice Audio',
      detail: '“...collapsed clutching chest, sweating...”',
      icon: Mic,
      color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
      activeBorder: 'border-amber-400',
    },
    {
      id: 'photo',
      label: 'Photo Evidence',
      detail: 'flooded_bus_waterlevel.jpg (3.8ft submersion)',
      icon: ImageIcon,
      color: 'text-aqua border-aqua/40 bg-aqua/10',
      activeBorder: 'border-aqua',
    },
    {
      id: 'document',
      label: 'Report / PDF',
      detail: 'ecg_prescription_prior_visit.pdf',
      icon: FileCheck,
      color: 'text-cobalt border-cobalt/40 bg-cobalt/10',
      activeBorder: 'border-cobalt',
    },
    {
      id: 'text',
      label: 'Direct Text',
      detail: '“Water main ruptured, foul sewage odor...”',
      icon: FileText,
      color: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
      activeBorder: 'border-purple-400',
    },
  ];

  return (
    <div className="w-full bg-midnight-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cobalt/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header with honest simulation labeling */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-aqua animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-aqua">
              Interactive Convergence Visualizer
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
              Illustrative Example
            </span>
          </div>
          <h3 className="text-lg font-display font-bold text-white mt-1">
            How Unstructured Real-World Signals Synthesize Into Clear Next Steps
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any input channel to inspect how SutrAI harmonizes noisy clues into prioritized action.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSignal('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedSignal === 'all'
                ? 'bg-cobalt text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            All Signals (Full Synthesis)
          </button>
          <Link
            to="/workspace"
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50 transition-all flex items-center gap-1.5"
          >
            <span>Try Live Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Interactive 3-Column Convergence Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Column 1: Unstructured Multimodal Ingestion (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-aqua" />
            <span>1. Raw Multi-Source Signals (Click to filter)</span>
          </div>

          {signals.map((sig) => {
            const Icon = sig.icon;
            const isHighlighted = selectedSignal === 'all' || selectedSignal === sig.id;

            return (
              <button
                key={sig.id}
                type="button"
                onClick={() => setSelectedSignal(sig.id as any)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between group ${
                  isHighlighted
                    ? `${sig.color} shadow-sm border-2`
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500 opacity-50 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-900/90 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-200">{sig.label}</div>
                    <div className="text-[11px] text-slate-400 truncate">{sig.detail}</div>
                  </div>
                </div>

                <div className="w-2 h-2 rounded-full bg-current opacity-70 group-hover:scale-125 transition-transform" />
              </button>
            );
          })}
        </div>

        {/* Column 2: Central Sutra Reasoning Node (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4">
          <div className="relative flex flex-col items-center">
            {/* Pulsing ring indicator */}
            <div className="w-28 h-28 rounded-full border-2 border-aqua/30 flex items-center justify-center animate-pulse-slow">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-aqua shadow-glow-aqua flex flex-col items-center justify-center text-center p-2">
                <Sparkles className="w-6 h-6 text-aqua mb-0.5" />
                <span className="text-[10px] font-mono font-bold uppercase text-white tracking-wider">
                  SUTRA CORE
                </span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs font-mono text-aqua font-bold">
                Correlating Evidence & Grounding
              </span>
              <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                Harmonizes multi-source inputs, checks official civic directory, and deduces highest-impact intervention.
              </p>
            </div>
          </div>
        </div>

        {/* Column 3: Structured Understanding & Next Step (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold mb-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cobalt" />
            <span>2. Recommended Operational Action</span>
          </div>

          <div className="bg-slate-900/90 border border-cobalt/40 rounded-2xl p-4 shadow-subtle-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Priority: Critical
              </span>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 font-semibold">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                Simulated Output
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                {selectedSignal === 'photo'
                  ? 'Deploy Emergency High-Capacity Dewatering Pumps & Barricade Underpass'
                  : selectedSignal === 'document' || selectedSignal === 'voice'
                  ? 'Dispatch Advanced Life Support (ALS) Ambulance with Hospital Cath Lab Pre-Alert'
                  : 'Multi-Modal Verified Emergency Intervention Selected'}
              </h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                {selectedSignal === 'photo'
                  ? 'Intake height clearance exceeded. Divert school bus traffic via Marathahalli Elevated Road immediately.'
                  : 'Electrocardiogram history combined with acute chest agony voice markers warrants immediate ALS cardiac protocol.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-aqua" />
                <span>Simulated Target: 108 Emergency Medical Command</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
