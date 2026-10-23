import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Radio, 
  ShieldCheck, 
  Layers, 
  HeartPulse, 
  Compass, 
  Building, 
  CloudLightning, 
  Biohazard, 
  Accessibility, 
  Scale, 
  CheckCircle2, 
  Flame, 
  AlertTriangle,
  FileCheck2,
  Lock,
  Cpu
} from 'lucide-react';
import { ConvergenceVisual } from '../components/landing/ConvergenceVisual';
import { SignalPath } from '../components/common/SignalPath';

interface LandingPageProps {
  onTriggerEmergency?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onTriggerEmergency }) => {
  const domainShowcases = [
    {
      title: 'Medical & Cardiac Triage',
      category: 'Medical',
      icon: HeartPulse,
      accent: 'text-coral border-coral/30 bg-coral/10',
      summary: 'Distinguishes true cardiac emergencies from benign palpitations; pre-alerts catheterization labs before ambulance arrival.',
      exampleSignal: '“Father clutching left arm, cold sweat, prior stent in 2024...”',
      routedAction: 'Dispatch Advanced Life Support Unit & Pre-alert Manipal Hospital Cath Lab',
    },
    {
      title: 'Underpass Submersion & Transit',
      category: 'Transport',
      icon: Compass,
      accent: 'text-aqua border-aqua/30 bg-aqua/10',
      summary: 'Correlates rainfall gauges, photo watermarks, and bus clearance to compute safe detours and alert rescue crews.',
      exampleSignal: 'Photo of school bus submerged to bumper + Panathur Underpass GPS',
      routedAction: 'Deploy High-Volume Dewatering Pumps & Divert Traffic via Marathahalli Flyover',
    },
    {
      title: 'Drinking Water Cross-Contamination',
      category: 'Civic',
      icon: Building,
      accent: 'text-cobalt border-cobalt/30 bg-cobalt/10',
      summary: 'Traces pediatric gastroenteritis clusters and murky water photos to ruptured municipal distribution mains.',
      exampleSignal: 'Murky glass photo + medical clinic bill + Ward 14 resident reports',
      routedAction: 'Emergency Valve V-14-B Isolation & 4x Potable Tanker Deployment',
    },
    {
      title: 'Industrial Chemical Fires',
      category: 'Hazard',
      icon: Biohazard,
      accent: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      summary: 'Analyzes smoke color, wind vectors, and nearby schools to mandate upwind shelter-in-place before toxic exposure.',
      exampleSignal: 'Purple-black smoke photo + sweet chemical odor + battery shed fire',
      routedAction: 'School Ventilation Shutdown & Dry-Powder Hazmat Tender Dispatch',
    },
    {
      title: 'Exam Hall Accessibility Hurdles',
      category: 'Accessibility',
      icon: Accessibility,
      accent: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      summary: 'Bridges damaged ramps before national exams with rapid portable modular aluminum threshold installations.',
      exampleSignal: 'Photo of fractured wheelchair threshold at Gate 2 entrance',
      routedAction: 'Deploy Modular Telescopic Ramps & Station Disability Squad',
    },
    {
      title: 'Monsoon Flash Flood Hazards',
      category: 'Disaster',
      icon: CloudLightning,
      accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      summary: 'Integrates local weather radar, voice distress calls, and canal overflow reports to organize neighborhood rescue boats.',
      exampleSignal: 'Voice note: “Canal overflowing into low-lying elderly home...”',
      routedAction: 'Mobilize Disaster Response Lifeboats to Sector 3 Low-Ground',
    },
  ];

  return (
    <div className="min-h-screen bg-cloud text-midnight-900 selection:bg-aqua/20">
      {/* 1. HERO SECTION (Midnight Ink Dark Surface) */}
      <section className="relative bg-midnight-950 text-white pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
        
        {/* Glow Accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cobalt/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-aqua/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-md">
              <span className="w-2 h-2 rounded-full bg-aqua animate-pulse" />
              <span className="text-xs font-mono font-semibold text-slate-200 tracking-wide uppercase">
                SutrAI Societal Action Platform
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
              Every signal has a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-aqua via-cobalt-light to-aqua">
                next step.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              When crises strike, human information is chaotic — broken voices, shaky photos, fragmented texts. SutrAI connects messy signals into structured understanding, evidence-aware recommendations, and responsible real-world action.
            </p>

            {/* Call to Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/workspace"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-base font-bold text-white bg-cobalt hover:bg-cobalt-hover shadow-glow-cobalt rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-5 h-5 text-aqua" />
                <span>Transform a Signal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 rounded-xl transition-colors"
              >
                <span>Explore How It Works</span>
              </a>
            </div>

            {/* Simulated Emergency Quick Link */}
            <div className="pt-2">
              <button
                onClick={onTriggerEmergency}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-coral hover:text-coral-hover underline underline-offset-4 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Immediate Emergency Response Mode</span>
              </button>
            </div>
          </div>

          {/* Interactive Convergence Engine Visual */}
          <div className="mt-14 sm:mt-18">
            <ConvergenceVisual />
          </div>
        </div>
      </section>

      {/* 2. THE FIVE-STAGE SIGNAL PATH WORKFLOW SECTION */}
      <section id="how-it-works" className="py-20 bg-cloud border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cobalt bg-cobalt/10 px-3 py-1 rounded-full border border-cobalt/20">
              The Connecting Thread
            </span>
            <h2 className="text-3xl font-display font-bold text-midnight tracking-tight">
              From Raw Noise to Accountable Resolution
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              SutrAI does not merely chat or summarize. It guides every report through five rigorous stages to choose the safest, highest-impact intervention.
            </p>
          </div>

          {/* Signal Path Signature Component Demonstration */}
          <SignalPath 
            currentStage="examine" 
            interactive={true} 
            stageDetails={{
              capture: 'Ingests voice recordings, images, PDFs, GPS coordinates, and descriptions.',
              structure: 'Extracts core entities, timestamps, clinical/civic markers, and affected counts.',
              examine: 'Cross-checks evidence, flags missing data, and highlights conflicting claims.',
              act: 'Selects optimal next step, justifies why better than alternatives, and alerts agency.',
              follow_through: 'Tracks dispatched units, logs operator audit events, and verifies safety.',
            }}
          />

          {/* Detailed 5-Stage Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-6">
            {[
              {
                step: '01',
                title: 'Capture',
                desc: 'Accepts voice notes, photos, documents, and text simultaneously without forced forms.',
              },
              {
                step: '02',
                title: 'Structure',
                desc: 'Transforms ambiguous distress into clinical, transit, or municipal data models.',
              },
              {
                step: '03',
                title: 'Examine',
                desc: 'Audits evidence completeness. Never invents facts or presents speculation as proof.',
              },
              {
                step: '04',
                title: 'Act',
                desc: 'Ranks feasible interventions, identifies trade-offs, and recommends the superior next step.',
              },
              {
                step: '05',
                title: 'Follow Through',
                desc: 'Coordinates with certified public authorities and tracks status to verified closure.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle-card space-y-2 hover:shadow-float-card transition-shadow"
              >
                <div className="text-xs font-mono font-bold text-cobalt">{item.step}</div>
                <h4 className="text-base font-display font-bold text-midnight">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MULTI-DOMAIN SOCIETAL BENEFIT SHOWCASE */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-aqua bg-midnight-950 px-3 py-1 rounded-full text-aqua">
                Broad Real-World Applications
              </span>
              <h2 className="text-3xl font-display font-bold text-midnight tracking-tight">
                Designed for Societal Impact Across Every Domain
              </h2>
              <p className="text-sm text-slate-600">
                SutrAI solves real problems across urban infrastructure, public health, disaster resilience, and accessibility.
              </p>
            </div>

            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cobalt hover:text-cobalt-hover"
            >
              <span>Test with your own scenario</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domainShowcases.map((domain, idx) => {
              const Icon = domain.icon;
              return (
                <div
                  key={idx}
                  className="bg-cloud rounded-2xl border border-slate-200 p-6 space-y-4 hover:border-slate-300 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`p-2.5 rounded-xl border ${domain.accent}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-500">
                      {domain.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-midnight tracking-tight">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {domain.summary}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/80 italic font-mono text-[11px]">
                      {domain.exampleSignal}
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200/70 font-medium flex items-start gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px]">
                        <strong>Action:</strong> {domain.routedAction}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. RESPONSIBLE AI & HONESTY SECTION */}
      <section className="py-20 bg-midnight-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-aqua bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Responsible AI Architecture
            </span>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">
              Evidence-Aware, Safe, and Transparent
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              In societal emergencies, artificial intelligence hallucinations can cost lives. SutrAI operates under strict truthfulness and safety invariants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cobalt/20 border border-cobalt/40 flex items-center justify-center text-cobalt">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Explicit Uncertainty Disclosure</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When information is incomplete (e.g. unknown drug allergies or unverified road depth), SutrAI states the uncertainty and requests the exact single missing detail rather than assuming.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-coral/20 border border-coral/40 flex items-center justify-center text-coral">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">No Fabricated Dispatch Claims</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We never tell a citizen that an ambulance or fire tender is coming unless certified telemetry validates it. In simulated demo mode, all dispatches are visibly and honestly labelled as simulations.
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-aqua/20 border border-aqua/40 flex items-center justify-center text-aqua">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Separation of Evidence & Claims</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Information extracted by AI is clearly distinguished from citizen observations and independent government verification. AI confidence is never disguised as scientific proof.
              </p>
            </div>
          </div>

          {/* Immediate CTA Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1">
              <h3 className="text-2xl font-display font-bold text-white">
                Ready to experience SutrAI?
              </h3>
              <p className="text-sm text-slate-300">
                Launch the Multimodal Workspace or inspect the live Operations Dashboard.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/workspace"
                className="px-6 py-3 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white font-bold text-sm shadow-glow-cobalt transition-all"
              >
                Open Multimodal Workspace
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors"
              >
                Control Console
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
