import React, { useState } from 'react';
import { StructuredAnalysisResult, SettlementNode } from '../../types/orbitaleye';
import { MapViewer } from '../MapViewer';
import { Hospital, Navigation, AlertTriangle, CheckCircle, ShieldAlert, Activity, ArrowRight, UserCheck } from 'lucide-react';

interface CutOffSettlementsViewProps {
  data: StructuredAnalysisResult;
  selectedSettlement: SettlementNode | null;
  onSelectSettlement: (settlement: SettlementNode | null) => void;
}

export const CutOffSettlementsView: React.FC<CutOffSettlementsViewProps> = ({
  data,
  selectedSettlement,
  onSelectSettlement,
}) => {
  const [filter, setFilter] = useState<'all' | 'cutoff' | 'connected'>('all');

  const settlements = data.settlements;
  const cutOffCount = settlements.filter((s) => s.connectivityStatus === 'POTENTIALLY CUT OFF').length;
  const connectedCount = settlements.filter((s) => s.connectivityStatus === 'CONNECTED').length;

  const filteredSettlements = settlements.filter((s) => {
    if (filter === 'cutoff') return s.connectivityStatus === 'POTENTIALLY CUT OFF';
    if (filter === 'connected') return s.connectivityStatus === 'CONNECTED';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#07090e]">
      {/* Left Settlements & Network Reachability Engine Panel (520px on xl) */}
      <div className="w-full xl:w-[520px] xl:shrink-0 flex flex-col border-r border-slate-800 bg-[#090c14] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-rose-400">
            <span>GRAPH CONNECTIVITY ENGINE</span>
            <span>·</span>
            <span>ISOLATION RISK MODEL</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white mt-1">
            Cut-Off Settlement Network Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Evaluates dual graph reachability: Pre-event OSM roads versus Post-Flood disrupted road network, determining physical motorized access to nearest town and hospital.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/60 flex items-center justify-between">
              <span className="text-rose-400">Potentially Cut Off:</span>
              <span className="text-base font-bold text-rose-300 tabular-nums">{cutOffCount}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 flex items-center justify-between">
              <span className="text-emerald-400">Connected:</span>
              <span className="text-base font-bold text-emerald-300 tabular-nums">{connectedCount}</span>
            </div>
          </div>

          {/* Filter segment tabs */}
          <div className="flex items-center gap-1.5 mt-3 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-1 px-2 text-center rounded font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Evaluated ({settlements.length})
            </button>
            <button
              onClick={() => setFilter('cutoff')}
              className={`flex-1 py-1 px-2 text-center rounded font-medium transition-colors ${
                filter === 'cutoff'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Potentially Cut Off ({cutOffCount})
            </button>
            <button
              onClick={() => setFilter('connected')}
              className={`flex-1 py-1 px-2 text-center rounded font-medium transition-colors ${
                filter === 'connected'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Connected ({connectedCount})
            </button>
          </div>
        </div>

        {/* Settlement List */}
        <div className="p-5 space-y-3">
          {filteredSettlements.map((s) => {
            const isCutOff = s.connectivityStatus === 'POTENTIALLY CUT OFF';
            const isSelected = selectedSettlement?.id === s.id;

            return (
              <div
                key={s.id}
                onClick={() => onSelectSettlement(s)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500'
                    : isCutOff
                    ? 'border-rose-900/60 bg-rose-950/20 hover:border-rose-700'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                {/* Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{s.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({s.type})</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Elevation: {s.elevationMeters}m · Population:{' '}
                      <span className="text-slate-200">
                        {s.population !== null ? s.population.toLocaleString() : 'Population data unavailable'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      isCutOff
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {s.connectivityStatus}
                  </span>
                </div>

                {/* Distance to Key Services */}
                <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Hospital className="w-3 h-3 text-cyan-400" />
                      Nearest Hospital
                    </div>
                    <div className="text-slate-200 font-semibold truncate mt-0.5">
                      {s.nearestHospital}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Distance: <span className="text-cyan-300">{s.distanceToHospitalKm} km</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-cyan-400" />
                      Nearest Town
                    </div>
                    <div className="text-slate-200 font-semibold truncate mt-0.5">
                      {s.nearestTown}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Distance: <span className="text-cyan-300">{s.distanceToTownKm} km</span>
                    </div>
                  </div>
                </div>

                {/* Road Severance Reason */}
                <div className="mt-2.5 p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-xs">
                  <div className="font-semibold text-slate-300 font-mono text-[10px] uppercase flex items-center justify-between">
                    <span className="text-cyan-400">Disruption Mechanism:</span>
                    <span className="text-slate-400 font-normal">
                      Alternative: {s.alternateRoute}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                    {s.cutOffReason}
                  </p>
                </div>

                {/* Evidence Findings list */}
                <div className="mt-2 text-[10px] text-slate-400 space-y-0.5">
                  <div className="font-semibold text-slate-300">Supporting Evidence:</div>
                  {s.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-start gap-1">
                      <span className="text-cyan-400">·</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Map Canvas Stage */}
      <div className="flex-1 h-full min-h-[500px] relative">
        <MapViewer
          data={data}
          selectedSettlementId={selectedSettlement?.id}
          onSelectSettlement={onSelectSettlement}
          activeMode="cutoff"
        />
      </div>
    </div>
  );
};
