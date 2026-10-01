import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { StructuredAnalysisResult, SettlementNode, RoadSegment, BridgeFeature, BuildingFeature, FloodPolygon, FutureRiskZone } from '../types/orbitaleye';
import { Layers, Eye, EyeOff, Sliders, ShieldAlert, Compass, MapPin, Activity, CheckCircle, AlertTriangle, XCircle, HelpCircle, Radio, Sparkles, Orbit } from 'lucide-react';
import { generateSentinelRasterUrl, getSatelliteSceneMetadata } from '../utils/satelliteImagery';

interface MapViewerProps {
  data: StructuredAnalysisResult;
  selectedSettlementId?: string | null;
  onSelectSettlement?: (settlement: SettlementNode | null) => void;
  activeMode?: 'all' | 'flood' | 'damage' | 'cutoff' | 'floodpath' | 'futureprediction' | 'validation';
  onUpstreamPointSelected?: (point: [number, number]) => void;
  initialBaseMapMode?: 'geographic' | 'sentinel-1' | 'sentinel-2';
  initialSatelliteType?: 'Sentinel-1 SAR' | 'Sentinel-2 Optical';
  initialTimeViewMode?: 'after' | 'before' | 'compare';
  initialAnalysisMode?: 'satellite_only' | 'satellite_analysis' | 'analysis_only';
  onSatelliteTypeChange?: (type: 'Sentinel-1 SAR' | 'Sentinel-2 Optical') => void;
  onTimeViewModeChange?: (mode: 'after' | 'before' | 'compare') => void;
  onAnalysisModeChange?: (mode: 'satellite_only' | 'satellite_analysis' | 'analysis_only') => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  data,
  selectedSettlementId,
  onSelectSettlement,
  activeMode = 'all',
  onUpstreamPointSelected,
  initialBaseMapMode = 'geographic',
  initialSatelliteType = 'Sentinel-1 SAR',
  initialTimeViewMode = 'after',
  initialAnalysisMode = 'satellite_analysis',
  onSatelliteTypeChange,
  onTimeViewModeChange,
  onAnalysisModeChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<{ [key: string]: any }>({});

  // Layer visibility state
  const [layersVisibility, setLayersVisibility] = useState({
    satelliteTiles: true,
    floodExtent: true,
    debrisExtent: true,
    uncertainZones: true,
    roads: true,
    bridges: true,
    settlements: true,
    buildings: true,
    floodPath: true,
    futureRisk: true,
    emsr927Validation: false,
  });

  const [satelliteOpacity, setSatelliteOpacity] = useState(0.85);
  // Base map mode: 'geographic' (natural light topo terrain) vs 'satellite' (high-res space imagery)
  const [baseMapMode, setBaseMapMode] = useState<'geographic' | 'satellite'>(
    initialBaseMapMode === 'geographic' ? 'geographic' : 'satellite'
  );
  const [splitSliderPosition, setSplitSliderPosition] = useState(50);
  const [isComparingBeforeAfter, setIsComparingBeforeAfter] = useState(initialTimeViewMode === 'compare');
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  
  // Satellite imagery mode (Sentinel-1 SAR vs Sentinel-2 Optical)
  const [satelliteType, setSatelliteType] = useState<'Sentinel-1 SAR' | 'Sentinel-2 Optical'>(initialSatelliteType);
  const [timeViewMode, setTimeViewMode] = useState<'after' | 'before' | 'compare'>(initialTimeViewMode);
  
  // Operational Analysis Connection Mode: [SATELLITE ONLY] | [SATELLITE + ANALYSIS] | [ANALYSIS ONLY]
  const [analysisMode, setAnalysisMode] = useState<'satellite_only' | 'satellite_analysis' | 'analysis_only'>(initialAnalysisMode);

  // Sync initial props
  useEffect(() => {
    if (initialSatelliteType) setSatelliteType(initialSatelliteType);
  }, [initialSatelliteType]);

  useEffect(() => {
    if (initialTimeViewMode) {
      setTimeViewMode(initialTimeViewMode);
      setIsComparingBeforeAfter(initialTimeViewMode === 'compare');
    }
  }, [initialTimeViewMode]);

  useEffect(() => {
    if (initialAnalysisMode) setAnalysisMode(initialAnalysisMode);
  }, [initialAnalysisMode]);

