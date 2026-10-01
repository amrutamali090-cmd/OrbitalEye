import React, { useState } from 'react';
import { StructuredAnalysisResult } from '../../types/orbitaleye';
import { MapViewer } from '../MapViewer';
import { ArrowDown, Mountain, Compass, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface FloodPathViewProps {
  data: StructuredAnalysisResult;
}

export const FloodPathView: React.FC<FloodPathViewProps> = ({ data }) => {
  const fp = data.floodPath;
  const [selectedPoint, setSelectedPoint] = useState<[number, number]>(fp.upstreamPoint);

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#07090e]">
      {/* Left Analytical Panel (480px on xl) */}
      <div className="w-full xl:w-[480px] xl:shrink-0 flex flex-col border-r border-slate-800 bg-[#090c14] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-sky-400">
            <span>HYDROLOGICAL ROUTING</span>
            <span>·</span>
            <span>ELEVATION MODEL</span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white mt-1">
            Copernicus DEM Downstream Flood Path Trace
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Uses Copernicus WorldDEM-30 30-meter elevation gradients to compute the steepest descent thalweg path from high-mountain catchments.
          </p>

          {/* Mandatory Label Badge */}
          <div className="mt-3 p-3 rounded-lg bg-sky-950/40 border border-sky-800/60 text-xs text-sky-200">
            <div className="flex items-center gap-1.5 font-mono font-bold text-sky-300 uppercase text-[10px]">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>HYPOTHETICAL / MODELED TRAJECTORY</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-sky-200/90 font-sans">
              {fp.disclaimer}
            </p>
          </div>
        </div>

        {/* Path Metrics & Upstream Point */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Upstream Elevation</span>
              <div className="text-xl font-bold text-sky-300 tabular-nums mt-0.5">
                {fp.upstreamElevationM} <span className="text-xs text-slate-400">m a.s.l.</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Lat: {fp.upstreamPoint[0].toFixed(3)}, Lng: {fp.upstreamPoint[1].toFixed(3)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Valley Trace Length</span>
              <div className="text-xl font-bold text-cyan-300 tabular-nums mt-0.5">
                {fp.modeledLengthKm} <span className="text-xs text-slate-400">km</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Mean slope: {fp.valleyAverageSlopeDeg}° gradient
              </div>
            </div>
          </div>

          {/* Exposed Downstream Communities along Path */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center justify-between">
              <span>Downstream Settlements Along Trace ({fp.exposedSettlements.length})</span>
              <span className="text-[10px] text-sky-400 font-normal">Distance from origin</span>
            </div>

            <div className="space-y-2">
              {fp.exposedSettlements.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                      {item.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Elevation drop: {item.elevationDeltaM}m · Risk: {item.risk}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-cyan-300 font-bold">+{item.downstreamKm} km</div>
                    <span className="text-[10px] text-slate-500">downstream</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Potentially Exposed Critical Infrastructure */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              Exposed Infrastructure Choke Points
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              {fp.exposedBridges.map((b, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-amber-300 flex items-center gap-1">
                      <span>☲ Bridge:</span> {b.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Spans: {b.river}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">+{b.intersectKm} km</span>
                </div>
              ))}

              {fp.exposedRoads.map((r, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-rose-300 flex items-center gap-1">
                      <span>━ Highway:</span> {r.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      Class: {r.roadClass}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">+{r.intersectKm} km</span>
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
          activeMode="floodpath"
          onUpstreamPointSelected={(pt) => setSelectedPoint(pt)}
        />
      </div>
    </div>
  );
};
