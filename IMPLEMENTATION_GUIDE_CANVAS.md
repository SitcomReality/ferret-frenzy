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

-   **Core Modules Created**: The foundational classes `CanvasRenderer.js`, `Camera.js`, `BlobFactory.js`, and `HitTestIndex.js` have been created and are loaded in `index.html`.
-   **Basic Renderer Integration**: `setupTrack.js` now initializes a `CanvasRenderer` instance. The renderer is tied into the game's lifecycle, starting on race setup (`setupTrack`) and stopping on race finish (`processRaceFinish`).
-   **Live Data Rendering**: The canvas draws a real-time, top-down view of the race. It correctly renders the track layout, lane divisions, and segment ground types (using solid colors). Racer positions are updated live based on `gameState.currentRace.liveLocations`.
-   **Procedural Blob Generation**: `BlobFactory.js` includes a static `create` method that can generate unique, seeded blob shapes based on racer properties.
-   **Basic Camera Logic**: `Camera.js` has different tracking modes defined (`leaders`, `average`, etc.) and calculates a target position based on the race state.
-   **Hit Testing Stub**: `HitTestIndex.js` is set up to store racer screen positions, ready for implementing mouse-based interactivity.

---

## Next Steps (The To-Do List)

This section outlines the remaining tasks to fully realize the canvas renderer, ordered by priority.

### 1. Implement Blob Rendering & Animation

The core of the visual upgrade. Let's bring the blobby racers to life.

-   **Render Blobs**: Modify `CanvasRenderer.drawRacerMarkers()` to use `BlobFactory`.
    -   For each racer, call `BlobFactory.create(racer)` to get its unique shape data. It might be best to cache this data on the `Racer` object or in a new manager class to avoid recalculating it every frame.
    -   Use `ctx.beginPath()`, `ctx.moveTo()`, and `ctx.bezierCurveTo()` or `ctx.quadraticCurveTo()` to draw the blob's outline based on the generated control points.
    -   Fill the blob with the racer's primary color (`racer.colors[0]`).
-   **Animate Blobs**:
    -   **Breathing**: Implement a subtle "breathing" animation by oscillating the radius of the blob's control points using `Math.sin()` tied to a global time variable.
    -   **Eyes & Expression**: Draw simple eyes on the blob. Make them blink periodically. The pupil position could follow the "leader" or the mouse cursor for a bit of personality.
    -   **Movement Animation**: Implement squash-and-stretch effects. The blob should stretch slightly when accelerating (`boosting`) and squash when stumbling.

### 2. Full Camera Integration

Make the camera functional by applying its transformations to the canvas context.

-   **Apply Transformations**: In `CanvasRenderer.render()`, before drawing the track and racers, apply the camera's pan and zoom.
    ```javascript
    // In CanvasRenderer.render()
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2); // Center origin
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.target.x, -this.camera.target.y); // Apply camera pan
    
    // ... all drawing calls ...
    
    ctx.restore();
    ```
-   **Refine Camera Modes**:
    -   The `Camera.update()` logic needs to be connected to the renderer's coordinate system. The camera's `target.x` should correspond to a world position (e.g., the position along the track from 0 to 100).
    -   Implement the `fitAll` mode to calculate the required zoom and pan to keep the first and last racer in view.

### 3. Ground Textures & Visuals

Replace the solid-colored track segments with appealing textures.

-   **Create `TextureManager.js`**: This new module will be responsible for loading and storing image textures to be used as canvas patterns.
    ```javascript
    // TextureManager.js (Example)
    class TextureManager {
        constructor() { this.patterns = {}; this.images = {}; }
        loadTextures(textureMap) { /* load images */ }
        getPattern(name, ctx) { /* create and cache pattern */ }
    }
    ```
-   **Update `CanvasRenderer`**:
    -   Instantiate the `TextureManager` and load the ground textures defined in `gameState.settings.render.textures`.
    -   In `drawTrack()`, instead of setting `ctx.fillStyle` to a solid color, request a pattern from the `TextureManager` (`ctx.fillStyle = textureManager.getPattern('grass', ctx)`).

### 4. Particles and Nameplates

Add the final layers of polish and information.

-   **Particle System**:
    -   Create `ParticleSystem.js` to manage a pool of particles.
    -   Each blob racer should emit particles from its "mouth" to simulate propulsion. The emission rate can be tied to its current speed.
    -   The `CanvasRenderer` will call `particleSystem.update(dt)` and `particleSystem.render(ctx)` each frame.
-   **Nameplates**:
    -   Create `Nameplate.js`. This class will manage the rendering of racer names.
    -   It should only draw nameplates for a few racers at a time to avoid clutter (e.g., the top 3, or racers near the center of the screen).
    -   **Interactivity**: Wire up mouse move events on the canvas. Use `HitTestIndex.getUnderPoint(mouseX, mouseY)` to find which racer is being hovered over, and signal the `Nameplate` manager to draw their name.

### 5. DOM Cleanup

Once the canvas renderer is fully functional and provides all necessary information, we can remove the old DOM-based track elements.

-   Remove the DOM element creation logic from `setupTrack.js` (`DOMUtils.createLane`, `DOMUtils.createRacerElement`).
-   Delete the associated CSS rules for `.lane`, `.segment`, and `.racer` in `racers.css` to clean up the codebase. The live leaderboard will provide the at-a-glance race status.