  useEffect(() => {
    if (initialBaseMapMode) {
      setBaseMapMode(initialBaseMapMode === 'geographic' ? 'geographic' : 'satellite');
    }
  }, [initialBaseMapMode]);

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'settlement' | 'road' | 'bridge' | 'building' | 'polygon' | 'predictionZone';
    data: any;
  } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: data.event.center,
        zoom: data.event.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.control.attribution({
        position: 'bottomleft',
        prefix: 'OrbitalEye GIS Engine | © Copernicus Sentinel (ESA) | Esri World Imagery & Topo | OpenStreetMap',
      }).addTo(map);

      mapInstanceRef.current = map;

      map.on('click', (e) => {
        if (onUpstreamPointSelected) {
          onUpstreamPointSelected([e.latlng.lat, e.latlng.lng]);
        }
      });
    }

    return () => {};
  }, []);

  // Update center when dataset changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(data.event.center, data.event.zoom);
    }
  }, [data.event.id]);

  // Update Tile Layer (Base map) — Natural Light Geographic Topo or Global High-Res Satellite
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layersGroupRef.current.baseTile) {
      map.removeLayer(layersGroupRef.current.baseTile);
    }

    let tileUrl = '';
    let attribution = '';

    if (baseMapMode === 'geographic' || analysisMode === 'analysis_only') {
      // Natural light geographic basemap: shows terrain shading, valleys, roads, highways, rivers, and place names
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri World Topo, USGS, OpenStreetMap contributors';
    } else {
      // High-resolution global satellite imagery (Sentinel-1 SAR or Sentinel-2 Optical)
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Copernicus Sentinel (ESA) | Esri World Imagery';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution,
    });

    // Automatic fallback to OpenStreetMap if offline
    tileLayer.on('tileerror', () => {
      tileLayer.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    });

    tileLayer.addTo(map);
    layersGroupRef.current.baseTile = tileLayer;
  }, [baseMapMode, analysisMode]);

  // Render Georeferenced Calibrated Sentinel Raster Image Overlay
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous raster layers
    if (layersGroupRef.current.sentinelRaster) {
      map.removeLayer(layersGroupRef.current.sentinelRaster);
      delete layersGroupRef.current.sentinelRaster;
    }
    if (layersGroupRef.current.sentinelRasterBefore) {
      map.removeLayer(layersGroupRef.current.sentinelRasterBefore);
      delete layersGroupRef.current.sentinelRasterBefore;
    }

    // In analysis_only mode, raster layer is turned off so user sees clean topo vectors
    if (analysisMode === 'analysis_only') return;

    const bounds: L.LatLngBoundsExpression = [
      [data.event.aoiBounds[0], data.event.aoiBounds[1]],
      [data.event.aoiBounds[2], data.event.aoiBounds[3]],
    ];

    if (timeViewMode === 'compare' || isComparingBeforeAfter) {
      const beforeUrl = generateSentinelRasterUrl(satelliteType, 'before', data.event.id);
      const afterUrl = generateSentinelRasterUrl(satelliteType, 'after', data.event.id);

      const beforeOverlay = L.imageOverlay(beforeUrl, bounds, {
        opacity: 0.94,
        interactive: false,
        className: 'sentinel-raster-before',
      });
      const afterOverlay = L.imageOverlay(afterUrl, bounds, {
        opacity: 0.94,
        interactive: false,
        className: 'sentinel-raster-after',
      });

      beforeOverlay.addTo(map);
      afterOverlay.addTo(map);

      layersGroupRef.current.sentinelRasterBefore = beforeOverlay;
      layersGroupRef.current.sentinelRaster = afterOverlay;
    } else {
      const rasterUrl = generateSentinelRasterUrl(satelliteType, timeViewMode, data.event.id);
      const rasterOverlay = L.imageOverlay(rasterUrl, bounds, {
        opacity: 0.94,
        interactive: false,
        className: 'sentinel-raster-single',
      });
      rasterOverlay.addTo(map);
      layersGroupRef.current.sentinelRaster = rasterOverlay;
    }
  }, [satelliteType, timeViewMode, isComparingBeforeAfter, analysisMode, data.event.id, data.event.aoiBounds]);

  // Sync Before/After split clipping mask on the raster overlay and vector overlay pane
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const overlayPane = mapContainerRef.current.querySelector('.leaflet-overlay-pane') as HTMLElement;
    const afterRasterImg = mapContainerRef.current.querySelector('.sentinel-raster-after') as HTMLElement;
    const beforeRasterImg = mapContainerRef.current.querySelector('.sentinel-raster-before') as HTMLElement;

    if (isComparingBeforeAfter || timeViewMode === 'compare') {
      if (overlayPane) {
        overlayPane.style.clipPath = `polygon(${splitSliderPosition}% 0, 100% 0, 100% 100%, ${splitSliderPosition}% 100%)`;
      }
      if (afterRasterImg) {
        afterRasterImg.style.clipPath = `polygon(${splitSliderPosition}% 0, 100% 0, 100% 100%, ${splitSliderPosition}% 100%)`;
      }
      if (beforeRasterImg) {
        beforeRasterImg.style.clipPath = `polygon(0 0, ${splitSliderPosition}% 0, ${splitSliderPosition}% 100%, 0 100%)`;
      }
    } else {
      if (overlayPane) overlayPane.style.clipPath = '';
      if (afterRasterImg) afterRasterImg.style.clipPath = '';
      if (beforeRasterImg) beforeRasterImg.style.clipPath = '';
    }
  }, [splitSliderPosition, isComparingBeforeAfter, timeViewMode]);

  // Mouse / Touch handlers for full-map draggable divider
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingSlider(true);
  };

  const handleTouchStart = () => {
    setIsDraggingSlider(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSlider || !mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitSliderPosition(Math.round(pct));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingSlider || !mapContainerRef.current || e.touches.length === 0) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitSliderPosition(Math.round(pct));
  };

  const handleMouseUp = () => {
    setIsDraggingSlider(false);
  };

  // Redraw Geospatial Feature Layers (Flood, Roads, Bridges, Settlements, etc.)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clean up vector layers
    ['polygons', 'prediction', 'floodPath', 'roads', 'bridges', 'buildings', 'settlements'].forEach((key) => {
      if (layersGroupRef.current[key]) {
        map.removeLayer(layersGroupRef.current[key]);
        delete layersGroupRef.current[key];
      }
    });

    // In 'satellite_only' mode, all vector analysis layers are hidden so user can inspect raw imagery
    if (analysisMode === 'satellite_only') {
      return;
    }

    // 1. FLOOD & DEBRIS POLYGONS
    // When timeViewMode === 'before' (and not comparing), flood & debris are hidden to show pristine baseline!
    const polygonGroup = L.layerGroup();

    data.polygons.forEach((poly) => {
      // In BEFORE mode, flood extent hasn't occurred yet
      if (timeViewMode === 'before' && !isComparingBeforeAfter && (poly.type === 'flood' || poly.type === 'debris')) return;
      if (poly.type === 'flood' && !layersVisibility.floodExtent) return;
      if (poly.type === 'debris' && !layersVisibility.debrisExtent) return;
      if (poly.type === 'uncertain' && !layersVisibility.uncertainZones) return;
      if (poly.type === 'reference_emsr927' && !layersVisibility.emsr927Validation) return;

      let color = '#06b6d4';
      let fillColor = '#0891b2';
      let fillOpacity = 0.52 * satelliteOpacity;
      let dashArray: string | undefined = undefined;

      if (poly.type === 'debris') {
        color = '#f97316';
        fillColor = '#ea580c';
        fillOpacity = 0.58 * satelliteOpacity;
      } else if (poly.type === 'uncertain') {
        color = '#eab308';
        fillColor = '#ca8a04';
        fillOpacity = 0.35 * satelliteOpacity;
        dashArray = '5, 5';
      } else if (poly.type === 'reference_emsr927') {
        color = '#a855f7';
        fillColor = '#9333ea';
        fillOpacity = 0.25;
        dashArray = '4, 4';
      }

      const leafletPoly = L.polygon(poly.coordinates, {
        color,
        fillColor,
        fillOpacity,
        weight: poly.type === 'reference_emsr927' ? 2 : 2.5,
        dashArray,
      });

      leafletPoly.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedEntity({ type: 'polygon', data: poly });
      });

      leafletPoly.bindTooltip(
        poly.type === 'reference_emsr927'
          ? 'EMSR927 Validation Reference (NOT INPUT)'
          : `${poly.type.toUpperCase()}: ${(poly.confidence * 100).toFixed(0)}% confidence`,
        { permanent: false, direction: 'top', className: 'orbitaleye-map-tooltip' }
      );

      leafletPoly.addTo(polygonGroup);
    });

    if (layersVisibility.floodExtent || layersVisibility.debrisExtent || layersVisibility.uncertainZones || layersVisibility.emsr927Validation) {
      polygonGroup.addTo(map);
      layersGroupRef.current.polygons = polygonGroup;
    }

    // 2. FUTURE FLOOD PREDICTION RISK ZONES
    if (layersVisibility.futureRisk && data.prediction?.zones) {
      const predictionGroup = L.layerGroup();

      data.prediction.zones.forEach((zone) => {
        let color = '#ef4444';
        let fillColor = '#dc2626';
        let fillOpacity = 0.45 * satelliteOpacity;
        let dashArray: string | undefined = '4, 4';

        if (zone.riskLevel === 'Medium Risk') {
          color = '#f59e0b';
          fillColor = '#d97706';
          fillOpacity = 0.4 * satelliteOpacity;
        } else if (zone.riskLevel === 'Low Risk') {
          color = '#eab308';
          fillColor = '#ca8a04';
          fillOpacity = 0.3 * satelliteOpacity;
        } else if (zone.riskLevel === 'Uncertain') {
          color = '#a855f7';
          fillColor = '#7e22ce';
          fillOpacity = 0.25 * satelliteOpacity;
          dashArray = '6, 6';
        }

        const riskPoly = L.polygon(zone.coordinates, {
          color,
          fillColor,
          fillOpacity,
          weight: 2,
          dashArray,
        });

        riskPoly.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedEntity({ type: 'predictionZone', data: zone });
        });

        riskPoly.bindTooltip(
          `MODELED ${zone.riskLevel.toUpperCase()} (+${zone.timeHorizonHours}h): ${zone.estimatedAreaKm2} km²`,
          { permanent: false, className: 'orbitaleye-map-tooltip' }
        );

        riskPoly.addTo(predictionGroup);
      });

      predictionGroup.addTo(map);
      layersGroupRef.current.prediction = predictionGroup;
    }

    // 3. FLOOD PATH / RIVER VALLEY TRACE
    if (layersVisibility.floodPath && data.floodPath?.pathCoordinates) {
      const pathGroup = L.layerGroup();
      const valleyLine = L.polyline(data.floodPath.pathCoordinates, {
        color: '#38bdf8',
        weight: 3.5,
        opacity: 0.8,
        dashArray: '8, 6',
      });
      valleyLine.bindTooltip('Modeled Valley Bottom Axis (DEM Trace)', {
        permanent: false,
        className: 'orbitaleye-map-tooltip',
      });
      valleyLine.addTo(pathGroup);
      pathGroup.addTo(map);
      layersGroupRef.current.floodPath = pathGroup;
    }

    // 4. ROADS
    if (layersVisibility.roads) {
      const roadGroup = L.layerGroup();
      data.infrastructure.roads.forEach((road) => {
        const isDisrupted = road.impactStatus === 'Affected' || road.impactStatus === 'Potentially affected';
        const color = isDisrupted ? '#ef4444' : '#10b981';

        const roadLine = L.polyline(road.coordinates, {
          color,
          weight: isDisrupted ? 3.5 : 2,
          opacity: 0.85,
          dashArray: isDisrupted ? '6, 4' : undefined,
        });

        roadLine.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedEntity({ type: 'road', data: road });
        });

        roadLine.bindTooltip(`${road.name} (${road.impactStatus})`, {
          permanent: false,
          className: 'orbitaleye-map-tooltip',
        });

        roadLine.addTo(roadGroup);
      });
      roadGroup.addTo(map);
      layersGroupRef.current.roads = roadGroup;
    }

    // 5. BRIDGES
    if (layersVisibility.bridges) {
      const bridgeGroup = L.layerGroup();
      data.infrastructure.bridges.forEach((bridge) => {
        const isAffected = bridge.impactStatus === 'Potentially affected' || bridge.impactStatus === 'Affected';
        const bridgeIcon = L.divIcon({
          className: 'custom-bridge-icon',
          html: `
            <div class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 border shadow-md ${
              isAffected
                ? 'bg-rose-950/90 text-rose-300 border-rose-500 ring-2 ring-rose-500/30'
                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
            }">
              <span>☲</span>
              <span>${bridge.name.split(' ')[0]}</span>
            </div>
          `,
          iconSize: [70, 20],
          iconAnchor: [35, 10],
        });

        const marker = L.marker(bridge.coordinates, { icon: bridgeIcon });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedEntity({ type: 'bridge', data: bridge });
        });

        marker.addTo(bridgeGroup);
      });
      bridgeGroup.addTo(map);
      layersGroupRef.current.bridges = bridgeGroup;
    }

    // 6. BUILDINGS
    if (layersVisibility.buildings) {
      const bldgGroup = L.layerGroup();
      data.infrastructure.buildings.forEach((bldg) => {
        const isAffected = bldg.impactStatus === 'Potentially affected' || bldg.impactStatus === 'Affected';
        const color = isAffected ? '#ef4444' : '#10b981';

        const circle = L.circleMarker(bldg.coordinates, {
          radius: 5,
          color,
          fillColor: color,
          fillOpacity: 0.8,
          weight: 1.5,
        });

        circle.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedEntity({ type: 'building', data: bldg });
        });

        circle.bindTooltip(`${bldg.name || 'Building'} (${bldg.impactStatus})`, {
          permanent: false,
          className: 'orbitaleye-map-tooltip',
        });

        circle.addTo(bldgGroup);
      });
      bldgGroup.addTo(map);
      layersGroupRef.current.buildings = bldgGroup;
    }

    // 7. SETTLEMENTS
    if (layersVisibility.settlements) {
      const settlementGroup = L.layerGroup();

      data.settlements.forEach((settlement) => {
        let statusColor = 'bg-emerald-500 ring-emerald-500/30 text-white';
        let badgeColor = 'border-emerald-600 bg-emerald-950/80 text-emerald-200';

        if (settlement.connectivityStatus === 'POTENTIALLY CUT OFF') {
          statusColor = 'bg-rose-500 ring-rose-500/40 text-white animate-pulse';
          badgeColor = 'border-rose-600 bg-rose-950/90 text-rose-200';
        } else if (settlement.connectivityStatus === 'LIMITED') {
          statusColor = 'bg-amber-500 ring-amber-500/30 text-black';
          badgeColor = 'border-amber-600 bg-amber-950/80 text-amber-200';
        } else if (settlement.connectivityStatus === 'INSUFFICIENT DATA') {
          statusColor = 'bg-slate-500 ring-slate-500/30 text-white';
          badgeColor = 'border-slate-600 bg-slate-900/80 text-slate-300';
        }

        const isTown = settlement.type === 'Town';
        const isHospital = settlement.type === 'Hospital';
        const isSelected = selectedSettlementId === settlement.id;

        const settlementIcon = L.divIcon({
          className: 'custom-settlement-icon',
          html: `
            <div class="cursor-pointer transition-transform duration-200 hover:scale-110 flex flex-col items-center ${
              isSelected ? 'scale-125 z-50' : ''
            }">
              <div class="flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-sans font-medium whitespace-nowrap shadow-lg ${badgeColor} ${
                isSelected ? 'ring-2 ring-cyan-400' : ''
              }">
                <span class="w-2 h-2 rounded-full ring-2 ${statusColor}"></span>
                <span>${isHospital ? '🏥 ' : isTown ? '🏛 ' : ''}${settlement.name}</span>
              </div>
              <span class="text-[9px] font-mono uppercase tracking-wider text-slate-400 mt-0.5">
                ${settlement.elevationMeters}m
              </span>
            </div>
          `,
          iconSize: [110, 36],
          iconAnchor: [55, 18],
        });

        const marker = L.marker(settlement.coordinates, { icon: settlementIcon });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedEntity({ type: 'settlement', data: settlement });
          if (onSelectSettlement) {
            onSelectSettlement(settlement);
          }
        });

        marker.addTo(settlementGroup);
      });

      settlementGroup.addTo(map);
      layersGroupRef.current.settlements = settlementGroup;
    }
  }, [layersVisibility, satelliteOpacity, data, selectedSettlementId, satelliteType, timeViewMode, isComparingBeforeAfter, splitSliderPosition, analysisMode]);

  // Handlers that notify parent if callbacks are provided
  const handleSetSatelliteType = (type: 'Sentinel-1 SAR' | 'Sentinel-2 Optical') => {
    setSatelliteType(type);
    setBaseMapMode('satellite');
    if (onSatelliteTypeChange) onSatelliteTypeChange(type);
  };

  const handleSetTimeViewMode = (mode: 'after' | 'before' | 'compare') => {
    setTimeViewMode(mode);
    setIsComparingBeforeAfter(mode === 'compare');
    if (onTimeViewModeChange) onTimeViewModeChange(mode);
  };

  const handleSetAnalysisMode = (mode: 'satellite_only' | 'satellite_analysis' | 'analysis_only') => {
    setAnalysisMode(mode);
    if (mode === 'analysis_only') {
      setBaseMapMode('geographic');
    } else {
      setBaseMapMode('satellite');
    }
    if (onAnalysisModeChange) onAnalysisModeChange(mode);
  };

  const mapFilterClass =
    baseMapMode === 'geographic' || analysisMode === 'analysis_only'
      ? 'geographic-topo-layer'
      : satelliteType === 'Sentinel-1 SAR'
      ? 'sar-radar-layer'
      : 'optical-layer';

  // Get current metadata
  const metadata = getSatelliteSceneMetadata(
    satelliteType,
    timeViewMode,
    data.event.name,
    data.event.baselineDate,
    data.event.eventDate,
    data.satellite.preEventTimestamp,
    data.satellite.postEventTimestamp,
    data.satellite.orbitTrack,
    'DEMO'
  );

  return (
    <div
      className={`relative w-full h-full bg-[#07090e] overflow-hidden select-none ${mapFilterClass}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Leaflet Map DOM Container - fills 100% of viewport with satellite imagery or geographic topo */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Full-Map Draggable Before/After Swipe Divider Line & Handle */}
      {(isComparingBeforeAfter || timeViewMode === 'compare') && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
          {/* Glowing vertical divider line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,1)] pointer-events-auto cursor-ew-resize z-40 transition-none"
            style={{ left: `${splitSliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* Center Draggable Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.9)] hover:scale-110 active:scale-95 transition-transform cursor-ew-resize">
              ⇄
            </div>
          </div>

          {/* Top floating labels */}
          <div
            className="absolute top-4 pointer-events-none -translate-x-1/2 flex items-center gap-3 text-xs font-mono font-bold"
            style={{ left: `${splitSliderPosition}%` }}
          >
            <span className="px-3 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-cyan-300 shadow-xl whitespace-nowrap -translate-x-full">
              ◀ BEFORE ({data.event.baselineDate})
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-rose-300 shadow-xl whitespace-nowrap">
              AFTER ({data.event.eventDate}) ▶
            </span>
          </div>
        </div>
      )}

      {/* Before/After Split Comparison Overlay Header */}
      {(isComparingBeforeAfter || timeViewMode === 'compare') && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-950/95 backdrop-blur-md border border-cyan-800/80 rounded-xl px-5 py-2 flex items-center gap-4 text-xs font-mono shadow-[0_0_25px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>PRE-EVENT: {data.event.baselineDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">SWIPE:</span>
            <input
              type="range"
              min={5}
              max={95}
              value={splitSliderPosition}
              onChange={(e) => setSplitSliderPosition(Number(e.target.value))}
              className="w-40 accent-cyan-400 cursor-pointer"
            />
            <span className="text-[11px] font-bold text-cyan-300 w-8">{splitSliderPosition}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
            <span>POST-EVENT: {data.event.eventDate}</span>
          </div>
          <button
            onClick={() => handleSetTimeViewMode('after')}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 text-[11px]"
          >
            Exit Compare
          </button>
        </div>
      )}

      {/* Top Left Floating Satellite Mission Control & Metadata HUD */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 max-w-md">
        {/* Core Satellite Scene Status Card */}
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2">
          {/* Header & Status Indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[200px]">
                {data.event.name}
              </span>
            </div>
            {/* Live / Demo Satellite Data Indicator (Requirement 7) */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800 text-[9px] font-mono text-amber-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>{metadata.sourceStatus}</span>
            </div>
          </div>

          {/* SATELLITE IMAGERY CONTROL (Requirement 3) */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1.5 flex items-center justify-between">
              <span>SATELLITE IMAGERY</span>
              <span className="text-slate-400 text-[9px] font-semibold">COPERNICUS ENGINE</span>
            </div>

            {/* Sensor Selection: Sentinel-1 SAR vs Sentinel-2 Optical */}
            <div className="grid grid-cols-2 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 mb-2">
              <button
                onClick={() => handleSetSatelliteType('Sentinel-1 SAR')}
                className={`py-1.5 px-2 text-center rounded text-xs font-mono font-semibold transition-all ${
                  satelliteType === 'Sentinel-1 SAR'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                SENTINEL-1 SAR
              </button>
              <button
                onClick={() => handleSetSatelliteType('Sentinel-2 Optical')}
                className={`py-1.5 px-2 text-center rounded text-xs font-mono font-semibold transition-all ${
                  satelliteType === 'Sentinel-2 Optical'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                SENTINEL-2 OPTICAL
              </button>
            </div>

            {/* Temporal Stage Selection: BEFORE EVENT | AFTER EVENT | COMPARE (Requirement 4 & 5) */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 mb-2 text-xs font-mono">
              <button
                onClick={() => handleSetTimeViewMode('before')}
                className={`flex-1 py-1 px-1.5 text-center rounded transition-all ${
                  timeViewMode === 'before' && !isComparingBeforeAfter
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BEFORE
              </button>
              <button
                onClick={() => handleSetTimeViewMode('after')}
                className={`flex-1 py-1 px-1.5 text-center rounded transition-all ${
                  timeViewMode === 'after' && !isComparingBeforeAfter
                    ? 'bg-slate-800 text-rose-300 font-bold border border-rose-800'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AFTER
              </button>
              <button
                onClick={() => handleSetTimeViewMode('compare')}
                className={`flex-1 py-1 px-1.5 text-center rounded transition-all ${
                  timeViewMode === 'compare' || isComparingBeforeAfter
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                COMPARE
              </button>
            </div>

            {/* Operational Analysis Connection Toggle (Requirement 6) */}
            <div className="mb-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span>ANALYSIS CONNECTION</span>
                <span className="text-[9px] text-cyan-400">REQ 6</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => handleSetAnalysisMode('satellite_only')}
                  className={`py-1 px-1 text-center rounded transition-all font-semibold ${
                    analysisMode === 'satellite_only'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Hide analytical vectors to inspect raw satellite scene"
                >
                  SATELLITE ONLY
                </button>
                <button
                  onClick={() => handleSetAnalysisMode('satellite_analysis')}
                  className={`py-1 px-1 text-center rounded transition-all font-semibold ${
                    analysisMode === 'satellite_analysis'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Display analytical flood & damage vectors overlaid on satellite scene"
                >
                  SATELLITE + ANALYSIS
                </button>
                <button
                  onClick={() => handleSetAnalysisMode('analysis_only')}
                  className={`py-1 px-1 text-center rounded transition-all font-semibold ${
                    analysisMode === 'analysis_only'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Display analytical vectors over clean light topographic map"
                >
                  ANALYSIS ONLY
                </button>
              </div>
            </div>

            {/* Detailed Satellite Metadata Display (Requirements 4, 5, 7) */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] font-mono space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Sensor Platform:</span>
                <span className="text-cyan-400 font-semibold">{metadata.platform}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Acquisition:</span>
                <span className="text-slate-200">{metadata.acquisitionTimestamp}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Processing Level:</span>
                <span className="text-slate-200">{metadata.statusLabel}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Geometry / Orbit:</span>
                <span className="text-slate-200">{metadata.orbitTrack}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Polarization / Bands:</span>
                <span className="text-emerald-400">{metadata.polarizationOrBands}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Ground Resolution:</span>
                <span className="text-slate-200">{metadata.resolutionMeters}m per pixel</span>
              </div>
              {satelliteType === 'Sentinel-2 Optical' && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500">Cloud Coverage:</span>
                  <span className={metadata.cloudCoverPct && metadata.cloudCoverPct > 50 ? 'text-amber-400' : 'text-emerald-400'}>
                    {metadata.cloudCoverPct}% {metadata.cloudCoverPct && metadata.cloudCoverPct > 50 ? '(Monsoon Occlusion)' : '(Usable)'}
                  </span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                Source: {metadata.sourceCitation}
              </div>
            </div>
          </div>

          {/* Basemap & Opacity controls */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setBaseMapMode(baseMapMode === 'geographic' ? 'satellite' : 'geographic')}
              className="flex-1 px-2.5 py-1 rounded text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 font-medium transition-colors border border-slate-800 text-[11px]"
            >
              {baseMapMode === 'geographic' ? '🛰 Switch to Satellite Base' : '🗺 Switch to Topo Base'}
            </button>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <span>OPACITY:</span>
              <input
                type="range"
                min={20}
                max={100}
                value={Math.round(satelliteOpacity * 100)}
                onChange={(e) => setSatelliteOpacity(Number(e.target.value) / 100)}
                className="w-16 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Right Floating Layer Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        <div className="bg-slate-950/95 backdrop-blur border border-slate-800 rounded-lg p-3 shadow-2xl text-xs w-64 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Geospatial Layers
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Toggles</span>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {/* Modeled Future Flood Risk */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer bg-red-950/20 border border-red-900/40">
              <span className="flex items-center gap-2 text-rose-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
                Modeled Future Risk
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.futureRisk}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, futureRisk: e.target.checked })}
                className="accent-red-500 cursor-pointer"
              />
            </label>

            {/* Flood Extent */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
                Detected Flood Area
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.floodExtent}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, floodExtent: e.target.checked })}
                className="accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Debris / Sediment */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
                Debris / Sediment Mask
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.debrisExtent}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, debrisExtent: e.target.checked })}
                className="accent-orange-500 cursor-pointer"
              />
            </label>

            {/* Uncertain / Shadow */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm border border-yellow-500 bg-yellow-500/20"></span>
                Uncertain / Shadow Zones
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.uncertainZones}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, uncertainZones: e.target.checked })}
                className="accent-yellow-500 cursor-pointer"
              />
            </label>

            {/* Roads */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-1 bg-rose-500"></span>
                Pre-Event Road Graph
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.roads}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, roads: e.target.checked })}
                className="accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Bridges */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="text-[10px] font-mono text-cyan-400">☲</span>
                Bridges & Crossings
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.bridges}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, bridges: e.target.checked })}
                className="accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Settlements */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Cut-Off Settlements
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.settlements}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, settlements: e.target.checked })}
                className="accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Buildings */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-sm bg-slate-400"></span>
                OSM Buildings
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.buildings}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, buildings: e.target.checked })}
                className="accent-cyan-500 cursor-pointer"
              />
            </label>

            {/* Flood Path */}
            <label className="flex items-center justify-between hover:bg-slate-900/60 p-1 rounded cursor-pointer">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-0.5 border-t border-dashed border-sky-400"></span>
                Modeled Valley Trace (DEM)
              </span>
              <input
                type="checkbox"
                checked={layersVisibility.floodPath}
                onChange={(e) => setLayersVisibility({ ...layersVisibility, floodPath: e.target.checked })}
                className="accent-sky-400 cursor-pointer"
              />
            </label>

            {/* Copernicus EMS EMSR927 Reference Layer */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between hover:bg-purple-950/30 p-1 rounded cursor-pointer">
                <div className="flex flex-col">
                  <span className="flex items-center gap-1.5 text-purple-300 font-medium">
                    <span className="w-2 h-2 rounded-sm bg-purple-500"></span>
                    EMSR927 Validation Reference
                  </span>
                  <span className="text-[9px] text-purple-400/80">VALIDATION ONLY · NOT INPUT</span>
                </div>
                <input
                  type="checkbox"
                  checked={layersVisibility.emsr927Validation}
                  onChange={(e) => setLayersVisibility({ ...layersVisibility, emsr927Validation: e.target.checked })}
                  className="accent-purple-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Opacity Slider */}
          <div className="mt-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Mask Opacity</span>
              <span className="font-mono">{Math.round(satelliteOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={satelliteOpacity}
              onChange={(e) => setSatelliteOpacity(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-800 rounded"
            />
          </div>
        </div>

        {/* Scientific Map Legend */}
        <div className="bg-slate-950/95 backdrop-blur border border-slate-800 rounded-lg p-2.5 text-[11px] shadow-2xl w-64">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
            Status Legend
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Potentially Cut Off</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span>
              <span>Predicted High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
              <span>Predicted Med Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-rose-500"></span>
              <span>Road Submerged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500"></span>
              <span>Road Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
              <span>Detected Flood</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span>
              <span>Debris Flow</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Entity Inspector Card */}
      {selectedEntity && (
        <div className="absolute bottom-6 right-6 z-30 max-w-sm w-full bg-slate-950/95 backdrop-blur-md border border-cyan-500/60 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between border-b border-slate-800 pb-2 mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                {selectedEntity.type} Inspector
              </span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {selectedEntity.data.name || selectedEntity.data.id || 'Selected Asset'}
              </h4>
            </div>
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {selectedEntity.type === 'settlement' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-semibold font-mono ${
                      selectedEntity.data.connectivityStatus === 'POTENTIALLY CUT OFF'
                        ? 'text-rose-400'
                        : selectedEntity.data.connectivityStatus === 'LIMITED'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedEntity.data.connectivityStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Elevation:</span>
                  <span className="font-mono text-slate-200">{selectedEntity.data.elevationMeters} m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Population:</span>
                  <span className="font-mono text-slate-200">{selectedEntity.data.populationEst.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Isolation Risk:</span>
                  <span className="font-mono text-rose-300 font-bold">{selectedEntity.data.isolationRiskScore} / 100</span>
                </div>
                <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <div className="font-semibold text-cyan-400 mb-0.5">Hydrological Evidence:</div>
                  <p>{selectedEntity.data.reasoning}</p>
                </div>
              </>
            )}

            {selectedEntity.type === 'road' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Road Class:</span>
                  <span className="text-slate-200 font-medium">{selectedEntity.data.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Impact Status:</span>
                  <span
                    className={`font-semibold font-mono ${
                      selectedEntity.data.impactStatus === 'Cut off / Submerged'
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {selectedEntity.data.impactStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Length Affected:</span>
                  <span className="font-mono text-rose-300">{selectedEntity.data.affectedLengthKm} km</span>
                </div>
                <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <div className="font-semibold text-cyan-400 mb-0.5">Verification Notes:</div>
                  <p>{selectedEntity.data.notes}</p>
                </div>
              </>
            )}

            {selectedEntity.type === 'bridge' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">River Spanned:</span>
                  <span className="text-slate-200 font-medium">{selectedEntity.data.riverName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Carrying Road:</span>
                  <span className="text-slate-200">{selectedEntity.data.roadConnected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Distance to Flood:</span>
                  <span className="font-mono text-rose-400">{selectedEntity.data.floodProximityM} m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Priority:</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-mono text-[10px]">
                    {selectedEntity.data.verificationPriority}
                  </span>
                </div>
                <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <div className="font-semibold text-amber-400 mb-0.5">Field Inspection Required:</div>
                  <p>{selectedEntity.data.evidence}</p>
                </div>
              </>
            )}

            {selectedEntity.type === 'polygon' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Polygon ID:</span>
                  <span className="font-mono text-slate-300">{selectedEntity.data.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Classification:</span>
                  <span className="uppercase font-semibold text-cyan-400">{selectedEntity.data.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Model Confidence:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {(selectedEntity.data.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <div className="font-semibold text-slate-200 mb-0.5">Detection Basis:</div>
                  <p>{selectedEntity.data.notes}</p>
                </div>
              </>
            )}

            {selectedEntity.type === 'predictionZone' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Zone Name:</span>
                  <span className="font-mono font-medium text-slate-200">{selectedEntity.data.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Modeled Risk:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                    selectedEntity.data.riskLevel === 'High Risk'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedEntity.data.riskLevel === 'Medium Risk'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : selectedEntity.data.riskLevel === 'Low Risk'
                      ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      : 'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {selectedEntity.data.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Forecast Horizon:</span>
                  <span className="font-mono text-cyan-300 font-bold">+{selectedEntity.data.timeHorizonHours} Hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estimated Inundation Area:</span>
                  <span className="font-mono text-slate-100 font-semibold">{selectedEntity.data.estimatedAreaKm2} km²</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Model Confidence:</span>
                  <span className="font-mono text-slate-300">{selectedEntity.data.confidence} CONFIDENCE</span>
                </div>
                {selectedEntity.data.drivingFactors && (
                  <div className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px]">
                    <div className="font-semibold text-cyan-400 mb-1">Key Hydrological Drivers:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {selectedEntity.data.drivingFactors.map((f: string, idx: number) => (
                        <li key={idx}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedEntity.data.affectedSettlements && selectedEntity.data.affectedSettlements.length > 0 && (
                  <div className="mt-2 text-[11px]">
                    <span className="text-slate-400 block font-medium">Exposed Settlements:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedEntity.data.affectedSettlements.map((s: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2 p-1.5 rounded bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300/80 leading-snug">
                  ⚠ Early-warning indicator based on catchment elevation & rainfall signals. Requires ground/hydrological validation.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
