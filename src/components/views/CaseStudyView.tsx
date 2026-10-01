import React, { useState } from 'react';
import { TRISHULI_DATASET } from '../../data/benchmarkDatasets';
import { MapViewer } from '../MapViewer';
import { ShieldCheck, CheckCircle2, AlertTriangle, Layers, ExternalLink, ArrowRight, Radio, Eye } from 'lucide-react';

export const CaseStudyView: React.FC = () => {
  const data = TRISHULI_DATASET;
  const val = data.validationReference;
  const [activeStep, setActiveStep] = useState<number>(3); // 1: Before, 2: After, 3: Compare, 4: Flood/Change, 5: Infrastructure, 6: Cut-Off
  const [showValidationOverlay, setShowValidationOverlay] = useState(true);

  const evidenceSteps = [
    {
      step: 1,
      title: 'Sentinel-1 Before',
      date: '2026-08-02',
      badge: 'PRE-EVENT SAR',
      desc: 'Baseline C-band SAR backscatter acquisition (Orbit Track 121 Ascending). River channel width ~22m in steep canyon.',
      mode: 'before' as const,
    },
    {
      step: 2,
      title: 'Sentinel-1 After',
      date: '2026-08-14',
      badge: 'POST-EVENT SAR',
      desc: 'Post-flood acquisition along matching track. Massive backscatter drop (<-18 dB) across the widened riverbed (~65m).',
      mode: 'after' as const,
    },
    {
      step: 3,
      title: 'Before/After Comparison',
      date: '12-Day Baseline',
      badge: 'BITEMPORAL SLIDER',
      desc: 'Direct multi-temporal comparison revealing catastrophic water surge expansion and debris deposition along highway RD-PLH-01.',
      mode: 'compare' as const,
    },
    {
      step: 4,
      title: 'Detected Flood & Change Layer',
      date: 'AI Segmentation',
      badge: '14.82 km² INUNDATION',
      desc: 'Automated Kuro-Siwo neural FPN segmentation separating water specular reflection from terrain shadow and rough debris.',
      mode: 'after' as const,
    },
    {
      step: 5,
      title: 'Infrastructure Overlay',
      date: 'Pre-Event OSM',
      badge: 'CRITICAL ASSETS',
      desc: 'Intersection of detected flood mask with OpenStreetMap roads (3.2 km severed) and bridges (Mailung Khola Bridge).',
      mode: 'after' as const,
    },
    {
      step: 6,
      title: 'Cut-Off Settlement Analysis',
      date: 'Graph Reachability',
      badge: 'RESCUE INTELLIGENCE',
      desc: 'Graph reachability confirms Dhunche, Syabrubesi, Mailung, and Ramche completely severed from Trishuli District Hospital in Bidur.',
      mode: 'after' as const,
    },
  ];

  const currentEvidence = evidenceSteps[activeStep - 1];

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#07090e]">
      {/* Left Analytical Panel (500px on xl) */}
      <div className="w-full xl:w-[500px] xl:shrink-0 flex flex-col border-r border-slate-800 bg-[#090c14] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              <span>PRIMARY BENCHMARK</span>
              <span>·</span>
              <span>NEPAL AUGUST 2026</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
              6-STEP EVIDENCE CHAIN
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Bhote Koshi – Trishuli 2026 Case Study
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            These satellite images are the physical evidence from which OrbitalEye autonomously derives flood masks, damage assessments, and settlement cut-off reachability.
          </p>

          {/* Strict Anti-Cheating & Independence Callout */}
          <div className="mt-3.5 p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 text-xs text-purple-200">
            <div className="flex items-center justify-between font-mono font-bold text-purple-300 uppercase text-[10px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Copernicus EMS EMSR927 Validation Reference
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 text-[9px]">
                INDEPENDENT CHECK ONLY
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-purple-200/90 font-sans">
              <strong>STRICT BENCHMARK PROTOCOL:</strong> Copernicus EMS EMSR927 maps are NEVER used as input to generate OrbitalEye results. They are loaded strictly in this post-hoc workspace to independently quantify accuracy against an official emergency cartographic product.
            </p>
          </div>
        </div>

        {/* 6-Step Satellite Evidence Chain Selector (Core Requirement 11) */}
        <div className="p-5 space-y-4 border-b border-slate-800 bg-slate-950/40">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center justify-between">
            <span>Satellite Evidence Chain</span>
            <span className="text-[10px] text-cyan-400 font-normal">STEP {activeStep} OF 6</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
            {evidenceSteps.map((ev) => (
              <button
                key={ev.step}
                onClick={() => setActiveStep(ev.step)}
                className={`p-2 rounded-lg text-left transition-all border ${
                  activeStep === ev.step
                    ? 'bg-cyan-950/90 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>#{ev.step}</span>
                  <span className="text-[8px] opacity-75">{ev.badge}</span>
                </div>
                <div className="truncate font-semibold mt-1">{ev.title}</div>
              </button>
            ))}
          </div>

          {/* Active Evidence Step Detail Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Step {activeStep}: {currentEvidence.title}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                {currentEvidence.date}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentEvidence.desc}
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-800 flex items-center justify-between">
              <span>Sensor: Sentinel-1A IW (C-SAR)</span>
              <span>Track 121 (Ascending)</span>
            </div>
          </div>
        </div>

        {/* Validation Accuracy Metrics (Independent Check) */}
        <div className="p-5 space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center justify-between">
              <span>EMSR927 Independent Verification</span>
              <span className="text-emerald-400 font-normal text-[10px]">Copernicus Ground Truth</span>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">IoU Overlap</span>
                <span className="text-xl font-bold text-cyan-400 tabular-nums">
                  {(val?.spatialAgreementIoU! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Intersection</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Precision</span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  {(val?.precision! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">False + Filter</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recall</span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">
                  {(val?.recall! * 100).toFixed(1)}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Extent Captured</span>
              </div>
            </div>
          </div>

          {/* Key Findings in Trishuli Case */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs">
            <div className="font-semibold text-white font-mono uppercase tracking-wider text-[11px]">
              Key Case Study Findings
            </div>
            <div className="space-y-2 text-slate-300 leading-relaxed font-sans">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <strong className="text-rose-400 font-mono block">1. Mailung & Ramche Severance:</strong>
                High-gradient debris flows buried the Pasang Lhamu Highway (RD-PLH-01) across 3.2 km, severing the sole motorable corridor between southern Nuwakot and northern Rasuwa.
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <strong className="text-rose-400 font-mono block">2. Dhunche & Syabrubesi Isolation:</strong>
                While Dhunche possesses an internal primary health post, its road connection to the tertiary Trishuli District Hospital in Bidur (34 km south) was completely cut off.
              </div>

              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <strong className="text-cyan-400 font-mono block">3. Radar Layover Resilience:</strong>
                Despite severe 45° mountain slopes, Sentinel-1 12-day orbit track 121 ascending imagery penetrated cloud cover where Sentinel-2 optical imagery suffered 84.5% monsoon cloud occlusion.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Map Stage synced with Evidence Step */}
      <div className="flex-1 h-full min-h-[500px] relative">
        <MapViewer
          data={data}
          activeMode="validation"
          initialSatelliteType="Sentinel-1 SAR"
          initialTimeViewMode={currentEvidence.mode}
        />
      </div>
    </div>
  );
};
