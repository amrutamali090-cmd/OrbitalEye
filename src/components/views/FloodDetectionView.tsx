import React, { useState } from 'react';
import { StructuredAnalysisResult } from '../../types/orbitaleye';
import { MapViewer } from '../MapViewer';
import { Radio, Database, Sliders, ShieldCheck, Activity, Cpu, Sparkles, ArrowRight, Eye, Layers } from 'lucide-react';

interface FloodDetectionViewProps {
  data: StructuredAnalysisResult;
}

export const FloodDetectionView: React.FC<FloodDetectionViewProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'model' | 'stats'>('stats');
  const [selectedSatellite, setSelectedSatellite] = useState<'Sentinel-1 SAR' | 'Sentinel-2 Optical'>('Sentinel-1 SAR');
  const [timeViewMode, setTimeViewMode] = useState<'after' | 'before' | 'compare'>('after');
  const [analysisMode, setAnalysisMode] = useState<'satellite_only' | 'satellite_analysis' | 'analysis_only'>('satellite_analysis');

  const sat = data.satellite;
  const flood = data.flood;
  const model = data.modelInfo;

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden bg-[#07090e]">
      {/* Left Analytical Panel (480px on xl) */}
      <div className="w-full xl:w-[480px] xl:shrink-0 flex flex-col border-r border-slate-800 bg-[#090c14] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-cyan-400">
              <span>RADAR & OPTICAL SATELLITE ENGINE</span>
              <span>·</span>
              <span>SENTINEL-1 IW</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-950/80 border border-amber-800 text-amber-300">
              DEMO SATELLITE DATA
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white mt-1">
            Satellite Flood & Debris Mapping
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Multi-temporal change detection using C-band SAR dual-polarization backscatter differential and Kuro-Siwo neural segmentation.
          </p>

          {/* SATELLITE IMAGERY CONTROL (Core Requirement 3, 4, 5) */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-cyan-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                SATELLITE IMAGERY
              </span>
              <span className="text-[10px] font-mono text-slate-400">10m Ground Resolution</span>
            </div>

            {/* Sensor Selection Buttons: [SENTINEL-1 SAR] [SENTINEL-2 OPTICAL] */}
            <div className="grid grid-cols-2 gap-1.5 font-mono">
              <button
                onClick={() => setSelectedSatellite('Sentinel-1 SAR')}
                className={`py-1.5 px-2 text-center rounded text-xs font-bold transition-all ${
                  selectedSatellite === 'Sentinel-1 SAR'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white bg-slate-950/70 border border-slate-800'
                }`}
              >
                SENTINEL-1 SAR
              </button>
              <button
                onClick={() => setSelectedSatellite('Sentinel-2 Optical')}
                className={`py-1.5 px-2 text-center rounded text-xs font-bold transition-all ${
                  selectedSatellite === 'Sentinel-2 Optical'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white bg-slate-950/70 border border-slate-800'
                }`}
              >
                SENTINEL-2 OPTICAL
              </button>
            </div>

            {/* Time Selection: [BEFORE EVENT] | [AFTER EVENT] | [COMPARE] */}
            <div className="grid grid-cols-3 gap-1 text-xs font-mono">
              <button
                onClick={() => setTimeViewMode('before')}
                className={`py-1.5 px-1 text-center rounded transition-all ${
                  timeViewMode === 'before'
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-700'
                    : 'text-slate-400 hover:text-white bg-slate-950/70 border border-slate-800'
                }`}
              >
                BEFORE EVENT
              </button>
              <button
                onClick={() => setTimeViewMode('after')}
                className={`py-1.5 px-1 text-center rounded transition-all ${
                  timeViewMode === 'after'
                    ? 'bg-slate-800 text-rose-300 font-bold border border-rose-700'
                    : 'text-slate-400 hover:text-white bg-slate-950/70 border border-slate-800'
                }`}
              >
                AFTER EVENT
              </button>
              <button
                onClick={() => setTimeViewMode('compare')}
                className={`py-1.5 px-1 text-center rounded transition-all ${
                  timeViewMode === 'compare'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white bg-slate-950/70 border border-slate-800'
                }`}
              >
                COMPARE
              </button>
            </div>

            {/* Analysis Connection Toggle (Requirement 6) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>ANALYSIS CONNECTION</span>
                <span className="text-[9px] text-cyan-400">REQ 6</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setAnalysisMode('satellite_only')}
                  className={`py-1 px-0.5 text-center rounded transition-all font-semibold ${
                    analysisMode === 'satellite_only'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Hide analytical vectors to inspect pure satellite scene"
                >
                  SATELLITE ONLY
                </button>
                <button
                  onClick={() => setAnalysisMode('satellite_analysis')}
                  className={`py-1 px-0.5 text-center rounded transition-all font-semibold ${
                    analysisMode === 'satellite_analysis'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Show analytical flood & damage vectors overlaid on satellite scene"
                >
                  SATELLITE + ANALYSIS
                </button>
                <button
                  onClick={() => setAnalysisMode('analysis_only')}
                  className={`py-1 px-0.5 text-center rounded transition-all font-semibold ${
                    analysisMode === 'analysis_only'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Show analytical vectors over clean light topographic map"
                >
                  ANALYSIS ONLY
                </button>
              </div>
            </div>

            {/* Satellite Scene Metadata Card */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sensor Platform:</span>
                <span className="text-cyan-400 font-semibold">
                  {selectedSatellite === 'Sentinel-1 SAR' ? 'Sentinel-1A (C-SAR)' : 'Sentinel-2A (MSI)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Acquisition:</span>
                <span className="text-slate-200">
                  {timeViewMode === 'before' ? data.event.baselineDate : data.event.eventDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">AOI:</span>
                <span className="text-slate-200 truncate max-w-[180px]">{data.event.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Geometry / Orbit:</span>
                <span className="text-slate-200">
                  {selectedSatellite === 'Sentinel-1 SAR' ? 'Track 121 (Ascending)' : 'Relative Orbit 077'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Cloud Coverage:</span>
                <span className={selectedSatellite === 'Sentinel-1 SAR' ? 'text-emerald-400' : 'text-amber-400'}>
                  {selectedSatellite === 'Sentinel-1 SAR' ? '0% (Radar Penetrates Cloud)' : '84.5% (Monsoon Occlusion)'}
                </span>
              </div>
            </div>

            {/* Truthful Demo Label */}
            <div className="p-1.5 rounded bg-amber-950/30 border border-amber-800/40 text-[10px] font-mono text-amber-300/80">
              DEMONSTRATION DATA — NOT LIVE SENTINEL OUTPUT
              <span className="block text-[9px] text-slate-400 mt-0.5">
                (Live Copernicus CDSE authentication unavailable in preview sandbox)
              </span>
            </div>
          </div>

          {/* Sub-nav tabs */}
          <div className="flex items-center gap-1.5 mt-4 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-1 px-2 text-center rounded font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Detection Metrics
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex-1 py-1 px-2 text-center rounded font-medium transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pipeline Flow
            </button>
            <button
              onClick={() => setActiveTab('model')}
              className={`flex-1 py-1 px-2 text-center rounded font-medium transition-colors ${
                activeTab === 'model'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kuro-Siwo Model
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'stats' && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Detected Flood Water</div>
                  <div className="text-2xl font-bold text-cyan-400 tabular-nums mt-0.5">
                    {flood.totalFloodAreaKm2.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400">km²</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Δσ₀ specular drop &gt; 6.5 dB
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Debris & Sediment</div>
                  <div className="text-2xl font-bold text-orange-400 tabular-nums mt-0.5">
                    {flood.debrisAreaKm2.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-400">km²</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Rough surface coherence loss
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Total AOI Monitored</div>
                  <div className="text-xl font-bold text-slate-200 tabular-nums mt-0.5">
                    {flood.totalAnalyzedAreaKm2.toFixed(1)}{' '}
                    <span className="text-xs font-normal text-slate-400">km²</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Corridor bounding box
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Model Confidence</div>
                  <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
                    {flood.detectionConfidencePct.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Terrain shadow filtered
                  </div>
                </div>
              </div>

              {/* Surface Classification Breakdown */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-200 font-mono uppercase tracking-wider">
                  Surface Classification Breakdown
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
                      Inundated Flood Extent
                    </span>
                    <span className="font-mono text-cyan-300 tabular-nums">
                      {flood.totalFloodAreaKm2.toFixed(2)} km² ({flood.percentAreaAffected.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
                      Debris / Sediment Flow
                    </span>
                    <span className="font-mono text-orange-300 tabular-nums">
                      {flood.debrisAreaKm2.toFixed(2)} km²
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                      Radar Shadow / Uncertain
                    </span>
                    <span className="font-mono text-amber-300 tabular-nums">
                      {flood.uncertainAreaKm2.toFixed(2)} km²
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="w-2.5 h-2.5 rounded-sm bg-blue-800"></span>
                      Permanent Pre-Event Water
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {flood.permanentWaterKm2.toFixed(2)} km²
                    </span>
                  </div>
                </div>
              </div>

              {/* Detection Principle Box */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-200 font-mono uppercase tracking-wider text-[11px]">
                  C-SAR Specular Physics Principle
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Calm or moving flood waters act as specular planar reflectors for active 5.405 GHz radar pulses, deflecting electromagnetic energy away from the sensor. This manifests as a dramatic backscatter drop (typically &gt; 6 dB decrease in σ₀), clearly segregating new water from surrounding terrain.
                </p>
              </div>
            </>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Operational Analysis Pipeline (Requirement 6)
              </div>

              {/* Step 1 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-cyan-800/80 space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>1. SENTINEL-1 BEFORE ({data.event.baselineDate})</span>
                  <span className="text-[10px] text-slate-400">INPUT SCENE</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Dual-pol VV+VH baseline acquisition. Pre-event river baseline and terrain backscatter calibration.
                </p>
              </div>

              <div className="flex justify-center text-slate-600 font-bold">↓</div>

              {/* Step 2 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-rose-800/80 space-y-1">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span>2. SENTINEL-1 AFTER ({data.event.eventDate})</span>
                  <span className="text-[10px] text-slate-400">INPUT SCENE</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Post-flood acquisition along matching orbit track (Track 121) ensuring identical incidence angle and look direction.
                </p>
              </div>

              <div className="flex justify-center text-slate-600 font-bold">↓</div>

              {/* Step 3 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-cyan-400 font-bold">
                  <span>3. CHANGE DETECTION</span>
                  <span className="text-[10px] text-slate-400">PROCESSING</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Multi-temporal backscatter ratio calculation (Δσ₀ = σ₀_post - σ₀_pre). Lee speckle filtering (7x7 window).
                </p>
              </div>

              <div className="flex justify-center text-slate-600 font-bold">↓</div>

              {/* Step 4 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>4. FLOOD / DEBRIS MASK</span>
                  <span className="text-[10px] text-slate-400">SEGMENTATION</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Kuro-Siwo neural FPN segmentation + Copernicus DEM slope thresholding (&gt;15° masked for radar shadow false positives).
                </p>
              </div>

              <div className="flex justify-center text-slate-600 font-bold">↓</div>

              {/* Step 5 */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>5. DAMAGE ASSESSMENT</span>
                  <span className="text-[10px] text-slate-400">OVERLAY</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Pre-event OpenStreetMap spatial intersection with buildings, bridges, and highway network.
                </p>
              </div>

              <div className="flex justify-center text-slate-600 font-bold">↓</div>

              {/* Step 6 */}
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 space-y-1">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span>6. CUT-OFF SETTLEMENT ANALYSIS</span>
                  <span className="text-[10px] text-rose-400">OUTPUT</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Network graph reachability from regional hospitals and supply depots. Critical isolation flagging.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-cyan-400 font-semibold uppercase">{model.name}</div>
                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Dual-Stream ResNet-50 Feature Pyramid Network with temporal cross-attention for Sentinel-1 bi-temporal SAR pairs.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-slate-300 font-semibold uppercase text-[11px]">Training Datasets</div>
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <div>• Primary: <span className="text-white">{model.trainingDataset}</span></div>
                  <div>• Secondary: <span className="text-white">{model.secondaryDataset}</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-cyan-400 font-semibold uppercase">Benchmark Evaluation Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">IoU (Intersection-over-Union)</span>
                    <span className="text-base font-bold text-emerald-400">{model.benchmarkMetrics.iou}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">F1-Score</span>
                    <span className="text-base font-bold text-emerald-400">{model.benchmarkMetrics.f1Score}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Precision</span>
                    <span className="text-base font-bold text-cyan-400">{model.benchmarkMetrics.precision}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block">Recall</span>
                    <span className="text-base font-bold text-cyan-400">{model.benchmarkMetrics.recall}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Map Canvas Stage */}
      <div className="flex-1 h-full min-h-[500px] relative">
        <MapViewer
          data={data}
          activeMode="flood"
          initialSatelliteType={selectedSatellite}
          initialTimeViewMode={timeViewMode}
          initialAnalysisMode={analysisMode}
          onSatelliteTypeChange={setSelectedSatellite}
          onTimeViewModeChange={setTimeViewMode}
          onAnalysisModeChange={setAnalysisMode}
        />
      </div>
    </div>
  );
};
