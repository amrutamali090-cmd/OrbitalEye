import React, { useState } from 'react';
import { StructuredAnalysisResult, ImpactStatus } from '../../types/orbitaleye';
import { MapViewer } from '../MapViewer';
import { ShieldAlert, AlertTriangle, CheckCircle, HelpCircle, Filter } from 'lucide-react';

interface DamageAssessmentViewProps {
  data: StructuredAnalysisResult;
}

export const DamageAssessmentView: React.FC<DamageAssessmentViewProps> = ({ data }) => {
  const [filterType, setFilterType] = useState<'all' | 'roads' | 'bridges' | 'buildings'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { roads, bridges, buildings } = data.infrastructure;

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#07090e]">
      {/* Left Damage Table & Evidence Panel (520px on xl) */}
      <div className="w-full xl:w-[520px] xl:shrink-0 flex flex-col border-r border-slate-800 bg-[#090c14] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
            <span>PRE-EVENT INFRASTRUCTURE AUDIT</span>
            <span>·</span>
            <span>OSM SNAPSHOT</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white mt-1">
            Infrastructure Damage & Exposure Assessment
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Geospatial intersection of detected flood/debris polygons against pre-event OpenStreetMap topologies.
          </p>

          {/* Scientific Disclaimer Note */}
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="font-semibold text-amber-400 block font-mono text-[10px] uppercase">
              Methodological Notice:
            </span>
            Satellite pixel intersection indicates inundation exposure, NOT structural collapse. All flagged assets require field verification.
          </div>

          {/* Category Filter Controls */}
          <div className="flex items-center gap-1.5 mt-4 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            {(['all', 'roads', 'bridges', 'buildings'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 py-1 px-2 text-center rounded font-medium capitalize transition-colors ${
                  filterType === type
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Content Lists */}
        <div className="p-5 space-y-4">
          {/* ROADS SECTION */}
          {(filterType === 'all' || filterType === 'roads') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                <span>Road Segments ({roads.length})</span>
                <span className="text-[10px] text-rose-400">
                  {roads.filter((r) => r.impactStatus === 'Potentially affected').length} Potentially Affected
                </span>
              </div>

              <div className="space-y-2">
                {roads.map((road) => {
                  const isAffected = road.impactStatus === 'Potentially affected' || road.impactStatus === 'Affected';
                  return (
                    <div
                      key={road.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        isAffected
                          ? 'bg-rose-950/20 border-rose-900/60'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white">{road.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            OSM: {road.osmWayId} · Class: {road.highwayClass}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            isAffected
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {road.impactStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div className="text-slate-400">
                          Total Length: <span className="text-slate-200">{road.lengthKm} km</span>
                        </div>
                        <div className={isAffected ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                          Submerged: <span className="tabular-nums">{road.affectedLengthKm} km</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 pt-0.5">
                        <strong className="text-slate-400">Impact:</strong> {road.connectivityImpact}
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                        <strong>Evidence:</strong> {road.evidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BRIDGES SECTION */}
          {(filterType === 'all' || filterType === 'bridges') && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                <span>Bridges & Crossings ({bridges.length})</span>
                <span className="text-[10px] text-amber-400">
                  {bridges.filter((b) => b.impactStatus === 'Potentially affected').length} In Flood Proximity
                </span>
              </div>

              <div className="space-y-2">
                {bridges.map((bridge) => {
                  const isAffected = bridge.impactStatus === 'Potentially affected' || bridge.impactStatus === 'Affected';
                  return (
                    <div
                      key={bridge.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        isAffected
                          ? 'bg-amber-950/20 border-amber-900/60'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span className="text-cyan-400">☲</span>
                            {bridge.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            River: {bridge.riverName} · Road: {bridge.roadConnected}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            isAffected
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {bridge.impactStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div className="text-slate-400">
                          Flood Proximity: <span className="text-slate-200">{bridge.floodProximityM} m</span>
                        </div>
                        <div className="text-slate-400">
                          Relevance: <span className="text-cyan-400 font-semibold">{bridge.connectivityRelevance}</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                        <strong>Evidence:</strong> {bridge.evidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BUILDINGS SECTION */}
          {(filterType === 'all' || filterType === 'buildings') && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
                <span>Monitored Structures ({buildings.length})</span>
                <span className="text-[10px] text-rose-400">
                  {buildings.filter((b) => b.impactStatus === 'Potentially affected').length} Overlap Water Mask
                </span>
              </div>

              <div className="space-y-2">
                {buildings.map((bldg) => {
                  const isAffected = bldg.impactStatus === 'Potentially affected' || bldg.impactStatus === 'Affected';
                  return (
                    <div
                      key={bldg.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        isAffected
                          ? 'bg-rose-950/20 border-rose-900/60'
                          : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white">{bldg.name || bldg.id}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            OSM: {bldg.osmId} · Type: {bldg.buildingType} · Elev: {bldg.elevationMeters}m
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            isAffected
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {bldg.impactStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                        <div className="text-slate-400">
                          Flood Overlap: <span className="text-slate-200">{bldg.floodOverlapPct.toFixed(1)}%</span>
                        </div>
                        <div className="text-slate-400">
                          Dist to Boundary: <span className="text-slate-200">{bldg.distanceToFloodMeters} m</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 pt-0.5">
                        <strong>Evidence:</strong> {bldg.evidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Map Canvas Stage */}
      <div className="flex-1 h-full min-h-[500px] relative">
        <MapViewer data={data} activeMode="damage" />
      </div>
    </div>
  );
};
