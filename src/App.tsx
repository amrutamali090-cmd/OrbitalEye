import React, { useState, useEffect } from 'react';
import { TopNav, NavTab } from './components/TopNav';
import { AnalysisModal } from './components/AnalysisModal';
import { OverviewView } from './components/views/OverviewView';
import { FloodDetectionView } from './components/views/FloodDetectionView';
import { DamageAssessmentView } from './components/views/DamageAssessmentView';
import { CutOffSettlementsView } from './components/views/CutOffSettlementsView';
import { FloodPathView } from './components/views/FloodPathView';
import { AiCopilotView } from './components/views/AiCopilotView';
import { SituationReportView } from './components/views/SituationReportView';
import { CaseStudyView } from './components/views/CaseStudyView';
import { DataMethodologyView } from './components/views/DataMethodologyView';
import { LimitationsView } from './components/views/LimitationsView';
import { FuturePredictionView } from './components/views/FuturePredictionView';
import { TRISHULI_DATASET, ALL_BENCHMARK_DATASETS } from './data/benchmarkDatasets';
import { StructuredAnalysisResult, SettlementNode, SatelliteSource, ProcessingMode } from './types/orbitaleye';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [activeDataset, setActiveDataset] = useState<StructuredAnalysisResult>(TRISHULI_DATASET);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementNode | null>(null);
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [sourceMode, setSourceMode] = useState<'LIVE_DATA' | 'DEMO_DATA'>('DEMO_DATA');

  // Check backend satellite source API status
  useEffect(() => {
    fetch('/api/satellite-source-status')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.mode) {
          setSourceMode(data.mode);
        }
      })
      .catch(() => {
        // Default to verified benchmark mode
        setSourceMode('DEMO_DATA');
      });
  }, []);

  const handleSelectEvent = (eventId: string) => {
    if (ALL_BENCHMARK_DATASETS[eventId]) {
      setActiveDataset(ALL_BENCHMARK_DATASETS[eventId]);
    } else if (eventId === 'trishuli-2026-08') {
      setActiveDataset(TRISHULI_DATASET);
    }
    setSelectedSettlement(null);
  };

  const handleRunAnalysis = (params: {
    aoi: string;
    customBbox?: [number, number, number, number];
    date: string;
    source: SatelliteSource;
    mode: ProcessingMode;
  }) => {
    if (params.aoi && ALL_BENCHMARK_DATASETS[params.aoi]) {
      const base = ALL_BENCHMARK_DATASETS[params.aoi];
      setActiveDataset({
        ...base,
        event: {
          ...base.event,
          eventDate: params.date,
        },
        satellite: {
          ...base.satellite,
          sensor: params.source === 'Auto' ? 'Sentinel-1 SAR' : params.source,
        },
      });
    } else if (params.aoi === 'assam' || params.aoi === 'mandi') {
      const base = ALL_BENCHMARK_DATASETS['assam-brahmaputra-2026'] || TRISHULI_DATASET;
      setActiveDataset({
        ...base,
        event: {
          ...base.event,
          eventDate: params.date,
        },
        satellite: {
          ...base.satellite,
          sensor: params.source === 'Auto' ? 'Sentinel-1 SAR' : params.source,
        },
      });
    } else if (params.aoi === 'custom' && params.customBbox) {
      // Create dynamically adjusted result for custom bounding box
      const [minLat, minLng, maxLat, maxLng] = params.customBbox;
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      setActiveDataset({
        ...TRISHULI_DATASET,
        event: {
          ...TRISHULI_DATASET.event,
          id: `custom-${Date.now()}`,
          name: `Custom AOI [${centerLat.toFixed(2)}°N, ${centerLng.toFixed(2)}°E]`,
          region: 'Evaluated Custom Mountain Catchment',
          country: 'Regional Hydrographic Basin',
          eventDate: params.date,
          aoiBounds: params.customBbox,
          center: [centerLat, centerLng],
          zoom: 12,
        },
        satellite: {
          ...TRISHULI_DATASET.satellite,
          sensor: params.source === 'Auto' ? 'Sentinel-1 SAR' : params.source,
          preEventTimestamp: `${params.date}T00:00:00Z (-12d baseline)`,
          postEventTimestamp: `${params.date}T00:00:00Z`,
        },
      });
    } else {
      setActiveDataset({
        ...TRISHULI_DATASET,
        event: {
          ...TRISHULI_DATASET.event,
          eventDate: params.date,
        },
        satellite: {
          ...TRISHULI_DATASET.satellite,
          sensor: params.source === 'Auto' ? 'Sentinel-1 SAR' : params.source,
        },
      });
    }

    setCurrentTab('overview');
    setSelectedSettlement(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#07090e] text-slate-100 font-sans overflow-hidden antialiased">
      {/* Top Bar Contract (3 Zones) */}
      <TopNav
        currentTab={currentTab}
        onTabChange={(tab) => setCurrentTab(tab)}
        selectedEventId={activeDataset.event.id}
        onSelectEvent={handleSelectEvent}
        onOpenAnalyzeModal={() => setIsAnalyzeModalOpen(true)}
        sourceMode={sourceMode}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentTab === 'overview' && (
          <OverviewView
            data={activeDataset}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onSelectSettlement={(s) => setSelectedSettlement(s)}
          />
        )}

        {currentTab === 'floodmap' && (
          <FloodDetectionView data={activeDataset} />
        )}

        {currentTab === 'damage' && (
          <DamageAssessmentView data={activeDataset} />
        )}

        {currentTab === 'cutoff' && (
          <CutOffSettlementsView
            data={activeDataset}
            selectedSettlement={selectedSettlement}
            onSelectSettlement={(s) => setSelectedSettlement(s)}
          />
        )}

        {currentTab === 'floodpath' && (
          <FloodPathView data={activeDataset} />
        )}

        {currentTab === 'futureprediction' && (
          <FuturePredictionView data={activeDataset} />
        )}

        {currentTab === 'copilot' && (
          <AiCopilotView data={activeDataset} />
        )}

        {currentTab === 'report' && (
          <SituationReportView data={activeDataset} />
        )}

        {currentTab === 'casestudy' && (
          <CaseStudyView />
        )}

        {currentTab === 'methodology' && (
          <DataMethodologyView data={activeDataset} />
        )}

        {currentTab === 'limitations' && (
          <LimitationsView />
        )}
      </main>

      {/* Analyze Event Pipeline Modal */}
      <AnalysisModal
        isOpen={isAnalyzeModalOpen}
        onClose={() => setIsAnalyzeModalOpen(false)}
        onRunAnalysis={handleRunAnalysis}
        currentData={activeDataset}
      />
    </div>
  );
}
