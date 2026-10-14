# OrbitalEye
### Satellite Intelligence for Flood Response

OrbitalEye is a satellite-based flood-response intelligence prototype designed to help emergency responders understand flood-affected areas, assess potentially exposed infrastructure, identify settlements with disrupted road connectivity, and generate evidence-based situation reports.

The project combines satellite imagery, geospatial analysis, infrastructure mapping, terrain information, and AI-assisted reporting to support disaster-response decision-making.

## The Problem

During severe floods and Himalayan flash floods, roads, bridges, and communication networks can become inaccessible. Emergency responders need reliable geographic information to understand the potential impact, identify isolated communities, and support response planning.

Traditional ground-based assessments can be delayed when affected areas are difficult to reach. Satellite observations and geographic information systems can help provide an initial overview of potentially affected regions.

## Our Solution

OrbitalEye aims to bring satellite-based flood analysis and response intelligence into a unified dashboard. It is designed to support the following workflow:

**SEE → ASSESS → CONNECT → EXPLAIN → REPORT → TRACE**

- **See:** Examine satellite observations of the study area.
- **Assess:** Identify potential flood-affected areas and exposed infrastructure.
- **Connect:** Analyse road-network connectivity to identify potentially isolated settlements.
- **Explain:** Present evidence supporting the analysis.
- **Report:** Prepare concise, evidence-grounded situation reports.
- **Trace:** Explore potential downstream flood paths using terrain information.

## Key Features

### 1. Satellite-Based Flood Mapping

Analyse suitable pre-event and post-event satellite imagery to identify potential flood or debris-affected areas.

The intended data sources are Copernicus Sentinel-1 radar imagery and Sentinel-2 optical imagery, subject to data availability and integration.

### 2. Infrastructure Exposure Assessment

Overlay pre-event OpenStreetMap infrastructure data to estimate which buildings, roads, and bridges may intersect mapped flood-affected areas.

Spatial overlap indicates potential exposure and does not independently confirm structural damage.

### 3. Cut-Off Settlement Analysis

Use road-network connectivity to identify settlements that may have lost a connected route to nearby towns or hospitals under the selected disruption assumptions.

The results depend on the completeness of the road network and the availability of reliable information about disrupted roads.

### 4. AI Situation Report Copilot

The intended AI-assisted reporting component helps summarise mapped findings and prepare concise situation reports for response planning.

Numerical claims in generated reports should be grounded in the system's computed outputs. Unsupported values must not be presented as verified facts.

### 5. Flood-Path Tracing

Explore potential downstream paths from an upstream location using elevation and terrain data, where this functionality and its required datasets are available.

Terrain-based tracing is an analytical approximation and should not be interpreted as a complete hydraulic flood simulation.

### 6. Future Flood-Risk Exploration

OrbitalEye's concept also supports exploring potential future-risk zones using available terrain, rainfall, water-level, and satellite-derived information. Any such outputs must be clearly labelled as modelled estimates, not guaranteed forecasts.

## Technology Stack

- **Frontend:** React, TypeScript, and Vite.
- **Mapping and visualisation:** Interactive geospatial mapping; the specific mapping library is not documented here.
- **Backend:** Backend implementation is not specified here.
- **Satellite data:** Copernicus Sentinel-1 and Sentinel-2, where integrated and available.
- **Terrain data:** Copernicus DEM, where integrated.
- **Infrastructure data:** OpenStreetMap, using pre-event data where available.
- **AI component:** AI-assisted situation reporting is part of the project design; the specific model and API integration are not documented here.

## Trishuli Flood Case Study — August 2026

OrbitalEye includes a case-study focus on the August 2026 Trishuli flood in Nepal. The objective is to examine independently generated satellite-based flood-analysis outputs and compare them with official reference products from the Copernicus Emergency Management Service (EMSR927).

The case study is intended to examine:

- Potential flood- and debris-affected areas.
- Potentially exposed buildings, roads, and bridges.
- Road-network connectivity and potentially isolated settlements.
- Agreement and differences between OrbitalEye outputs and comparable official reference information.

