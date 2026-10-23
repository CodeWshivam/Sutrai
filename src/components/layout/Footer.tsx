import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  ExternalLink, 
  Layers, 
  HeartHandshake 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const categories = [
    'Medical & Health',
    'Road & Transport',
    'Civic & Community',
    'Weather & Disasters',
    'Environmental Hazards',
    'Public Safety',
    'Accessibility & Education',
  ];

  return (
    <footer className="bg-midnight-950 text-slate-400 border-t border-slate-800/80 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="md" showTagline={true} />
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Inspired by <span className="text-aqua font-semibold">“Sutra”</span> — the thread or connecting principle — SutrAI connects human intent, unstructured multimodal evidence, and reliable real-world action during critical societal situations.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition-colors"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Core Workflow */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-aqua" />
              <span>Signal Path Workflow</span>
            </h4>
            <ol className="text-xs space-y-2 font-mono text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-aqua flex items-center justify-center font-bold">1</span>
                <span>CAPTURE Raw Input</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-aqua flex items-center justify-center font-bold">2</span>
                <span>STRUCTURE Details</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-aqua flex items-center justify-center font-bold">3</span>
                <span>EXAMINE Evidence & Gaps</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-cobalt flex items-center justify-center font-bold">4</span>
                <span>CHOOSE Best Action</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-coral flex items-center justify-center font-bold">5</span>
                <span>FOLLOW THROUGH</span>
              </li>
            </ol>
          </div>

          {/* Quick links & Phase 1 status */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cobalt" />
              <span>Architecture & Status</span>
            </h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <Link to="/workspace" className="hover:text-aqua transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-aqua" />
                  <span>Multimodal Input Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-aqua transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cobalt" />
                  <span>Operations Console</span>
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-aqua transition-colors flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Settings & Demo Diagnostics</span>
                </Link>
              </li>
            </ul>
            <div className="mt-4 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-400">
              <span className="font-semibold text-aqua">System Operational:</span> Multimodal triage engine active. Full integration status & audit trail verified in Dashboard.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SutrAI Societal Action Initiative. Built for Hackathon Societal Impact.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <HeartHandshake className="w-3.5 h-3.5 text-coral" />
              <span>Safety-First & Evidence-Aware</span>
            </span>
            <Link to="/settings" className="text-slate-400 hover:text-white underline">
              Demo Disclosure
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
