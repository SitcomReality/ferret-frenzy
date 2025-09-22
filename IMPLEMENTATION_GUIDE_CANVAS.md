# Canvas Migration Guide: Whimsical Blob Racers and Dynamic Track

This guide explains how to migrate the current DOM-based track to an HTML5 Canvas renderer with adorable blobby racers, camera controls, optional 2.5D perspective, textured ground types, and contextual nameplates.

## Objectives

- Replace DOM lanes/segments with a performant canvas renderer.
- Render racers as squishy, cartoony blobs with outlines, eyes, and a rear-facing mouth that exhales to move.
- Procedurally generate a unique blob shape per racer (seeded by name and colors).
- Animate blob breathing (contract/expand) tied to inhale/exhale and race state.
- Contextual and hover-triggered nameplates anchored to racers.
- Camera with zoom, pan, and tracking modes (single racer, leaders, average pack, fit-all).
- Optional 2.5D perspective (racetrack shrinks toward horizon; z-sorted), easily toggleable.
- Textured ground segments per section/ground type.
- Maintain smooth frame rates and clean API integrations with existing game logic.

---

## Architecture Overview

Add the following modules (ESM, loaded in browser via script type="module"):

- CanvasRenderer.js
  - Owns the main canvas, orchestrates render loop, draws track, racers, particles, overlays.
- Camera.js
  - World-to-screen transforms, pan/zoom, tracking modes, damping.
- BlobFactory.js
  - Procedural blob shape generator (seeded), builds control points and per-racer draw routine.
- Nameplate.js
  - Computes and draws racer nameplates contextually; manages hover and culling.
- TextureManager.js
  - Loads ground textures as Image/Pattern per ground type; handles scaling/tiling.
- ParticleSystem.js
  - Mouth exhaust particles; manages pools and updates.
- HitTestIndex.js
  - Spatial index for pointer hover detection (simple grid or quadtree).
- RaceCanvasAdapter.js
  - Bridges existing gameState/currentRace to canvas modules (lifecycle hooks).

Feature flags (extend gameState.settings.render):

```javascript
gameState.settings.render = {
  enabled: true,
  usePerspective: true,
  skyImageUrl: '',          // Optional horizon sky
  devicePixelRatioAware: true,
  camera: {
    mode: 'leaders',        // 'single' | 'leaders' | 'average' | 'fitAll' | 'manual'
    singleRacerId: null,
    zoom: 1.0, minZoom: 0.5, maxZoom: 3.0,
    pan: { x: 0, y: 0 },
    damping: 0.15
  },
  nameplates: {
    showOnHover: true,
    showContextually: true
  },
  particles: {
    enabled: true,
    poolSize: 800
  },
  textures: {
    ground: {
      asphalt: '/assets/images/ground/asphalt.png',
      gravel: '/assets/images/ground/gravel.png',
      dirt: '/assets/images/ground/dirt.png',
      grass: '/assets/images/ground/grass.png',
      mud: '/assets/images/ground/mud.png',
      rock: '/assets/images/ground/rock.png',
      marble: '/assets/images/ground/marble.png'
    },
    sky: '/assets/images/sky/sky_01.jpg'
  }
};
```