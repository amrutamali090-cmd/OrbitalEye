import React from 'react';
import { SatelliteSource } from '../types/orbitaleye';
import { Activity, ShieldCheck, Play, Globe } from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'floodmap'
  | 'damage'
  | 'cutoff'
  | 'floodpath'
  | 'futureprediction'
  | 'copilot'
  | 'report'
  | 'casestudy'
  | 'methodology'
  | 'limitations';

interface TopNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenAnalyzeModal: () => void;
  sourceMode: 'LIVE_DATA' | 'DEMO_DATA';
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onTabChange,
  selectedEventId,
  onSelectEvent,
  onOpenAnalyzeModal,
  sourceMode,
}) => {
  const navItems: { id: NavTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'floodmap', label: 'Flood Map' },
    { id: 'damage', label: 'Damage' },
    { id: 'cutoff', label: 'Cut-Off Settlements' },
    { id: 'floodpath', label: 'Flood Path' },
    { id: 'futureprediction', label: 'Future Prediction' },
    { id: 'copilot', label: 'AI Copilot' },
    { id: 'report', label: 'Situation Report' },
    { id: 'casestudy', label: 'Case Study (Trishuli)' },
    { id: 'methodology', label: 'Data & Methodology' },
    { id: 'limitations', label: 'Limitations' },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-[#07090e]/95 backdrop-blur-md px-5 flex items-center justify-between shrink-0 select-none z-40">
      {/* Zone 1: Prominent Project Name & Hierarchical Descriptor */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-900 border border-cyan-500/70 flex items-center justify-center text-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.4)] shrink-0 relative overflow-hidden">
            {/* Minimalist Satellite Orbit + Earth Observation Eye */}
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-cyan-300" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.25" />
              <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-28 12 12)" stroke="currentColor" strokeDasharray="1.5 2.5" strokeWidth="1.4" strokeOpacity="0.85" />
              <circle cx="5" cy="8.2" r="1.2" fill="#38bdf8" />
            </svg>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[22px] font-black tracking-normal text-white leading-none font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              OrbitalEye
            </span>
            <span className="text-[10.5px] font-medium tracking-wide text-cyan-400 leading-tight mt-1">
              Satellite Intelligence for Flood Response
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                isActive
                  ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Source Mode indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-800 bg-slate-900/80">
          <span className={`w-1.5 h-1.5 rounded-full ${sourceMode === 'LIVE_DATA' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
          <span className={sourceMode === 'LIVE_DATA' ? 'text-emerald-300' : 'text-amber-300'}>
            {sourceMode === 'LIVE_DATA' ? 'LIVE SATELLITE' : 'DEMO SCENARIO'}
          </span>
        </div>

        {/* AOI Selector with 4 selectable scenarios */}
        <select
          value={selectedEventId}
          onChange={(e) => onSelectEvent(e.target.value)}
          aria-label="Area of interest scenario selector"
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 max-w-[230px] truncate"
        >
          <option value="trishuli-2026-08">Nepal: Trishuli — Aug 2026</option>
          <option value="assam-brahmaputra-2026">India: Assam — Monsoon Flood</option>
          <option value="uttarakhand-himalayan-2026">India: Uttarakhand — Himalayan Flash Flood</option>
          <option value="bangladesh-jamuna-2026">Bangladesh: River Flood — Monsoon</option>
        </select>

        {/* Run Analysis Trigger Button */}
        <button
          onClick={onOpenAnalyzeModal}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] whitespace-nowrap"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Analyze Event</span>
        </button>
      </div>
    </header>
  );
};
