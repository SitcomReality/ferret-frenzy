renderBoostEffects(ctx, racer, screen, laneIndex, worldTransform) {
  if (racer?.isBoosting && Math.random() < 0.3) {
    if (this.renderManager && this.renderManager.particleSystem) {
      this.renderManager.particleSystem.emit(
        screen.x, 
        screen.y, 
        Math.PI, 
        80 * screen.scale, 
        2, 
        'rgba(255,255,255,0.8)'
      );
    }
  }
}

