import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center rounded-xl bg-midnight-950 border border-slate-700/60 shadow-md group overflow-hidden`}>
        {/* Glowing thread pattern representing "Sutra" */}
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full p-1.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle grid background */}
          <circle cx="20" cy="20" r="14" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />
          {/* Connecting threads */}
          <path
            d="M6 20C12 20 14 11 20 11C26 11 28 20 34 20"
            stroke="#43E6D3"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M6 28C12 28 15 20 20 20C25 20 28 28 34 28"
            stroke="#5B5CFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />
          {/* Central convergence node */}
          <circle cx="20" cy="20" r="4.5" fill="#43E6D3" className="animate-pulse-slow" />
          <circle cx="20" cy="20" r="2" fill="#0B1020" />
          <circle cx="34" cy="20" r="2" fill="#5B5CFF" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-extrabold tracking-tight ${titleSizes[size]} text-white`}>
            Sutr<span className="text-aqua">AI</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold bg-cobalt/20 text-cobalt border border-cobalt/30 rounded-full">
            v1.0
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-slate-400 font-medium">
            Every signal has a next step.
          </span>
        )}
      </div>
    </div>
  );
};
