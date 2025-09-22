# Canvas Implementation Guide – Core Systems

This guide explains how to migrate the current DOM-based track to an HTML5 Canvas renderer with adorable blobby racers, camera controls, optional 2.5D perspective, textured ground types, and contextual nameplates.

## Objectives

- Replace the DOM-based track with a performant and visually rich canvas renderer.
- Render racers as procedurally generated, squishy, animated blobs.
- Implement a dynamic camera system with various tracking modes, zoom, and panning.
- Enhance the visual appeal with textured ground, particle effects, and an optional 2.5D perspective.
- Add interactivity, such as hover-to-view racer nameplates.

---

## Current Status (What's Done)

We have a solid foundation in place for the new rendering engine.

-   **Core Modules Created**: The foundational classes `CanvasRenderer.js`, `Camera.js`, `BlobFactory.js`, and `HitTestIndex.js` are present and loaded.
-   **Renderer Integration**: `setupTrack.js` initializes `CanvasRenderer`. The renderer starts/stops with race lifecycle events and receives race data.
-   **Procedural Blobs**: `BlobFactory.js` produces seeded blob control points; `CanvasRenderer` draws basic blobs, eyes and mouth, and uses `TextureManager`/`ParticleSystem`/`Nameplate` stubs.
-   **Basic Camera & Hit Testing**: `Camera.js` provides modes; `HitTestIndex.js` stores screen positions for interactivity.

---

## What remains — prioritized, actionable checklist

The following tasks are written to directly replace the existing HTML/CSS racetrack and div-based racers with a single, well-architected canvas renderer while preserving game logic and UI.

Top priority (must complete to remove DOM racers)
1. Remove DOM-based visual responsibilities
   - Stop using DOM elements for racer positioning/visuals (the `<div class="racer">` system).
   - Keep DOM elements for controls, HUD, and lists only — the track and visual racer state will be rendered exclusively on canvas.
   - Identify and migrate any code that reads or writes visual-only DOM properties (e.g. style.left, width) to instead update and read from gameState.currentRace.liveLocations and canvasRenderer/hitIndex.

2. Finalize CanvasRenderer coordinate system & sizing
   - Define a simple world coordinate: race distance 0..100 maps to X axis; lane indices map to Y rows.
   - Update CanvasRenderer.resizeToContainer to set logical canvas resolution (use devicePixelRatio) and compute lane height from numberOfLanes.
   - Ensure camera transforms convert world positions to canvas pixels (apply translate/scale before drawing track & blobs). Camera.target.x should be in world units (0..100) and converted accordingly.

3. Fully adopt BlobFactory shapes and cache per-racer
   - On race setup, create blobData once per Racer (store on racer.blobData) and never recreate per-frame.
   - Expand BlobFactory.create to include per-point wobblePhase and baseRadius (already present); ensure controlPoints mutate subtly each frame using time + wobblePhase.
   - Implement squash/stretch parameters (scaleX/scaleY) based on racer speed and state (boosting/stumbling).

4. Replace DOM movement logic with canvas-driven positions
   - Move any visual movement (style.left updates) out of beginRace and into a single source of truth: gameState.currentRace.liveLocations (0..100).
   - Where code currently manipulates DOM to indicate finished/stumbling/boosting, add corresponding racer.visualState fields (e.g., racer.visual = { finished:true/false, boosting:true/false, stumbling:true/false }) and update UI via canvasRenderer or HUD code.

High priority (visual polish & UX)
5. Camera improvements
   - Implement camera.fitAll mode: compute min/max world X of racers (or 0..100) and set zoom so track segment range fits within canvas width with margins.
   - Smooth camera movement using damping (lerp) and clamp zoom within camera settings.

6. TextureManager: produce usable CanvasPattern instances
   - Instead of returning dataURL strings or colors, create Image or offscreenCanvas objects, and in getPattern(name, ctx) create and cache ctx.createPattern(image, 'repeat').
   - Make loadTextures synchronous for procedurals (generate offscreen canvas per texture) and cache patterns so drawTrack can safely set ctx.fillStyle = pattern.

7. Particles & nameplates integration
   - Ensure ParticleSystem uses world-to-screen conversion when emitting (CanvasRenderer should pass screenX/screenY or emit in world coordinates and let particle system convert).
   - Nameplate class should accept world coords and canvasRenderer should convert to screen coords before drawing.
   - Wire canvas mouse events: onmousemove -> get canvas coords, use hitIndex.getUnderPoint(x,y) -> nameplate.show(rid,x,y).

8. Hit testing & interactivity
   - Update CanvasRenderer.drawRacerMarkers to push screen positions to hitIndex as {rid, x, y, r} where x/y are canvas pixel coords after transforms.
   - On canvas click/hover, show nameplate and optionally pause or highlight racer.

Medium priority (cleanup & DOM removal)
9. Remove or deprecate DOM racer CSS and helper functions
   - After canvas visuals fully match or exceed DOM visuals, remove DOM creation in DOMUtils.createRacerElement and lane/segment DOM painting (or mark them as legacy).
   - Clean up CSS rules that only apply to `.racer`, `.lane`, `.segment` visuals to keep style sheets minimal.

10. Keep minimal DOM for accessibility and alt-representation
   - Maintain leaderboards, history, and HUD as semantic DOM.
   - Expose accessible race summary elements (aria) that mirror canvas state.

