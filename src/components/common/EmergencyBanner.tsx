import React, { useState } from 'react';
import { 
  AlertTriangle, 
  PhoneCall, 
  MapPin, 
  ShieldAlert, 
  HeartHandshake, 
  CheckCircle2, 
  X, 
  Activity, 
  Radio,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { LocationData, EmergencyContact } from '../../types';

interface EmergencyBannerProps {
  location?: LocationData;
  onDismiss?: () => void;
  scenarioName?: string;
  isSimulated?: boolean;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  location,
  onDismiss,
  scenarioName = 'Acute Life-Safety Emergency Scenario',
  isSimulated = true,
}) => {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showLiveTelConfirm, setShowLiveTelConfirm] = useState(false);
  const [selectedTelTarget, setSelectedTelTarget] = useState<string>('112');
  const [activeCallTarget, setActiveCallTarget] = useState<EmergencyContact | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');

  // Verified & suggested contacts
  const emergencyContacts: EmergencyContact[] = [
    {
      id: 'em-112',
      name: 'National Unified Emergency Helpline',
      serviceType: 'helpline',
      phoneNumber: '112',
      isVerifiedContact: true,
      jurisdiction: 'All-India National Dispatch (MHA)',
      notes: 'Unified statutory dispatch for Police, Fire, and Ambulance services.',
    },
    {
      id: 'em-108',
      name: 'GVK-EMRI Medical Emergency & Ambulance',
      serviceType: 'ambulance',
      phoneNumber: '108',
      isVerifiedContact: true,
      jurisdiction: 'National Health Mission Emergency Services',
      notes: 'Trained EMT responders with Basic & Advanced Life Support units.',
    },
    {
      id: 'em-101',
      name: 'Fire & Rescue HAZMAT Command',
      serviceType: 'fire',
      phoneNumber: '101',
      isVerifiedContact: true,
      jurisdiction: 'State Fire & Disaster Management Division',
      notes: 'Chemical, building collapse, and water rescue squads.',
    },
    {
      id: 'em-1070',
      name: 'State Disaster Management Authority (SDMA)',
      serviceType: 'disaster',
      phoneNumber: '1070',
      isVerifiedContact: true,
      jurisdiction: 'NDMA / SDMA State Emergency Operations Center',
      notes: 'Regional flood, landslide, and cyclonic alert desk.',
    },
  ];

  const handleStartSimulatedCall = (contact: EmergencyContact) => {
    setActiveCallTarget(contact);
    setCallStatus('ringing');
    setShowCallModal(true);

    // Simulate ring and connect sequence
    setTimeout(() => {
      setCallStatus('connected');
    }, 1800);
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      setShowCallModal(false);
      setCallStatus('idle');
      setActiveCallTarget(null);
    }, 800);
  };

  const triggerLiveTelConfirmation = (num: string) => {
    setSelectedTelTarget(num);
    setShowLiveTelConfirm(true);
  };

  return (
    <>
      <div className="relative bg-gradient-to-r from-red-950 via-rose-950 to-midnight text-white rounded-2xl shadow-2xl p-5 sm:p-6 mb-6 border-2 border-rose-500/50 animate-slide-up">
        {/* Urgent header with prominent real call notice */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-600/30 border border-rose-400/50 flex items-center justify-center flex-shrink-0 animate-pulse mt-0.5">
              <ShieldAlert className="w-6 h-6 text-rose-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500 text-white rounded-full shadow-sm">
                  URGENT LIFE-SAFETY ADVISORY
                </span>
                {isSimulated && (
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 rounded-full shadow-sm">
                    DEMO SIMULATION
                  </span>
                )}
                <span className="text-[11px] font-bold text-rose-200">
                  Call 112/108 directly in a real emergency
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight mt-1 text-white">
                {scenarioName}
              </h2>
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Dismiss emergency banner"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Immediate First-Action Guidance (General non-medical guidance) */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-midnight-950/95 text-white p-4 rounded-xl border border-rose-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Immediate Safety Protocols:</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-slate-400" />
                <span>General Guidance (Not Medical Advice)</span>
              </span>
            </div>

            <ul className="text-xs space-y-1.5 text-slate-200">
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">1.</span>
                <span><strong>Check responsiveness & breathing:</strong> If unbreathing, begin chest compressions immediately (100–120 bpm at center of chest).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">2.</span>
                <span><strong>Position safely:</strong> If conscious with chest pressure, keep seated upright at 45°. Do NOT lie completely flat.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400">3.</span>
                <span><strong>Environmental hazards:</strong> Stay clear of active flood water, downed electrical cables (minimum 10m radius), and smoke plumes.</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Guidance Source: International Red Cross (IFRC) First Aid Manual & NDMA Disaster SOPs.</span>
            </div>
          </div>

          {/* Location Panel */}
          <div className="bg-midnight-950/95 text-white p-4 rounded-xl border border-rose-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-aqua font-bold mb-1">
                <MapPin className="w-4 h-4" />
                <span>Reported Scene Location:</span>
              </div>
              <p className="text-xs text-slate-200 font-medium line-clamp-3">
                {location && !location.isUnknown
                  ? location.address
                  : '⚠️ Exact coordinates unverified. Provide nearest street landmark for responders.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Status: {location && !location.isUnknown ? 'Location Verified' : 'Location Unknown'}</span>
              <button
                type="button"
                onClick={() => triggerLiveTelConfirmation('112')}
                className="text-rose-300 hover:text-white font-bold underline flex items-center gap-1"
              >
                <span>Live Dial 112</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Local Emergency Helplines Call Matrix */}
        <div className="mt-5">
          <div className="text-xs font-bold text-rose-200 uppercase tracking-wider mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              <span>Simulate Dispatcher Telemetry Response (Demo Simulation Only)</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Click any service below to test interactive dispatcher flow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {emergencyContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => handleStartSimulatedCall(contact)}
                className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/90 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-left text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-white group-hover:text-aqua transition-colors truncate">
                      {contact.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-rose-400 text-xs">Dial {contact.phoneNumber}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-rose-500/20 group-hover:bg-rose-500 text-rose-300 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="mt-4 pt-3 border-t border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-rose-200 gap-2">
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>
              <strong>Mandatory Safety Requirement:</strong> In an actual medical, fire, or police emergency, always dial <strong>112</strong> or <strong>108</strong> directly from your phone. SutrAI is an AI decision support interface and not an emergency service provider.
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Before Placing Real Telephone Call */}
      {showLiveTelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-midnight-900 border border-rose-600/40 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Initiate Live Telephone Call?</h3>
                <p className="text-xs text-rose-300 font-mono">Destination: Emergency Helpline {selectedTelTarget}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will launch your device’s native telephone dialer to call <strong>{selectedTelTarget}</strong>. Only proceed if you are experiencing a genuine real-world emergency requiring official first responders.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLiveTelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <a
                href={`tel:${selectedTelTarget}`}
                onClick={() => setShowLiveTelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white text-center shadow-md transition-colors"
              >
                Open Phone Dialer ({selectedTelTarget})
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Call Modal */}
      {showCallModal && activeCallTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-midnight-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl relative">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 mx-auto flex items-center justify-center animate-pulse">
                <PhoneCall className="w-8 h-8 text-rose-400" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-400 text-slate-950 rounded-full">
                  SIMULATED DISPATCH CALL (DEMO ONLY)
                </span>
                <h3 className="text-xl font-display font-bold mt-2">
                  {activeCallTarget.name}
                </h3>
                <p className="text-sm text-slate-400 font-mono mt-0.5">
                  Dialing {activeCallTarget.phoneNumber} • {activeCallTarget.jurisdiction}
                </p>
              </div>

              {/* Call Status Badge */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${callStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
                  <span className="font-mono uppercase font-bold text-slate-200">
                    {callStatus === 'ringing' && 'Connecting to Simulated Dispatcher...'}
                    {callStatus === 'connected' && 'Simulated Call Connected (00:08)'}
                    {callStatus === 'ended' && 'Call Terminated'}
                  </span>
                </div>

                {callStatus === 'connected' && (
                  <div className="text-left text-slate-300 border-t border-slate-800 pt-2 space-y-1">
                    <p className="italic text-aqua font-sans">
                      “108 Emergency Medical Command. We have received your telemetry signal. An ALS Ambulance unit is currently stationed 1.8km away. Please confirm patient consciousness and door number.”
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono pt-1">
                      * Demo audio mock: No live telecommunications network was contacted.
                    </p>
                  </div>
                )}
              </div>

              {/* End Call Button */}
              <button
                type="button"
                onClick={handleEndCall}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 rotate-[135deg]" />
                <span>Disconnect Call</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
