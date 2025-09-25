class Camera {
  constructor() {
    this.mode = 'fitAll';
    this.target = { x: 0, y: 0 };
    this.zoom = 1;
    this.damping = 0.15;
  }

  setMode(mode, opts = {}) {
    this.mode = mode || this.mode;
    if (opts.zoom) this.zoom = Math.max(0.5, Math.min(3, opts.zoom));
    if (opts.target) this.target = { x: opts.target.x || 0, y: opts.target.y || 0 };
  }

  calculateDesiredState(race, gameState) {
    if (!race || !race.racers || race.racers.length === 0) {
      return { desiredX: this.target.x, desiredZoom: this.zoom };
    }

    if (!gameState) {
      return { desiredX: this.target.x, desiredZoom: this.zoom };
    }

    const loc = race.liveLocations;
    const xs = race.racers.map(rid => loc[rid] || 0);
    
    // Get finished racers to exclude them from tracking
    const finishedRacers = new Set(race.results || []);
    const activeRacers = race.racers.filter(rid => !finishedRacers.has(rid));
    
    // If all racers are finished, track the last active racer
    if (activeRacers.length === 0 && race.racers.length > 0) {
      const lastRacer = race.racers[race.racers.length - 1];
      const lastPosition = loc[lastRacer] || 0;
      return { desiredX: lastPosition, desiredZoom: this.zoom };
    }
    
    // Track the front of the pack - the leading active racer
    if (activeRacers.length > 0) {
      const activePositions = activeRacers.map(rid => loc[rid] || 0);
      const leaderPosition = Math.max(...activePositions);
      const secondPosition = activePositions.length > 1 ? 
        Math.max(...activePositions.filter(pos => pos < leaderPosition)) : leaderPosition;
      
      // Add some lookahead to keep the leader in frame
      const lookahead = 5; // Look 5% ahead of the leader
      const minSpan = 15; // Minimum span to show some context
      
      let desiredX = leaderPosition + lookahead;
      let desiredZoom = this.zoom;
      
      // If we have multiple active racers, show some context
      if (activeRacers.length > 1) {
        const span = Math.max(minSpan, leaderPosition - secondPosition);
        const margin = (gameState.settings?.render?.camera?.fitAllMargin) || 15;
        const targetSpan = Math.max(span + margin * 2, minSpan);
        
        const zMin = (gameState.settings?.render?.camera?.zoomMin) || 0.5;
        const zMax = (gameState.settings?.render?.camera?.zoomMax) || 2.0;
        desiredZoom = Math.max(zMin, Math.min(zMax, 100 / targetSpan));
      }
      
      return { desiredX: Math.min(100, desiredX), desiredZoom };
    }
    
    // Fallback to original behavior if no active racers found
    const avg = xs.reduce((a, b) => a + b, 0) / xs.length;
    const minX = Math.max(0, Math.min(...xs));
    const maxX = Math.min(100, Math.max(...xs));

    let desiredX = this.target.x;
    let desiredZoom = this.zoom;

    if (this.mode === 'single' && race.racers[0] != null) {
      desiredX = avg;
    } else if (this.mode === 'leaders') {
      const lead = Math.max(...xs);
      desiredX = lead;
    } else if (this.mode === 'average') {
      desiredX = avg;
    } else if (this.mode === 'fitAll') {
      const margin = (gameState.settings?.render?.camera?.fitAllMargin) || 15;
      const span = Math.max(30, (maxX - minX) + margin * 2);
      desiredX = (minX + maxX) / 2;
      const zMin = (gameState.settings?.render?.camera?.zoomMin) || 0.5;
      const zMax = (gameState.settings?.render?.camera?.zoomMax) || 2.0;
      desiredZoom = Math.max(zMin, Math.min(zMax, 100 / span));
    }
    
    return { desiredX: Math.max(0, Math.min(100, desiredX)), desiredZoom };
  }
}

export { Camera };