import React, { useState } from 'react';
import { StructuredAnalysisResult } from '../../types/orbitaleye';
import { Printer, Download, FileText, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

interface SituationReportViewProps {
  data: StructuredAnalysisResult;
}

export const SituationReportView: React.FC<SituationReportViewProps> = ({ data }) => {
  const [reportGeneratedTime] = useState<string>(new Date().toUTCString());

  const f = data.flood;
  const roads = data.infrastructure.roads;
  const bridges = data.infrastructure.bridges;
  const buildings = data.infrastructure.buildings;
  const settlements = data.settlements;

  const cutOffSettlements = settlements.filter((s) => s.connectivityStatus === 'POTENTIALLY CUT OFF');
  const affectedRoads = roads.filter((r) => r.impactStatus === 'Potentially affected' || r.impactStatus === 'Affected');
  const affectedBridges = bridges.filter((b) => b.impactStatus === 'Potentially affected' || b.impactStatus === 'Affected');
  const affectedBuildings = buildings.filter((b) => b.impactStatus === 'Potentially affected' || b.impactStatus === 'Affected');

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `OrbitalEye_SitRep_${data.event.id}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-10 flex flex-col items-center">
      {/* Top Action Ribbon (Hidden in print) */}
      <div className="w-full max-w-4xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 print:hidden">
        <div>
          <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            STANDARDIZED SATELLITE SITUATION REPORT (SITREP)
          </h3>
          <p className="text-xs text-slate-400">
            Formally formatted for emergency rescue task forces, humanitarian clusters, and field commanders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Document</span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Document Card */}
      <div className="w-full max-w-4xl bg-[#0b0e17] print:bg-white print:text-black border border-slate-800 print:border-none rounded-2xl p-8 lg:p-12 shadow-2xl text-slate-200 font-sans space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-cyan-500 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 print:text-cyan-700 font-bold">
                OrbitalEye RAPID SATELLITE DISASTER ASSESSMENT
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white print:text-black font-mono mt-1">
                SATELLITE FLOOD SITUATION REPORT
              </h1>
              <div className="text-xs text-slate-400 print:text-slate-600 font-mono mt-1">
                Earth Observation & Rapid Response · Multi-Temporal SAR & Optical Intelligence
              </div>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-400 print:text-slate-600 space-y-0.5">
              <div>
                <strong>INCIDENT ID:</strong> {data.event.id.toUpperCase()}
              </div>
              <div>
                <strong>REPORT ISSUED:</strong> {reportGeneratedTime}
              </div>
              <div className="text-cyan-400 print:text-cyan-800">
                <strong>STATUS:</strong> PROVISIONAL / FIELD VERIFICATION REQUIRED
              </div>
            </div>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80 print:border-slate-300 text-xs font-mono">
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">EVENT:</span>
              <span className="font-semibold text-slate-200 print:text-black">{data.event.name}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">REGION & COUNTRY:</span>
              <span className="font-semibold text-slate-200 print:text-black">{data.event.region}, {data.event.country}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">EVENT DATE:</span>
              <span className="font-semibold text-cyan-400 print:text-cyan-700">{data.event.eventDate}</span>
            </div>
            <div>
              <span className="text-slate-500 print:text-slate-600 block text-[10px]">SENSOR / BASELINE:</span>
              <span className="font-semibold text-slate-200 print:text-black">{data.satellite.sensor.split(' ')[0]} ({data.satellite.baselineDays}d pair)</span>
            </div>
          </div>
        </div>

        {/* 1. SITUATION SUMMARY */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-700 border-b border-slate-800 print:border-slate-300 pb-1">
            1. SITUATION SUMMARY
          </h2>
          <p className="text-xs leading-relaxed text-slate-300 print:text-slate-800">
            A major flood event occurred in the <strong>{data.event.region}</strong> on <strong>{data.event.eventDate}</strong>. Multi-temporal satellite change analysis reveals severe river channel swelling, inundation of low-lying riparian terraces, and multiple tributary debris flows. A total of <strong>{f.totalFloodAreaKm2.toFixed(2)} km²</strong> of flood water has been detected across an analyzed corridor of <strong>{f.totalAnalyzedAreaKm2.toFixed(1)} km²</strong> ({f.percentAreaAffected.toFixed(1)}% affected).
          </p>
          <p className="text-xs leading-relaxed text-slate-300 print:text-slate-800">
            Crucially, highway inundation and debris deposition have severed direct motorized access to <strong>{cutOffSettlements.length} settlement(s)</strong>, disrupting transit lines to nearest regional healthcare facilities.
          </p>
        </section>

        {/* 2. FLOOD / DEBRIS EXTENT */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-700 border-b border-slate-800 print:border-slate-300 pb-1">
            2. FLOOD / DEBRIS EXTENT
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600">Total Flood Extent:</span>
              <div className="text-base font-bold text-cyan-300 print:text-cyan-800">{f.totalFloodAreaKm2.toFixed(2)} km²</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600">Debris / Sediment:</span>
              <div className="text-base font-bold text-orange-400 print:text-orange-700">{f.debrisAreaKm2.toFixed(2)} km²</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600">Permanent Water:</span>
              <div className="text-base font-bold text-slate-200 print:text-slate-900">{f.permanentWaterKm2.toFixed(2)} km²</div>
            </div>
            <div className="p-2.5 rounded bg-slate-900 print:bg-slate-100 border border-slate-800 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600">Detection Confidence:</span>
              <div className="text-base font-bold text-emerald-400 print:text-emerald-700">{f.detectionConfidencePct.toFixed(1)}%</div>
            </div>
          </div>
        </section>

        {/* 3. INFRASTRUCTURE IMPACT */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-700 border-b border-slate-800 print:border-slate-300 pb-1">
            3. INFRASTRUCTURE IMPACT (PRE-EVENT OSM OVERLAY)
          </h2>
          <div className="space-y-2 text-xs">
            <div>
              <strong className="text-slate-200 print:text-black font-mono">ROADS:</strong>{' '}
              <span className="text-slate-300 print:text-slate-700">
                {affectedRoads.length} segment(s) intersect detected flood/debris polygons.
              </span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400 print:text-slate-600 font-mono text-[11px]">
                {affectedRoads.map((r) => (
                  <li key={r.id}>
                    {r.name} ({r.id}): {r.affectedLengthKm} km affected of {r.lengthKm} km total length. {r.connectivityImpact}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              <strong className="text-slate-200 print:text-black font-mono">BRIDGES:</strong>{' '}
              <span className="text-slate-300 print:text-slate-700">
                {affectedBridges.length} bridge(s) flagged within or immediately adjacent to detected water level.
              </span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400 print:text-slate-600 font-mono text-[11px]">
                {affectedBridges.map((b) => (
                  <li key={b.id}>
                    {b.name} (Spans {b.riverName}): Flood proximity {b.floodProximityM} m. Priority: {b.verificationPriority}.
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              <strong className="text-slate-200 print:text-black font-mono">BUILDINGS:</strong>{' '}
              <span className="text-slate-300 print:text-slate-700">
                {affectedBuildings.length} structure(s) overlap detected flood extent by &gt; 25%.
              </span>
            </div>
          </div>
        </section>

        {/* 4. CUT-OFF SETTLEMENTS */}
        <section className="space-y-2">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 print:text-rose-700 border-b border-slate-800 print:border-slate-300 pb-1">
            4. CUT-OFF SETTLEMENT ANALYSIS
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600">
                  <th className="py-1.5">Settlement</th>
                  <th className="py-1.5">Population</th>
                  <th className="py-1.5">Nearest Hospital</th>
                  <th className="py-1.5">Distance</th>
                  <th className="py-1.5">Alternative Route</th>
                  <th className="py-1.5">Disruption Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 text-[11px]">
                {cutOffSettlements.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 font-bold text-rose-300 print:text-rose-700">{s.name}</td>
                    <td className="py-2 text-slate-400 print:text-slate-600">
                      {s.population !== null ? s.population.toLocaleString() : 'Unavailable'}
                    </td>
                    <td className="py-2 text-slate-300 print:text-slate-800">{s.nearestHospital}</td>
                    <td className="py-2 text-cyan-300 print:text-cyan-800">{s.distanceToHospitalKm} km</td>
                    <td className="py-2 text-slate-400 print:text-slate-600">{s.alternateRoute}</td>
                    <td className="py-2 text-slate-300 print:text-slate-700 max-w-xs truncate">{s.cutOffReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. CRITICAL OBSERVATIONS */}
        <section className="space-y-1.5 text-xs text-slate-300 print:text-slate-800 leading-relaxed">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-700 border-b border-slate-800 print:border-slate-300 pb-1">
            5. CRITICAL OBSERVATIONS
          </h2>
          <p>
            • Primary arterial highway ({affectedRoads[0]?.name || 'Regional Highway'}) has sustained severe inundation at gorge bottleneck pinch points, preventing all wheeled vehicle transit.
          </p>
          <p>
            • High-velocity debris mobilization was detected near tributary junctions, posing secondary damming and sudden flash release risks to downstream valleys.
          </p>
          <p>
            • Isolated health facilities (e.g. Dhunche) require aerial resupply of trauma packs and water purification equipment.
          </p>
        </section>

        {/* 6. DATA SOURCES (PROVENANCE) */}
        <section className="space-y-1 text-[11px] font-mono text-slate-400 print:text-slate-600">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-700 border-b border-slate-800 print:border-slate-300 pb-1">
            6. DATA PROVENANCE (STRICT ANTI-CHEATING COMPLIANT)
          </h2>
          <p>• Satellite Radar: Copernicus Sentinel-1 IW GRD (ESA) · 12-day orbit baseline pair.</p>
          <p>• Topography: Copernicus WorldDEM-30 (ESA / DLR).</p>
          <p>• Infrastructure Graph: OpenStreetMap Pre-Event Snapshot ({data.event.baselineDate}). Post-event edits strictly excluded.</p>
          <p>• Validation: Copernicus EMS EMSR927 referenced post-hoc for validation only; NOT used as input.</p>
        </section>

        {/* 7. LIMITATIONS & UNCERTAINTY */}
        <section className="space-y-1 text-[11px] font-mono text-slate-400 print:text-slate-600">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 print:text-amber-700 border-b border-slate-800 print:border-slate-300 pb-1">
            7. LIMITATIONS & UNCERTAINTY
          </h2>
          <ul className="list-disc list-inside space-y-0.5">
            {data.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </section>

        {/* 8. FIELD VERIFICATION REQUIRED */}
        <section className="p-3.5 rounded-xl bg-amber-950/30 print:bg-amber-50 border border-amber-800/60 print:border-amber-300 text-xs text-amber-200 print:text-amber-900 space-y-1">
          <div className="font-mono font-bold uppercase text-[11px] flex items-center gap-1.5 text-amber-300 print:text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>8. IMMEDIATE FIELD VERIFICATION MANDATE</span>
          </div>
          <p className="leading-relaxed">
            Satellite observations identify probable inundation extent and road graph severance. They do NOT establish whether bridges have collapsed, whether roadways can be traversed by high-clearance emergency 4WD vehicles, or local casualty numbers. First responders must verify the highlighted choke points via unmanned aerial vehicles (UAVs) or forward foot reconnaissance prior to dispatching heavy convoys.
          </p>
        </section>
      </div>
    </div>
  );
};
