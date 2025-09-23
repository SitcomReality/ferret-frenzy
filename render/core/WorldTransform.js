class WorldTransform {
  constructor(laneHeight = 40, segmentWidth = 30) {
    this.laneHeight = laneHeight;
    this.segmentWidth = segmentWidth;
  }

  worldToScreen(worldX, laneIndex, camera, canvasWidth, canvasHeight, numberOfLanes) {
    // defaults for missing params
    camera = camera || (window.canvasRenderer && window.canvasRenderer.camera) || null;
    const dpr = (window.devicePixelRatio || 1);
    canvasWidth = canvasWidth || (window.canvasRenderer && window.canvasRenderer.canvas && window.canvasRenderer.canvas.width) || 800;
    canvasHeight = canvasHeight || (window.canvasRenderer && window.canvasRenderer.canvas && window.canvasRenderer.canvas.height) || 520;
    numberOfLanes = numberOfLanes || (window.canvasRenderer && window.canvasRenderer.props && window.canvasRenderer.props.numberOfLanes) || (gameState.settings && gameState.settings.trackProperties.numberOfLanes) || 1;

    const pad = 10;
    const w = canvasWidth / dpr;
    const h = this.laneHeight;

    const perspectiveFactor = 1 - (laneIndex / numberOfLanes) * 0.2;
    const scaledLaneHeight = h * perspectiveFactor;

    let totalPerspectiveHeight = 0;
    for(let i = 0; i < numberOfLanes; i++) {
        totalPerspectiveHeight += h * (1 - (i / numberOfLanes) * 0.2);
    }
    const trackCenterY = pad + totalPerspectiveHeight / 2;

    let yPos = pad;
    for(let i = 0; i < laneIndex; i++) {
        yPos += h * (1 - (i / numberOfLanes) * 0.2);
    }
    yPos += scaledLaneHeight / 2;

    const worldPixelWidth = w * 4;
    const cameraPixelX = camera ? (camera.target.x / 100 * worldPixelWidth) : 0;

    const screenX = (worldX / 100 * worldPixelWidth - cameraPixelX) * (camera ? camera.zoom : 1) + w / 2;
    const screenY = (yPos - trackCenterY) * (camera ? camera.zoom : 1) + (canvasHeight / dpr) / 2;

    return { x: screenX, y: screenY, scale: perspectiveFactor * (camera ? camera.zoom : 1) };
  }
}

window.WorldTransform = WorldTransform;