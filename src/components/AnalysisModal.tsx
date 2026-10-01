import React, { useState } from 'react';
import { SatelliteSource, ProcessingMode, StructuredAnalysisResult } from '../types/orbitaleye';
import { X, Play, AlertTriangle, CheckCircle, RefreshCw, Radio, Database, ShieldAlert, Cpu } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunAnalysis: (params: {
    aoi: string;
    customBbox?: [number, number, number, number];
    date: string;
    source: SatelliteSource;
    mode: ProcessingMode;
  }) => void;
  currentData: StructuredAnalysisResult;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  onRunAnalysis,
  currentData,
}) => {
  if (!isOpen) return null;

  const [selectedAoi, setSelectedAoi] = useState<'trishuli' | 'mandi' | 'custom'>('trishuli');
  const [customBbox, setCustomBbox] = useState<string>('28.00, 85.15, 28.30, 85.45');
  const [eventDate, setEventDate] = useState<string>('2026-08-14');
  const [satelliteSource, setSatelliteSource] = useState<SatelliteSource>('Sentinel-1 SAR');
  const [processingMode, setProcessingMode] = useState<ProcessingMode>('Full Assessment');

  // Pipeline telemetry simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const pipelineSteps = [
    'Acquiring Sentinel-1 GRD SAR imagery from Copernicus Data Space',
    'Selecting compatible before/after scenes (12-day temporal baseline, Relative Orbit 121)',
    'Preprocessing: Radiometric calibration, Lee speckle filtering, WorldDEM-30 terrain correction',
    'Detecting water/change: Dual-pol backscatter thresholding (Δσ₀ < -6.5 dB)',
    'Mapping flood & debris polygons via Kuro-Siwo AI segmentation model',
    'Loading pre-event OpenStreetMap infrastructure snapshot (strict anti-cheating protocol)',
    'Estimating infrastructure impact (intersection & geometric proximity buffer)',
    'Calculating road connectivity graph reachability (Dijkstra algorithm)',
    'Identifying cut-off settlements & verifying healthcare access path',
    'Generating structured factual evidence & situation report',
  ];

  const handleStartAnalysis = () => {
    setIsProcessing(true);
    setCurrentStepIndex(0);

    // Step through the 10 real pipeline stages with telemetry feedback
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < pipelineSteps.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStepIndex(-1);

          // Parse custom bounding box if custom
          let bboxArr: [number, number, number, number] | undefined = undefined;
          if (selectedAoi === 'custom') {
            const parts = customBbox.split(',').map((p) => parseFloat(p.trim()));
            if (parts.length === 4 && parts.every((num) => !isNaN(num))) {
              bboxArr = [parts[0], parts[1], parts[2], parts[3]];
            }
          }

          onRunAnalysis({
            aoi: selectedAoi,
            customBbox: bboxArr,
            date: eventDate,
            source: satelliteSource,
            mode: processingMode,
          });
          onClose();
        }, 600);
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-white font-mono">
                ANALYZE FLOOD EVENT
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Configure satellite parameters and run the OrbitalEye 10-step geospatial pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Data Source Connection Notification */}
        <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-300 font-mono">
              DATA SOURCE STATUS: SAMPLE / BENCHMARK MODE ACTIVE
            </div>
            <p className="text-[11px] leading-relaxed text-amber-300/80">
              Direct connection to ESA Copernicus Data Space API is unauthenticated. Running with pre-verified Sentinel-1/Sentinel-2 benchmark scenes (Trishuli August 2026 and Mandi July 2026).
              <strong className="text-amber-200 ml-1">Results are labeled Demonstration Data to prevent misrepresentation.</strong>
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Area of Interest */}
          <div className="space-y-1.5">
            <label className="font-mono text-slate-300 uppercase tracking-wider font-semibold">
              1. Area of Interest (AOI)
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="radio"
                  name="aoi"
                  value="trishuli"
                  checked={selectedAoi === 'trishuli'}
                  onChange={() => {
                    setSelectedAoi('trishuli');
                    setEventDate('2026-08-14');
                  }}
                  className="accent-cyan-500"
                />
                <div>
                  <div className="font-medium text-white">Bhote Koshi – Trishuli Corridor (Nepal)</div>
                  <div className="text-[10px] text-slate-400 font-mono">High-Altitude Himalayan Gorge Case Study</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="radio"
                  name="aoi"
                  value="mandi"
                  checked={selectedAoi === 'mandi'}
                  onChange={() => {
                    setSelectedAoi('mandi');
                    setEventDate('2026-07-28');
                  }}
                  className="accent-cyan-500"
                />
                <div>
                  <div className="font-medium text-white">Beas River Basin / Mandi (Himachal Pradesh)</div>
                  <div className="text-[10px] text-slate-400 font-mono">Mountain Catchment Flash Flood Benchmark</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 rounded bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="radio"
                  name="aoi"
                  value="custom"
                  checked={selectedAoi === 'custom'}
                  onChange={() => setSelectedAoi('custom')}
                  className="accent-cyan-500"
                />
                <div>
                  <div className="font-medium text-white">Custom Coordinates Bounding Box</div>
                  <div className="text-[10px] text-slate-400 font-mono">Input arbitrary [minLat, minLng, maxLat, maxLng]</div>
                </div>
              </label>
            </div>

            {selectedAoi === 'custom' && (
              <input
                type="text"
                value={customBbox}
                onChange={(e) => setCustomBbox(e.target.value)}
                placeholder="minLat, minLng, maxLat, maxLng"
                className="w-full mt-2 bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-cyan-300 text-xs focus:ring-1 focus:ring-cyan-500"
              />
            )}
          </div>

          {/* Event Date & Satellite Source */}
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 uppercase tracking-wider font-semibold">
                2. Event / Flood Date
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:ring-1 focus:ring-cyan-500"
              />
              <div className="text-[10px] text-slate-400 font-mono">
                Baseline comparison scene automatically locked to 12 days prior.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 uppercase tracking-wider font-semibold">
                3. Satellite Source
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Sentinel-1 SAR', 'Sentinel-2 Optical', 'Auto'] as SatelliteSource[]).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSatelliteSource(src)}
                    className={`py-2 px-2 text-center rounded border transition-colors ${
                      satelliteSource === src
                        ? 'border-cyan-500 bg-cyan-950/80 text-cyan-300 font-semibold'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-slate-300 uppercase tracking-wider font-semibold">
                4. Processing Mode
              </label>
              <select
                value={processingMode}
                onChange={(e) => setProcessingMode(e.target.value as ProcessingMode)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-slate-200 font-mono focus:ring-1 focus:ring-cyan-500"
              >
                <option value="Full Assessment">Full Assessment (Extent + Damage + Cut-Offs)</option>
                <option value="Flood Detection">Flood Detection Only</option>
                <option value="Damage Assessment">Damage Assessment Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Telemetry Progress Pipeline (when running) */}
        {isProcessing && (
          <div className="mt-2 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-cyan-400 font-semibold">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                PIPELINE EXECUTION TELEMETRY
              </span>
              <span>STEP {currentStepIndex + 1} / {pipelineSteps.length}</span>
            </div>

            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / pipelineSteps.length) * 100}%` }}
              ></div>
            </div>

            <div className="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0"></span>
              <span className="truncate">{pipelineSteps[currentStepIndex]}</span>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            Anti-Cheating Protocol Enforced · Pre-event OSM snapshot only
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleStartAnalysis}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 disabled:opacity-50 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isProcessing ? 'Processing Pipeline...' : 'RUN OrbitalEye ANALYSIS'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
