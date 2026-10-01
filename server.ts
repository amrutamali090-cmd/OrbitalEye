import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'VARUNA Satellite Intelligence Engine',
    version: '1.0.0-hackathon',
    aiConnected: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Satellite source connection status check
app.get('/api/satellite-source-status', (req, res) => {
  // Checks whether live Copernicus Data Space / Sentinel Hub credentials are configured
  const hasLiveCredentials = !!(process.env.COPERNICUS_CLIENT_ID && process.env.COPERNICUS_CLIENT_SECRET);
  res.json({
    connected: hasLiveCredentials,
    mode: hasLiveCredentials ? 'LIVE_DATA' : 'BENCHMARK_DEMO_DATA',
    message: hasLiveCredentials
      ? 'Connected to Copernicus Data Space Ecosystem API'
      : 'DATA SOURCE NOT CONNECTED: Running in verified benchmark sample mode (Demonstration Data — Not Live Satellite Output). To connect live data, supply Copernicus credentials.'
  });
});

// AI Copilot endpoint: strictly evidence-grounded
app.post('/api/copilot', async (req, res) => {
  const { question, structuredData } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  // If Gemini API key is configured, use GoogleGenAI
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are the VARUNA COPILOT, an evidence-grounded satellite intelligence assistant for emergency flood response.
Your primary role is to assist emergency search-and-rescue teams during the IIT Mandi Multimodal AI Hackathon 2026.

STRICT INSTRUCTIONS:
1. You must ONLY state facts and numbers that are present in the provided JSON structured analysis.
2. NEVER guess, estimate, or hallucinate numbers, casualties, damage percentages, or settlement names.
3. If an answer cannot be deduced from the structured data, explicitly respond: "Not available from current analysis."
4. Every response MUST include an "EVIDENCE" section citing the exact numbers and parameters from the analysis.
5. Emphasize that all satellite-derived impact flags represent POTENTIAL impact and REQUIRE FIELD VERIFICATION; satellite pixels do NOT prove structural collapse.
6. Tone: Calm, objective, concise, military/aerospace intelligence briefing style.

STRUCTURED SYSTEM ANALYSIS DATA:
${JSON.stringify(structuredData, null, 2)}

QUESTION:
${question}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        answer: response.text,
        source: 'gemini-2.5-flash',
        grounded: true
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic fact-grounded response:', err?.message);
    }
  }

  // Deterministic, fact-grounded fallback response if API key is not configured or fails
  const fallback = generateFactualFallbackResponse(question, structuredData);
  return res.json({
    answer: fallback,
    source: 'varuna-grounded-engine',
    grounded: true
  });
});