Nice-to-have / polish
11. 2.5D perspective layer
    - Add subtle vertical offset for leading racers to create depth (map lane Y to a z-offset and draw slight shadow).
12. Blur & motion trails
    - Use a fast trail buffer for boosting racers (render to an intermediate canvas and composite with additive blend).
13. Adaptive particle quality
    - Tie ParticleSystem.maxParticles to settings.render.particles.maxParticles and to device performance.

---

## Concrete mapping: Where to change code (file-level guidance)

- setupTrack.js
  - Keep selecting racers, creating gameState.currentRace.segments and liveLocations, but remove DOM movement responsibility. After creating racers, generate racer.blobData via BlobFactory and set initial gameState.currentRace.liveLocations[rid] = 0.

- beginRace.js
  - Stop updating style.left on DOM nodes. Only update gameState.currentRace.liveLocations[rid] and racer.visual state flags. Let CanvasRenderer render visuals.
  - When a racer finishes, call processRacerFinish(rid) which should update logical state; CanvasRenderer will draw final poses.

- CanvasRenderer.js
  - Ensure resizeToContainer uses devicePixelRatio for crisp rendering.
  - Apply camera transforms using ctx.save(); ctx.translate(centerX, centerY); ctx.scale(zoom,zoom); ctx.translate(-worldToPixels(camera.target.x), -camera.targetY);
  - Convert world X (0..100) to world pixel units consistently. Provide helper worldToScreen({x,y}) used both internally and by external code (nameplate, particle emit).
  - Draw track segments using TextureManager.getPattern(name, ctx) which should return a CanvasPattern or fallback color.

- TextureManager.js
  - Return CanvasPattern instances cached per ctx in getPattern. Use offscreen canvas for procedurals (no data-URL intermediaries) to avoid load timing issues.

- ParticleSystem.js & Nameplate.js
  - Accept world-space or screen-space coordinates consistently (prefer screen-space). CanvasRenderer should call particleSystem.emit(screenX, screenY, ...) when rendering.

- HitTestIndex.js
  - Continue to receive screen-space positions from CanvasRenderer and be queried by canvas event handlers.

- DOMUtils.js & CSS
  - Gradually remove or mark deprecated functions that create visual DOM for track/racers; keep DOMUtils.createRacerGuiElement for history/leaderboard.

---

## Minimal API contract between canvas renderer and game logic

- CanvasRenderer.setData(currentRace, trackProps)
  - currentRace contains: racers[], segments[], liveLocations{rid:0..100}, results[], weather, trackName
- CanvasRenderer.start()/stop()
- CanvasRenderer.resizeToContainer()
- canvasRenderer.worldToScreen(worldX, laneIndex) -> {x,y} — public helper
- HitTestIndex.getUnderPoint(screenX, screenY) -> [rids]
- Nameplate.show(rid, screenX, screenY) and .render(ctx)

---

## Migration checklist (step-by-step)

1. Convert DOM-based movement:
   - Replace all style.left writes with updates to gameState.currentRace.liveLocations.
   - Add racer.visualState flags for visual-only state.

2. Lock down rendering pipeline:
   - CanvasRenderer must be the single writer of all visual canvas output.
   - All visual cues such as 'boosting', 'stumbling', 'finished' must be read from racer.visualState when drawing.

3. Finalize hit testing & interactions:
   - Hook canvas mouse events -> hitIndex -> nameplate -> optional pause/show info.

4. Remove DOM painter code and CSS rules (after verification):
   - Delete/disable DOMUtils.createLane/createRacerElement usages in setupTrack; leave DOMUtils.createRacerGuiElement for history.
   - Remove heavy CSS rules for lane/segment/racer once canvas visuals are complete.

5. Test & tune:
   - Validate at various devicePixelRatio values.
   - Run performance profiling; reduce particle counts or canvas resolution on low-end devices.

---

## Example small implementation notes & snippets

- Convert world X (0..100) to pixels:
  - const worldWidth = 100; const px = pad + (worldX/100) * (canvas.width - pad*2);

- Device Pixel Ratio sizing:
  - const dpr = window.devicePixelRatio || 1;
  - canvas.width = Math.floor(container.clientWidth * dpr);
  - canvas.height = Math.floor(container.clientHeight * dpr);
  - ctx.scale(dpr, dpr);

- Camera smoothing:
  - this.camera.target.x += (desiredX - this.camera.target.x) * this.camera.damping;

---

## Acceptance criteria (how we know we're done)

- All racer visuals are rendered to the canvas; there are no visual-position updates applied directly to DOM racer elements.
- CanvasRenderer can show nameplates on hover and particles on boost/stomp.
- The camera smoothly follows racers and supports fit-all and leader-tracking modes.
- Track segments are drawn with textures (CanvasPattern), not static DOM segments.
- Removing the old CSS/DOM visuals does not break gameplay or the HUD; leaderboards/history remain DOM-driven.

---

## Next immediate task to implement (suggested first PR)

- Implement device-pixel-ratio aware resize in CanvasRenderer.resizeToContainer, finalize worldToScreen helper, and change beginRace to update only gameState.currentRace.liveLocations; run a smoke test to ensure canvas draws moving blobs and hit testing works.