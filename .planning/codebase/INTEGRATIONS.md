# External Integrations

**Analysis Date:** 2024-03-23

## APIs & External Services

**Browser API:**
- Web Audio API - Orchestrated via `tone`. Used for musical synthesis and time-accurate playback.
- IndexedDB - Managed via `localforage`. Used for local storage of parsed music data.
- RequestAnimationFrame - Driven by React and custom render loop (planned) for canvas visualization.

## Data Storage

**Databases:**
- Local Persistent Storage: `localforage` (wrapper for IndexedDB/LocalStorage).
- Client: `localforage` (^1.10.0).

**File Storage:**
- Local filesystem only: Application reads binary files (`.gp`, `.gpx`, etc.) provided by the user via file input or drag-and-drop.

**Caching:**
- Local browser cache for parsed song data (planned to be stored in IndexedDB to avoid re-parsing on every session).

## Authentication & Identity

**Auth Provider:**
- None detected. The application is a client-side utility tool with no server-side user management at this stage.

## Monitoring & Observability

**Error Tracking:**
- None detected. Planned top-level `ErrorBoundary` in React to catch parsing or UI crashes.

**Logs:**
- Console only. BiomeJS used for development linting.

## CI/CD & Deployment

**Hosting:**
- Static site hosting (compatible with Vite production build).

**CI Pipeline:**
- Build, lint, and test scripts are available in `package.json`. No specific CI YAML (GitHub Actions/GitLab CI) detected.

## Environment Configuration

**Required env vars:**
- Standard Vite configuration. No mandatory external API keys detected.

**Secrets location:**
- Not applicable (no external APIs).

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

---

*Integration audit: 2024-03-23*
