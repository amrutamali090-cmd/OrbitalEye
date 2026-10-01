import React from 'react';
import { AlertTriangle, ShieldAlert, Mountain, Clock, CloudRain, GitBranch } from 'lucide-react';

export const LimitationsView: React.FC = () => {
  const limitations = [
    {
      title: 'Satellite Revisit Interval & Temporal Latency',
      icon: Clock,
      description:
        'Sentinel-1 and Sentinel-2 satellites do not provide continuous, minute-by-minute surveillance. Constellations operate on fixed 6-to-12-day orbital repeat cycles. The peak flood crest may occur between passes and partially recede prior to satellite observation.',
    },
    {
      title: 'Geometric Distortion in Mountainous Terrain',
      icon: Mountain,
      description:
        'In steep Himalayan canyons (such as the Trishuli or Beas valleys), side-looking SAR geometry experiences radar layover, foreshortening, and radar shadow. Deep narrow canyon floors facing away from the radar look direction may have reduced classification confidence.',
    },
    {
      title: 'Optical Imagery Occlusion by Cloud Cover',
      icon: CloudRain,
      description:
        'Monsoon weather systems that produce extreme precipitation events simultaneously generate dense, persistent cloud cover. While Sentinel-1 SAR C-band microwaves penetrate clouds, optical sensors (Sentinel-2) are frequently obscured during peak disaster periods.',
    },
    {
      title: 'Pre-Event OpenStreetMap Completeness & Currency',
      icon: GitBranch,
      description:
        'Road graph reachability and infrastructure vulnerability calculations depend strictly on pre-event OpenStreetMap topologies. Informal footpaths, temporary bridges, or newly constructed unpaved rural tracks may be absent from OSM records.',
    },
    {
      title: 'Inundation Exposure vs. Physical Structural Collapse',
      icon: AlertTriangle,
      description:
        'A satellite pixel showing flood water overlap indicates geometric inundation exposure; it does NOT verify physical structural collapse, bridge abutment washout, or asphalt pavement failure. Submerged roadways may remain structurally sound after water recedes.',
    },
    {
      title: 'Mandatory Field Ground-Truth & Operational Disclaimer',
      icon: ShieldAlert,
      description:
        'OrbitalEye is a satellite intelligence and rapid disaster mapping system. All outputs are provisional advisory intelligence and must NOT be used as the sole legal authority for disaster response without on-the-ground UAV or reconnaissance verification.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-10 space-y-8 max-w-4xl mx-auto text-slate-200">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-amber-400">
          <span>ETHICAL TRANSPARENCY & ACCURACY</span>
          <span>·</span>
          <span>OPERATIONAL SAFETY</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1">
          System Limitations & Operational Constraints
        </h1>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          OrbitalEye adheres to the highest scientific standards of transparency. We do not claim capabilities beyond what the satellite sensors and spatial data genuinely substantiate.
        </p>
      </div>

      {/* Grid of Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limitations.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/80 text-amber-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-white font-mono leading-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-amber-400/90 flex items-center justify-between">
                <span>IMPACT: OPERATIONAL CAUTION</span>
                <span>VERIFY IN FIELD</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Banner */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/50 text-xs text-amber-200/90 space-y-2">
        <h4 className="font-mono font-bold text-amber-300 uppercase tracking-wider text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          First Responder Golden Rule:
        </h4>
        <p className="leading-relaxed">
          &quot;Satellite intelligence provides rapid macro-scale situational awareness to orient field reconnaissance, prioritize UAV drone flights, and identify probable bottlenecks. It does not replace boots-on-the-ground civil engineering inspection before driving heavy emergency vehicles across flagged bridge crossings.&quot;
        </p>
      </div>
    </div>
  );
};
