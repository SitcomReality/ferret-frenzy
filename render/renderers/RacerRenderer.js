render(ctx, race, worldTransform, time) {
    this.screenPositions = [];

    for (let idx = 0; idx < race.racers.length; idx++) {
      const rid = race.racers[idx];
      const racer = gameState.racers[rid];
      const worldX = race.liveLocations[rid] || 0;
      const screen = worldTransform.worldToScreen(worldX, idx, window.canvasRenderer?.camera, ctx.canvas.width, ctx.canvas.height, race.racers.length);