**Comparison status:** In progress. The comparison with official EMSR927 reference products has not yet been documented as complete.

**Results:** No quantitative accuracy metrics or verified comparison findings are reported in this README. These will be established only after independent OrbitalEye outputs have been generated and compared with the reference products.

**Validation rule:** EMSR927 products are reserved for validation and comparison. They must not be used as inputs to generate OrbitalEye's flood or damage-analysis results.

## Data Sources and Responsible Use

### Copernicus Sentinel

Sentinel-1 radar and Sentinel-2 optical observations are intended for satellite-based flood analysis, subject to availability, acquisition dates, preprocessing, and actual integration.

### Copernicus DEM

Elevation data may support terrain analysis and downstream-path exploration where the dataset is integrated.

### OpenStreetMap

OpenStreetMap provides geographic features such as buildings, roads, and bridges. Pre-event data should be used for the case study to avoid introducing post-event edits into the analysis.

### Training and Validation Data

Any training datasets used by the project must be documented with their original citations and licence terms. Official damage-assessment products are reserved for independent validation where required by the challenge rules.

## Methodology Overview

The intended analytical workflow is:

1. Define the study area and flood-event date.
2. Obtain suitable pre-event and post-event satellite observations.
3. Prepare and analyse imagery to identify potential flood-affected areas.
4. Overlay pre-event infrastructure data to estimate potentially exposed assets.
5. Analyse road-network connectivity to identify potentially isolated settlements.
6. Use terrain information for downstream-path exploration where supported.
7. Generate evidence-grounded summaries and situation reports from computed results.
8. Compare independently generated outputs with official reference products after the analysis is complete.

The actual implementation and availability of individual steps depend on the integrated data sources and software components.

## Evaluation and Validation

The Trishuli case study is intended to compare OrbitalEye's independently generated results with comparable EMSR927 reference information.

Where compatible geographic layers are available, evaluation may include spatial overlap, missed detections, additional detections, and differences in mapped infrastructure impacts. Quantitative metrics should be reported only when they can be computed from suitable, comparable datasets.

Differences may arise from satellite acquisition dates, cloud cover, terrain, resolution, data completeness, and differences in how flood impact is defined.

No accuracy score or performance result is claimed before the evaluation is completed.

## Limitations

- Optical satellite imagery may be affected by clouds.
- Radar interpretation can be challenging in mountainous terrain.
- Satellite observations may not be available immediately after an event.
- OpenStreetMap data may be incomplete or outdated.
- Spatial overlap with a flood extent does not prove that an asset is damaged.
- Road-network analysis depends on the completeness of the network and assumptions about road disruptions.
- Terrain-based flood-path tracing is not equivalent to a detailed hydraulic simulation.
- Future-risk estimates are uncertain and depend on the quality of available input data.
- AI-generated reports require verification against computed outputs and source data.

## Reproducibility

A reproducible evaluation should record the study-area boundary, satellite acquisition dates, preprocessing steps, analysis methods, dataset versions, software dependencies, and relevant configuration settings.

The project documentation should distinguish between observed satellite data, computed analytical results, modelled estimates, and independent validation data.

## Data Attribution

Where the corresponding datasets are used, include the required acknowledgements:

- Contains modified Copernicus Sentinel data 2026.
- Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.
- © OpenStreetMap contributors.

Training datasets and other third-party sources must also be cited according to their respective licences and attribution requirements.

## Project Status

OrbitalEye is a prototype for satellite-based flood-response intelligence. Its goal is to bring flood mapping, infrastructure exposure assessment, settlement connectivity analysis, and AI-assisted reporting into one workflow.

Features should be considered operational only when the corresponding functionality and data pipeline have been implemented and tested.

## Disclaimer

OrbitalEye is intended for educational and research purposes. It is not a substitute for official emergency-management systems, field verification, or decisions by qualified disaster-response authorities. Its outputs must be independently validated before any real-world operational use.
