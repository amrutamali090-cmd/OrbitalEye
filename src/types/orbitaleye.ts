export type SatelliteSource = 'Sentinel-1 SAR' | 'Sentinel-2 Optical' | 'Auto';

export type ProcessingMode = 'Flood Detection' | 'Damage Assessment' | 'Full Assessment';

export type ImpactStatus = 'Affected' | 'Potentially affected' | 'Not affected' | 'Uncertain';

export type ConnectivityStatus = 'CONNECTED' | 'POTENTIALLY CUT OFF' | 'LIMITED' | 'INSUFFICIENT DATA';

export interface EventMetadata {
  id: string;
  name: string;
  region: string;
  country: string;
  eventDate: string;
  baselineDate: string;
  aoiBounds: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
  center: [number, number];
  zoom: number;
  description: string;
  sourceMode: 'LIVE_DATA' | 'DEMO_DATA';
}

export interface SatelliteMetadata {
  sensor: string;
  platform: 'Sentinel-1A/B' | 'Sentinel-2A/B';
  orbitTrack: string;
  polarization: string;
  baselineDays: number;
  resolutionMeters: number;
  acquisitionGeometry: string;
  preEventTimestamp: string;
  postEventTimestamp: string;
  cloudCoverPct: number | null;
  radarBand: string;
}

export interface FloodStatistics {
  totalFloodAreaKm2: number;
  debrisAreaKm2: number;
  totalAnalyzedAreaKm2: number;
  percentAreaAffected: number;
  detectionConfidencePct: number;
  permanentWaterKm2: number;
  uncertainAreaKm2: number;
}

export interface BuildingFeature {
  id: string;
  osmId: string;
  name?: string;
  buildingType: string;
  coordinates: [number, number]; // [lat, lng]
  floodOverlapPct: number;
  distanceToFloodMeters: number;
  impactStatus: ImpactStatus;
  elevationMeters: number;
  verificationPriority: 'HIGH ATTENTION' | 'MEDIUM ATTENTION' | 'LOW';
  evidence: string;
}

export interface RoadSegment {
  id: string;
  osmWayId: string;
  name: string;
  highwayClass: string;
  coordinates: [number, number][]; // polyline points
  lengthKm: number;
  affectedLengthKm: number;
  impactStatus: ImpactStatus;
  connectivityImpact: string;
  bridgeAssociated?: string;
  evidence: string;
}

export interface BridgeFeature {
  id: string;
  osmId: string;
  name: string;
  riverName: string;
  roadConnected: string;
  coordinates: [number, number];
  floodProximityM: number;
  impactStatus: ImpactStatus;
  connectivityRelevance: 'Critical' | 'Major' | 'Secondary';
  verificationPriority: 'HIGH ATTENTION' | 'MEDIUM ATTENTION' | 'LOW';
  evidence: string;
}

export interface SettlementNode {
  id: string;
  name: string;
  type: 'Settlement' | 'Town' | 'Hospital' | 'Health Post';
  coordinates: [number, number];
  elevationMeters: number;
  population: number | null; // null if not legitimately in pre-event OSM/census
  populationSource: string;
  connectivityStatus: ConnectivityStatus;
  nearestTown: string;
  distanceToTownKm: number;
  nearestHospital: string;
  distanceToHospitalKm: number;
  affectedRoadSegmentsCount: number;
  alternateRoute: 'Available' | 'Not identified' | 'Uncertain';
  cutOffReason: string;
  verificationPriority: 'HIGH ATTENTION' | 'MEDIUM ATTENTION' | 'MONITORING';
  evidence: string[];
}

export interface FloodPolygon {
  id: string;
  type: 'flood' | 'debris' | 'uncertain' | 'reference_emsr927';
  coordinates: [number, number][];
  confidence: number;
  depthEstimateMeters?: number;
  notes: string;
}

