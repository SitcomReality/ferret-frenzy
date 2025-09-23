class WorldTransform {
  constructor(laneHeight = 40, segmentWidth = 30) {
    this.laneHeight = laneHeight;
    this.segmentWidth = segmentWidth;
  }

  worldToScreen(worldX, laneIndex, camera, canvasWidth, canvasHeight, numberOfLanes) {
    const pad = 10;
    const dpr = (camera && camera.dpr) || window.devicePixelRatio || 1;
    const w = canvasWidth / dpr;
    const h = this.laneHeight;
    const totalHeight = h * numberOfLanes;
    const trackCenterY = pad + totalHeight / 2;

    const yPos = pad + laneIndex * h + h / 2;

    const worldPixelWidth = w * 4;
    const cameraPixelX = camera ? (camera.target.x / 100 * worldPixelWidth) : 0;

    const screenX = (worldX / 100 * worldPixelWidth - cameraPixelX) * (camera ? camera.zoom : 1) + w / 2;
    const screenY = (yPos - trackCenterY) * (camera ? camera.zoom : 1) + (canvasHeight / dpr) / 2;

    return { x: screenX, y: screenY, scale: (camera ? camera.zoom : 1) };
  }
}

window.WorldTransform = WorldTransform;