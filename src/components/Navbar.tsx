import React from 'react';
import { Volume2, VolumeX, Download, Radio, ShieldCheck } from 'lucide-react';
import { soundController } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onExportCsv: () => void;
  onlineTerminalsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted,
  onExportCsv,
  onlineTerminalsCount,
}) => {
  const toggleMute = () => {
    const next = !isMuted;
    soundController.setMuted(next);
    setIsMuted(next);
  };

  const navItems = [
    { id: 'terminal', label: 'ID Tap Terminal' },
    { id: 'live-feed', label: 'Live Stream' },
    { id: 'students', label: 'Student Badges' },
    { id: 'lectures', label: 'Class Sessions' },
    { id: 'alerts', label: 'Parent Alerts' },
    { id: 'analytics', label: 'Reports & Export' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('terminal')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
                CT
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                CampusTap
              </span>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 pl-3 border-l border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-mono tabular-nums">{onlineTerminalsCount} Terminals Active</span>
            </div>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none ${
                    isActive ? 'text-slate-950 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-slate-900" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Turn on terminal sound chimes' : 'Mute terminal sound chimes'}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              onClick={onExportCsv}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setActiveTab('terminal')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tap Simulator</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Nav */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-2 border-t border-slate-100 text-xs scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium transition-colors ${
                activeTab === item.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
