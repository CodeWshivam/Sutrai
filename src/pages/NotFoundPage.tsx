import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] bg-cloud flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-subtle-card text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-cobalt/10 border border-cobalt/20 flex items-center justify-center text-cobalt mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700">
            Error 404: Unknown Route
          </span>
          <h1 className="text-2xl font-display font-bold text-midnight tracking-tight mt-2">
            No Signal Found Here
          </h1>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            The pathway you requested does not correspond to an active SutrAI workspace or incident record.
          </p>
        </div>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            to="/workspace"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold shadow-glow-cobalt transition-colors"
          >
            <Sparkles className="w-4 h-4 text-aqua" />
            <span>Open Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
