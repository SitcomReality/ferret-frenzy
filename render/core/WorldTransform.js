worldToScreen(worldX, laneIndex, camera, canvasWidth, canvasHeight, numberOfLanes) {
    if (!camera) {
      camera = { dpr: 1, target: { x: 0, y: 0 }, zoom: 1, damping: 0.15 };
    }
    const pad = 10;
    const w = canvasWidth / (camera.dpr || 1);
    const h = this.laneHeight;

