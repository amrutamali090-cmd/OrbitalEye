import React from 'react';
import { StructuredAnalysisResult, SettlementNode } from '../../types/orbitaleye';
import { MapViewer } from '../MapViewer';
import { ShieldAlert, AlertTriangle, CheckCircle, Navigation, Hospital, Building, Activity, ArrowRight, Eye } from 'lucide-react';
import { NavTab } from '../TopNav';

interface OverviewViewProps {
  data: StructuredAnalysisResult;
  onNavigateTab: (tab: NavTab) => void;
  onSelectSettlement: (settlement: SettlementNode | null) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  onNavigateTab,
  onSelectSettlement,
}) => {
  const f = data.flood;
  const cutOffSettlements = data.settlements.filter((s) => s.connectivityStatus === 'POTENTIALLY CUT OFF');
  const affectedRoads = data.infrastructure.roads.filter((r) => r.impactStatus === 'Potentially affected' || r.impactStatus === 'Affected');
  const affectedBridges = data.infrastructure.bridges.filter((b) => b.impactStatus === 'Potentially affected' || b.impactStatus === 'Affected');
  const affectedBuildings = data.infrastructure.buildings.filter((b) => b.impactStatus === 'Potentially affected' || b.impactStatus === 'Affected');

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#07090e]">
      {/* Left Operations Summary & Core Challenge Answers Column (480px fixed width on xl) */}
      <div className="w-full xl:w-[460px] xl:shrink-0 flex flex-col border-r border-slate-800 bg-[#090c14] overflow-y-auto">
        {/* Banner */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
            <span>SATELLITE EMERGENCY BRIEFING</span>
            <span>·</span>
            <span>OPERATIONAL DASHBOARD</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            {data.event.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            {data.event.description}
          </p>
          <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400">
            <span>EVENT: {data.event.eventDate}</span>
            <span>·</span>
            <span>BASELINE: {data.event.baselineDate}</span>
          </div>
        </div>

        {/* 3 Core Questions Accordion Cards */}
        <div className="p-5 space-y-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Core Operational Intelligence Inquiries
          </div>

          {/* 1. WHERE DID THE FLOOD HIT? */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-900/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                1. WHERE DID THE FLOOD HIT?
              </span>
              <button
                onClick={() => onNavigateTab('floodmap')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Inspect Map</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Flood Extent</div>
                <div className="text-lg font-bold text-cyan-300 tabular-nums">
                  {f.totalFloodAreaKm2.toFixed(2)} <span className="text-xs font-normal text-slate-400">km²</span>
                </div>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Debris / Silt</div>
                <div className="text-lg font-bold text-orange-400 tabular-nums">
                  {f.debrisAreaKm2.toFixed(2)} <span className="text-xs font-normal text-slate-400">km²</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Main inundation concentrated along the {data.event.region} river corridor, with {f.percentAreaAffected.toFixed(1)}% of monitored valley surface submerged or silt-covered.
            </p>
          </div>

          {/* 2. WHAT WAS DAMAGED? */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-950/60 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                2. WHAT WAS DAMAGED?
              </span>
              <button
                onClick={() => onNavigateTab('damage')}
                className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <span>Damage Table</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Roads</div>
                <div className="text-base font-bold text-rose-400 tabular-nums">
                  {affectedRoads.length} <span className="text-[9px] font-normal text-slate-500">seg</span>
                </div>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Bridges</div>
                <div className="text-base font-bold text-amber-400 tabular-nums">
                  {affectedBridges.length} <span className="text-[9px] font-normal text-slate-500">span</span>
                </div>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Buildings</div>
                <div className="text-base font-bold text-slate-200 tabular-nums">
                  {affectedBuildings.length} <span className="text-[9px] font-normal text-slate-500">struct</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              Pre-event OSM intersection flags {affectedRoads.length} submerged road sections and {affectedBridges.length} bridge structures in flood proximity. 
              <span className="text-slate-400 block mt-0.5 italic">Requires field verification; structural collapse is not assumed.</span>
            </p>
          </div>

          {/* 3. WHO IS CUT OFF? */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-900/80 shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-rose-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                3. WHO IS CUT OFF?
              </span>
              <button
                onClick={() => onNavigateTab('cutoff')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Cut-Off Engine</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/60 font-mono text-xs text-rose-200 flex items-center justify-between">
              <span>POTENTIALLY CUT OFF:</span>
              <span className="font-bold text-sm text-rose-300 tabular-nums">{cutOffSettlements.length} SETTLEMENTS</span>
            </div>
            <div className="space-y-1.5 pt-1">
              {cutOffSettlements.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectSettlement(s);
                    onNavigateTab('cutoff');
                  }}
                  className="p-2 rounded bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-white">{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Hospital: {s.nearestHospital} ({s.distanceToHospitalKm} km)
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                    SEVERED
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Action Priorities */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Operational Priority Queue
            </div>
            <div className="space-y-2">
              {cutOffSettlements.map((s) => (
                <div key={s.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-300 font-mono">{s.verificationPriority}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{s.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{s.cutOffReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Map Canvas Stage */}
      <div className="flex-1 h-full min-h-[500px] relative">
        <MapViewer
          data={data}
          onSelectSettlement={onSelectSettlement}
          activeMode="all"
        />
      </div>
    </div>
  );
};