export interface DownstreamFloodPath {
  upstreamPoint: [number, number];
  upstreamElevationM: number;
  pathCoordinates: [number, number][];
  modeledLengthKm: number;
  valleyAverageSlopeDeg: number;
  exposedSettlements: { name: string; downstreamKm: number; elevationDeltaM: number; risk: string }[];
  exposedRoads: { name: string; roadClass: string; intersectKm: number }[];
  exposedBridges: { name: string; river: string; intersectKm: number }[];
  disclaimer: string;
}

export interface ProvenanceItem {
  source: string;
  dataType: string;
  date: string;
  role: string;
  status: 'ALLOWED' | 'PROHIBITED AS INPUT' | 'REFERENCE ONLY';
  notes: string;
}

export interface ModelInformation {
  name: string;
  architecture: string;
  trainingDataset: string;
  secondaryDataset: string;
  inputBands: string[];
  outputClasses: string[];
  limitations: string[];
  evaluationStatus: string;
  benchmarkMetrics: {
    dataset: string;
    iou: number;
    f1Score: number;
    precision: number;
    recall: number;
  };
}

export interface FutureRiskZone {
  id: string;
  name: string;
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Uncertain';
  coordinates: [number, number][];
  estimatedAreaKm2: number;
  timeHorizonHours: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  supportingFactors: string[];
  nearbySettlements: string[];
  nearbyRoads: string[];
  nearbyBridges: string[];
  limitations: string;
}

export interface FutureFloodPrediction {
  currentFloodExtentKm2: number;
  upstreamRainfallMm24h: number;
  rainfallIntensityMmPerHour: number;
  cumulativeRainfall48hMm: number;
  riverWaterLevelStatus: string;
  terrainSlopeProfile: string;
  predictedRiskAreaKm2: number;
  highRiskAreaKm2: number;
  mediumRiskAreaKm2: number;
  lowRiskAreaKm2: number;
  atRiskSettlementsCount: number;
  atRiskRoadSegmentsCount: number;
  atRiskBridgesCount: number;
  forecastWindow: string;
  confidenceLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidenceRationale: string;
  zones: FutureRiskZone[];
  atRiskSettlements: {
    name: string;
    riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Uncertain';
    estimatedArrivalTimeHours: number;
    potentialCutOff: boolean;
    hospitalAccessVulnerability: string;
  }[];
  atRiskRoads: {
    name: string;
    highwayClass: string;
    vulnerableLengthKm: number;
    riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Uncertain';
  }[];
  atRiskBridges: {
    name: string;
    river: string;
    freeboardMarginM: number;
    riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Uncertain';
  }[];
  disclaimer: string;
}

export interface SentinelImageryConfig {
  sentinel1: {
    beforeDate: string;
    afterDate: string;
    sensor: string;
    orbitTrack: string;
    geometry: string;
    resolution: string;
    polarization: string;
    comparisonIntervalDays: number;
    status: 'LIVE' | 'DEMO';
    tileUrlPattern?: string;
  };
  sentinel2: {
    beforeDate: string;
    afterDate: string;
    sensor: string;
    cloudCoverBeforePct: number;
    cloudCoverAfterPct: number;
    resolution: string;
    bands: string[];
    status: 'LIVE' | 'DEMO';
    tileUrlPattern?: string;
  };
}

export interface StructuredAnalysisResult {
  event: EventMetadata;
  satellite: SatelliteMetadata;
  flood: FloodStatistics;
  infrastructure: {
    buildings: BuildingFeature[];
    roads: RoadSegment[];
    bridges: BridgeFeature[];
  };
  settlements: SettlementNode[];
  polygons: FloodPolygon[];
  floodPath: DownstreamFloodPath;
  prediction?: FutureFloodPrediction;
  sentinelImagery?: SentinelImageryConfig;
  dataProvenance: ProvenanceItem[];
  modelInfo: ModelInformation;
  validationReference?: {
    activationId: string;
    productName: string;
    validationOnly: boolean;
    spatialAgreementIoU: number;
    precision: number;
    recall: number;
    disclaimer: string;
  };
  limitations: string[];
}
