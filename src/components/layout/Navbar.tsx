import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Sparkles, 
  LayoutDashboard, 
  SlidersHorizontal, 
  Menu, 
  X, 
  AlertTriangle,
  ArrowRight,
  Sun,
  Moon,
  Home
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onTriggerEmergency?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onTriggerEmergency }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navLinks = [
    { label: 'Overview', path: '/', icon: Home },
    { label: 'Workspace', path: '/workspace', icon: Sparkles },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Settings', path: '/settings', icon: SlidersHorizontal },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-midnight-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Brand Mark */}
            <Link to="/" className="flex items-center group focus:outline-none focus:ring-2 focus:ring-aqua/40 rounded-lg p-1">
              <BrandLogo size="md" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3 py-1.5 lg:px-3.5 lg:py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'text-white bg-slate-800/80 shadow-sm border border-slate-700/50'
                        : 'text-slate-300 hover:text-white hover:bg-slate-850/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-aqua' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions & Emergency Button */}
            <div className="hidden md:flex items-center gap-2.5 lg:gap-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-700/60"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme mode"
              >
                {isDark ? <Sun className="w-4 h-4 text-aqua" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>

              {/* Quick Emergency Simulator Button */}
              <button
                onClick={onTriggerEmergency}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                title="Test simulated emergency guidance mode"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Simulate Emergency</span>
              </button>

              {/* Single Primary Action in Navbar (Non-competing with hero) */}
              <Link
                to="/workspace"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 lg:px-4 lg:py-2 text-xs lg:text-sm font-semibold text-white bg-cobalt hover:bg-cobalt-hover shadow-glow-cobalt rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cobalt/50"
              >
                <Sparkles className="w-3.5 h-3.5 text-aqua" />
                <span>Open Studio</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-300 bg-slate-800/80 border border-slate-700 rounded-lg"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-aqua" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>
              <button
                onClick={onTriggerEmergency}
                className="p-2 text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg"
                aria-label="Simulate emergency"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-aqua rounded-lg"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-midnight-950 border-b border-slate-800 px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'text-white bg-slate-800/90 border border-slate-700/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-aqua' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <Link
                to="/workspace"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-cobalt rounded-lg shadow-glow-cobalt"
              >
                <Sparkles className="w-4 h-4 text-aqua" />
                <span>Open Multimodal Studio</span>
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onTriggerEmergency?.();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Simulate Emergency Scenario</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile persistent bottom quick-dock for 320px/375px screens */}
      <nav aria-label="Mobile quick navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-midnight-950/95 border-t border-slate-800 backdrop-blur-md flex items-center justify-around py-2 px-1">
        {navLinks.map((link) => {
          const active = isActive(link.path);
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-mono font-medium transition-colors ${
                active ? 'text-aqua font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
