import { CameraDirector } from './CameraDirector.js';

class Camera {
  constructor() {
    this.mode = 'directed'; // Use the new director-based mode
    this.target = { x: 0, y: 0 };
    this.zoom = 1;
    this.damping = 0.15;
    this.director = new CameraDirector();
  }

  setMode(mode, opts = {}) {
    this.mode = mode || this.mode;
    if (opts.zoom) this.zoom = Math.max(0.5, Math.min(3, opts.zoom));
    if (opts.target) this.target = { x: opts.target.x || 0, y: opts.target.y || 0 };
  }

  calculateDesiredState(race, gameState) {
    if (!race || !race.racers || race.racers.length === 0 || !gameState) {
      return { desiredX: this.target.x, desiredZoom: this.zoom };
    }

    if (this.mode === 'directed') {
      const shot = this.director.getShot(race, gameState);
      return this.calculateStateForShot(shot, race, gameState);
    }

    // Fallback for older modes
    const loc = race.liveLocations;
    const xs = race.racers.map(rid => loc[rid] || 0);
    const avg = xs.reduce((a, b) => a + b, 0) / xs.length;
    const minX = Math.max(0, Math.min(...xs));
    const maxX = Math.min(100, Math.max(...xs));

    let desiredX = this.target.x;
    let desiredZoom = this.zoom;

    if (this.mode === 'fitAll') {
      const margin = (gameState.settings?.render?.camera?.fitAllMargin) || 15;
      const span = Math.max(30, (maxX - minX) + margin * 2);
      desiredX = (minX + maxX) / 2;
      const zMin = (gameState.settings?.render?.camera?.zoomMin) || 0.5;
      const zMax = (gameState.settings?.render?.camera?.zoomMax) || 2.0;
      desiredZoom = Math.max(zMin, Math.min(zMax, 100 / span));
    }
    
    return { desiredX: Math.max(0, Math.min(100, desiredX)), desiredZoom };
  }

  calculateStateForShot(shot, race, gameState) {
    const loc = race.liveLocations;
    let positions = shot.racers.map(rid => loc[rid] || 0).filter(p => p !== undefined);
    
    if (positions.length === 0) {
        // If target racers for shot are not found (e.g., all finished), find last known active racer
        const activeRacers = race.racers.filter(rid => !(race.results || []).includes(rid));
        if (activeRacers.length > 0) {
           positions = activeRacers.map(rid => loc[rid] || 0);
        } else {
           return { desiredX: this.target.x, desiredZoom: this.zoom };
        }
    }
    
    const minX = Math.min(...positions);
    const maxX = Math.max(...positions);

    const zMin = (gameState.settings?.render?.camera?.zoomMin) || 0.5;
    const zMax = (gameState.settings?.render?.camera?.zoomMax) || 2.0;

    // Calculate desired zoom based on the span of racers in the shot and a margin
    const span = Math.max(shot.minSpan, (maxX - minX));
    const targetSpan = span + (shot.margin * 2);
    let desiredZoom = Math.max(zMin, Math.min(zMax, 100 / targetSpan));
    
    // Calculate desired center point of the shot, adding a lookahead
    let desiredX = (minX + maxX) / 2;
    if (shot.lookahead) {
       desiredX = Math.max(...positions) + shot.lookahead;
    }

    return { 
        desiredX: Math.max(0, Math.min(100, desiredX)), 
        desiredZoom 
    };
  }
}

export { Camera };