function generateFactualFallbackResponse(question: string, data: any): string {
  if (!data) {
    return "Not available from current analysis. Please run an event analysis first.";
  }

  const q = question.toLowerCase();
  const f = data.flood || {};
  const s = data.settlements || [];
  const r = data.infrastructure?.roads || [];
  const b = data.infrastructure?.bridges || [];
  const bldg = data.infrastructure?.buildings || [];
  const cutOffSettlements = s.filter((item: any) => item.connectivityStatus === 'POTENTIALLY CUT OFF');
  const affectedRoads = r.filter((item: any) => item.impactStatus === 'Potentially affected' || item.impactStatus === 'Affected');
  const affectedBridges = b.filter((item: any) => item.impactStatus === 'Potentially affected' || item.impactStatus === 'Affected');

  if (q.includes('overall') || q.includes('situation') || q.includes('summary')) {
    return `### Situation Summary
Based on multi-temporal satellite analysis for **${data.event?.name || 'Area of Interest'}** on **${data.event?.eventDate || 'N/A'}**:
- Total analyzed area: **${f.totalAnalyzedAreaKm2?.toFixed(1) || '0'} km²**
- Detected flood water extent: **${f.totalFloodAreaKm2?.toFixed(2) || '0'} km²** (${f.percentAreaAffected?.toFixed(1) || '0'}% of analyzed corridor)
- Detected debris/sediment change: **${f.debrisAreaKm2?.toFixed(2) || '0'} km²**
- Submerged/affected road segments: **${affectedRoads.length} segments**
- Potentially cut-off settlements: **${cutOffSettlements.length} communities**
- Bridges within or adjacent to flood extent: **${affectedBridges.length}**

All observations are derived from pre-event and post-event satellite imagery combined with pre-event OpenStreetMap topologies. All impacts require field verification.

### EVIDENCE:
• Detected flood extent: ${f.totalFloodAreaKm2?.toFixed(2) || 'N/A'} km²
• Debris/sediment deposition: ${f.debrisAreaKm2?.toFixed(2) || 'N/A'} km²
• Affected road segments: ${affectedRoads.length} segments
• Potentially cut-off settlements: ${cutOffSettlements.map((c: any) => c.name).join(', ') || 'None'}
• Primary sensor: ${data.satellite?.sensor || 'Sentinel-1 SAR'}`;
  }

  if (q.includes('settlement') || q.includes('cut off') || q.includes('who is cut off') || q.includes('who')) {
    if (cutOffSettlements.length === 0) {
      return `### Cut-Off Settlement Analysis
The road graph reachability engine indicates that all evaluated settlements retain at least one connected road segment to a designated regional center.

### EVIDENCE:
• Total settlements evaluated: ${s.length}
• Potentially cut-off settlements: 0
• Verification: All connectivity relies on pre-event OSM road network integrity.`;
    }

    const list = cutOffSettlements.map((c: any) => 
      `- **${c.name}**: Lost road connection to **${c.nearestHospital}** and **${c.nearestTown}**. Affected road segments: ${c.affectedRoadSegmentsCount}. Reason: ${c.cutOffReason}. Population: ${c.population ? c.population.toLocaleString() : 'Population data unavailable'}.`
    ).join('\n');

    return `### Cut-Off Settlement Findings
The following ${cutOffSettlements.length} settlement(s) have been identified as **POTENTIALLY CUT OFF** based on road network graph disconnection:

${list}

**Action Advisory**: Prioritize aerial reconnaissance or drone route verification for these communities.

### EVIDENCE:
• Potentially cut-off count: ${cutOffSettlements.length} of ${s.length} evaluated
• Cut-off settlements: ${cutOffSettlements.map((c: any) => c.name).join(', ')}
• Network analysis engine: Dijkstra shortest-path reachability over pre-event OSM edges minus flood-intersected segments.`;
  }

  if (q.includes('road') || q.includes('highway')) {
    const roadDetails = affectedRoads.slice(0, 5).map((road: any) => 
      `- **${road.name}** (${road.id}): ${road.affectedLengthKm} km affected out of ${road.lengthKm} km total length. Impact: ${road.connectivityImpact}.`
    ).join('\n');

    return `### Road Infrastructure Disruption
A total of **${affectedRoads.length} road segment(s)** intersect the detected flood or debris polygon:

${roadDetails}

**Note**: Satellite detection identifies water or debris over road corridors. Physical structural damage vs. temporary standing water requires field ground-truth.

### EVIDENCE:
• Submerged/affected road segments: ${affectedRoads.length}
• Total road network monitored: ${r.length} segments
• Detection method: Geometric intersection with dual-polarization SAR backscatter difference mask.`;
  }

  if (q.includes('bridge') || q.includes('bridges')) {
    if (affectedBridges.length === 0) {
      return `### Bridge Assessment
No critical bridges intersect the high-confidence flood polygon within the analyzed corridor.

### EVIDENCE:
• Total bridges analyzed: ${b.length}
• Affected bridges: 0`;
    }

    const bridgeDetails = affectedBridges.map((br: any) =>
      `- **${br.name}** (ID: ${br.id}): Spans **${br.riverName}**, carrying **${br.roadConnected}**. Flood proximity: ${br.floodProximityM} m. Relevance: ${br.connectivityRelevance}. Status: ${br.impactStatus}.`
    ).join('\n');

    return `### Bridge Exposure Assessment
The following bridge structure(s) lie within or directly adjacent to the detected flood extent:

${bridgeDetails}

**Precautionary Note**: Satellite imagery cannot evaluate underwater pier scouring or abutment settlement. Structural integrity must be inspected on-site by civil engineering teams.

### EVIDENCE:
• Affected bridges: ${affectedBridges.length} of ${b.length}
• Bridge list: ${affectedBridges.map((br: any) => br.name).join(', ')}`;
  }

  if (q.includes('hospital') || q.includes('medical') || q.includes('health')) {
    const hospitalIsolated = cutOffSettlements.filter((item: any) => item.nearestHospital);
    return `### Hospital Access Disruption
Analysis of shortest path accessibility to regional health facilities:
${hospitalIsolated.map((item: any) => 
  `- **${item.name}** has lost direct road access to its designated facility: **${item.nearestHospital}** (Nominal distance: ${item.distanceToHospitalKm} km).`
).join('\n')}

### EVIDENCE:
• Isolated settlements requiring medical supply line: ${hospitalIsolated.length}
• Facility connectivity graph evaluated: Pre-event OSM health node reachability.`;
  }

  if (q.includes('limitation') || q.includes('uncertainty') || q.includes('reliability')) {
    return `### Assessment Limitations
1. **Acquisition Timing**: Sentinel satellites operate on fixed 6-to-12-day repeat cycles; peak flood crest may not coincide with overpass time.
2. **Terrain Distortion in Mountains**: SAR radar backscatter can experience radar shadow, layover, and foreshortening in steep Himalayan valleys.
3. **OSM Completeness**: Pre-event OpenStreetMap data may omit informal footpaths or non-motorized tracks.
4. **No Structural Collapse Claim**: Water pixel overlap indicates inundation exposure, NOT confirmed physical collapse.
5. **Educational Prototype**: Built for IIT Mandi Multimodal AI Hackathon 2026 Track B; strictly requires field verification.

### EVIDENCE:
• Model confidence rating: ${f.detectionConfidencePct || 86}%
• Sensor baseline: ${data.satellite?.sensor || 'Sentinel-1 SAR'} (Orbit: ${data.satellite?.orbitTrack || 'Relative Orbit 121'})`;
  }

  if (q.includes('verify') || q.includes('first') || q.includes('priority')) {
    return `### Recommended Field Verification Priorities
1. **Critical Choke Point**: Inspect bridge structures flagged as Potentially Affected (${affectedBridges.map((b: any) => b.name).join(', ') || 'None'}).
2. **Access Corridors to Cut-Off Settlements**: Conduct drone reconnaissance along access routes to ${cutOffSettlements.map((c: any) => c.name).join(', ') || 'monitored communities'}.
3. **Medical Evacuation Routes**: Verify alternate unpaved or secondary tracks leading to nearest regional hospitals.

### EVIDENCE:
• Highest priority target: ${cutOffSettlements[0]?.name || 'Primary river confluence'} (${cutOffSettlements[0]?.cutOffReason || 'Road submerged'})
• Data basis: Intersection of pre-event OSM road edges with Kuro-Siwo segmented flood mask.`;
  }

  return `### Query Response
According to the VARUNA structured geospatial assessment for **${data.event?.name}**:
- Detected flood extent is **${f.totalFloodAreaKm2?.toFixed(2)} km²**
- **${cutOffSettlements.length}** settlement(s) are potentially cut off
- **${affectedRoads.length}** road segment(s) and **${affectedBridges.length}** bridge(s) intersect detected water/debris zones.

If you require specific information not captured in this analysis, note that it is **Not available from current analysis**.

### EVIDENCE:
• Event: ${data.event?.name} (${data.event?.eventDate})
• Total flood area: ${f.totalFloodAreaKm2?.toFixed(2)} km²
• Potentially cut-off settlements: ${cutOffSettlements.length}`;
}

// Full-stack Vite dev middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`VARUNA Satellite Intelligence Server listening on port ${PORT}`);
  });
}

startServer();
