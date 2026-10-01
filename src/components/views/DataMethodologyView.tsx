import React from 'react';
import { StructuredAnalysisResult } from '../../types/orbitaleye';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, BookOpen, Cpu, Database } from 'lucide-react';

interface DataMethodologyViewProps {
  data: StructuredAnalysisResult;
}

export const DataMethodologyView: React.FC<DataMethodologyViewProps> = ({ data }) => {
  const model = data.modelInfo;

  const provenanceItems = [
    {
      source: 'Copernicus Sentinel-1 (ESA)',
      type: 'Satellite Synthetic Aperture Radar (SAR)',
      role: 'Before/after flood & debris extent detection',
      status: 'ALLOWED',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      reason: 'Standard raw open satellite radar data.',
    },
    {
      source: 'Copernicus Sentinel-2 (ESA)',
      type: 'Optical Multispectral Imagery',
      role: 'Multispectral water index (MNDWI) & cloud screening',
      status: 'ALLOWED',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      reason: 'Raw open optical satellite imagery.',
    },
    {
      source: 'Copernicus WorldDEM-30 (ESA / DLR)',
      type: 'Digital Elevation Model (30m)',
      role: 'Terrain correction & Downstream flood path hydraulic routing',
      status: 'ALLOWED',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      reason: 'Global baseline topography.',
    },
    {
      source: 'OpenStreetMap Pre-Event Snapshot',
      type: 'Vector GIS (roads, buildings, bridges, hospitals)',
      role: 'Pre-disaster infrastructure network reachability graph',
      status: 'ALLOWED',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      reason: 'Timestamp strictly before event onset.',
    },
    {
      source: 'Kuro Siwo Global Flood Dataset (Bountos et al., 2024)',
      type: 'AI Training Benchmark',
      role: 'Training weights for SAR/Optical segmentation neural network',
      status: 'ALLOWED',
      statusClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      reason: 'Authorized peer-reviewed training dataset.',
    },
    {
      source: 'Copernicus EMS EMSR927 Maps',
      type: 'External Published Damage Assessment',
      role: 'Post-hoc validation comparison ONLY',
      status: 'PROHIBITED AS INPUT',
      statusClass: 'text-rose-400 bg-rose-950/60 border-rose-800',
      reason: 'Must never be used as system input; strictly reserved for independent verification.',
    },
    {
      source: 'UNOSAT / Published Disaster Portals',
      type: 'Post-Event Expert Damage Maps',
      role: 'Excluded from pipeline execution',
      status: 'PROHIBITED AS INPUT',
      statusClass: 'text-rose-400 bg-rose-950/60 border-rose-800',
      reason: 'Cheating violation: copying published human annotations as model outputs.',
    },
    {
      source: 'Post-Event OpenStreetMap Edits',
      type: 'Post-Disaster Community Edits',
      role: 'Excluded to preserve pre-disaster baseline',
      status: 'PROHIBITED AS INPUT',
      statusClass: 'text-rose-400 bg-rose-950/60 border-rose-800',
      reason: 'Post-event road block tags would bypass the automated network reachability model.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090e] p-6 lg:p-10 space-y-8 max-w-5xl mx-auto text-slate-200">
      {/* Page Title */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
          <span>SATELLITE INTELLIGENCE ARCHITECTURE</span>
          <span>·</span>
          <span>RESEARCH METHODOLOGY</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-mono mt-1">
          Data Provenance & AI Architecture
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Comprehensive compliance record detailing authorized data inputs, strict anti-cheating separation, AI segmentation architecture, and mandatory legal attributions.
        </p>
      </div>

      {/* 1. DATA PROVENANCE & ANTI-CHEATING TABLE */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            1. Data Provenance & Input Integrity Audit
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Strict Data Provenance Standard</span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/80 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <tr>
                  <th className="p-3">Data Source</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">System Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Compliance Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                {provenanceItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-white">{item.source}</td>
                    <td className="p-3 text-slate-400">{item.type}</td>
                    <td className="p-3 text-slate-300">{item.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.statusClass}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 text-[10px] font-sans">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2. AI MODEL INFORMATION PANEL */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          2. AI Segmentation Architecture & Training Benchmark
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold block">
              Neural Network Backbone
            </span>
            <div className="text-sm font-bold text-white font-mono">{model.name}</div>
            <p className="text-slate-300 leading-relaxed font-sans">{model.architecture}</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono space-y-1">
              <div>
                <strong className="text-slate-400">Input Channels:</strong>
                <div className="text-cyan-300 mt-0.5">{model.inputBands.join(' · ')}</div>
              </div>
              <div className="pt-1">
                <strong className="text-slate-400">Output Mask Classes:</strong>
                <div className="text-slate-200 mt-0.5">{model.outputClasses.join(' · ')}</div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono">
            <span className="text-[10px] uppercase text-cyan-400 font-semibold block">
              Validation Benchmark Metrics
            </span>
            <div className="text-xs text-slate-300 font-sans">
              Evaluated on independent Kuro-Siwo test partitions:
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">IoU (Water Class)</span>
                <span className="text-xl font-bold text-emerald-400">{model.benchmarkMetrics.iou}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">F1-Score</span>
                <span className="text-xl font-bold text-emerald-400">{model.benchmarkMetrics.f1Score}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Precision</span>
                <span className="text-xl font-bold text-cyan-400">{model.benchmarkMetrics.precision}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recall</span>
                <span className="text-xl font-bold text-cyan-400">{model.benchmarkMetrics.recall}</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-sans pt-1">
              {model.evaluationStatus}
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCIENTIFIC CITATIONS & MANDATORY ATTRIBUTIONS */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          3. Mandatory Legal Attributions & Scientific Citations
        </h2>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-xs leading-relaxed text-slate-300">
          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-cyan-400 font-semibold block mb-1">Copernicus Sentinel Data:</span>
            &quot;Contains modified Copernicus Sentinel data 2026.&quot;
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-cyan-400 font-semibold block mb-1">Copernicus WorldDEM-30:</span>
            &quot;Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.&quot;
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-cyan-400 font-semibold block mb-1">OpenStreetMap:</span>
            &quot;© OpenStreetMap contributors.&quot;
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-cyan-400 font-semibold block mb-1">Kuro Siwo Benchmark Citation:</span>
            Bountos, N. I., et al. (2024). <em>&quot;Kuro Siwo: A Multi-Temporal High-Resolution Benchmark for Global Flood and Debris Mapping.&quot;</em> IEEE Transactions on Geoscience and Remote Sensing.
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-cyan-400 font-semibold block mb-1">Sen1Floods11 Citation:</span>
            Bonafilia, D., et al. (2020). <em>&quot;Sen1Floods11: A Georeferenced Dataset to Train and Test Deep Learning Flood Algorithms for Sentinel-1.&quot;</em> CVPR Workshops 2020.
          </div>
        </div>
      </section>
    </div>
  );
};
