# Ferret Graphics Integration Guide
# Objective: Provide a concise overview of how ferrets are constructed and animated in the Racing Game, and outline the essential interface/features a new "fancy ferret" system must support to be compatible.

## 1) How ferrets are constructed today
- Entity source
  - Racer instances are created in `init.js` using `new Racer(id, nameIndices, colorIndices, settings)`.
  - Each Racer composes components via `RacerComponents` (stats, performance, personality, history, betting, etc.).
  - Visual/anatomy for rendering is created with `FerretFactory.create(racer)` and stored at `racer.ferret`.
- Anatomy data (from FerretFactory)
  - Structure returned:
    - body: { length, height, stockiness }
    - legs: { length, thickness }
    - tail: { length, fluffiness }
    - head: { size, roundness, noseLength, underbiteDepth, earSize, headType, earShape }
    - coat: { pattern: 'solid'|'banded', stripeIndex }
    - eye: {
        pupil{x,y}, targetPupilX/targetPupilY, blinkTimer, isBlinking, blinkPhase, upperLid, lowerLid, targetRid
      }
    - gait: { stride, cyclePhase, footfall }
    - state flags: isStumbling (bool), crashPhase (number)
    - seed used for deterministic variation
- Colors
  - Racer has `colors` as indices referencing global palette `window.racerColors`.
  - Renderers resolve indices to hex strings before drawing.

## 2) How ferrets are drawn and animated
- Rendering pipeline
  - `RenderManager` coordinates camera transforms, track, banners, racers, particles.
  - `RacerRenderer.render()` iterates lanes and calls `FerretRenderer.render(ctx, x, y, racer, time, scale, raceState)`.
  - Draw order: track -> banners (behind) -> ferrets -> particles -> overlays.
- FerretRenderer stack
  - `FerretAnimationSystem.update(ferret, racer, time, raceState)` updates motion state:
    - Gait cycle + stride from race velocity (derived from `race.liveLocations`).
    - Ear flap animation synced to stride (up/down easing).
    - Stumble/crash animation: `isStumbling` toggles, `crashPhase` advances, resets on recovery.
    - Eye tracking: looks to adjacent lanes if nearby; smooth pupil movement; blink timing.
  - `FerretBodyRenderer` draws parts:
    - Far-side legs first (behind body), then body, head, tail, near-side legs (front), then eyes.
    - Leg kinematics use a simple procedural approach driven by the gait `cyclePhase`. The foot's horizontal position relative to the hip is calculated using `sin(cyclePhase)`, creating a forward-and-backward motion. The foot's vertical "lift" is calculated using `cos(cyclePhase)`, causing the foot to raise only during its forward swing. A simple IK approximation determines the knee's position to create a natural bend. See `docs/FerretLegAnimation.md` for a detailed breakdown.
    - Nose twitching disabled when stumbling; underbite optional; coat band.
  - `FerretEyeRenderer` clips eye whites, draws pupil, eyelids based on blink/lid offsets.
- Particles and effects
  - `RacerRenderer` emits:
    - Boost sparkle/smoke from foot area: y + 15 * scale.
    - Dust trail with gentle spread; uses `ParticleSystem.emit()`.
  - `ParticleSystem` updates simple velocity/gravity/fade.
- Camera & world coordinates
  - World X = 0..100 mapped to canvas width * 4 (worldPixelWidth).
  - Lane Y = laneIndex * laneHeight + laneHeight/2, transformed by camera zoom/pan.
  - `WorldTransform.worldToScreen()` used for conversions when needed.
- Interaction
  - `HitTestIndex` caches screen-space circles for ferrets (x,y,r) for hover.
  - `InteractionController` maps pointer Y to lane index; shows name hover banners via `BannerSystem`.

## 3) Essential features a new ferret system must preserve
- API & contract
  - A renderer callable per racer:
    - `render(ctx, x, y, racer, time, scale, raceState)`
      - Must respect camera-transformed context (no extra world transforms).
      - Must draw in the correct z-order: behind legs first, body, head, tail, front legs, eyes.
  - Animation hook:
    - Either keep `FerretAnimationSystem.update(...)` or provide equivalent internal update that:
      - Derives stride from change in `raceState.liveLocations[racer.id]`.
      - Handles stumbling (`racer.ferret.isStumbling`, `racer.remainingStumble`, `crashPhase`).
      - Eye tracking of adjacent lanes + blinking behavior.
  - Foot anchor
    - Provide or maintain a foot reference so `RacerRenderer` can keep emitting particles at feet.
    - Current assumption: feet are near `y + 15 * scale` relative to body center.
- Data compatibility
  - Continue using `racer.ferret` for state; preserve or adapt:
    - gait.cyclePhase, gait.stride
    - ear.value/reverse or analogous signals
    - eye fields (pupil, lids, blinkPhase/timer)
    - isStumbling and crashPhase
  - Colors use existing indices to global `window.racerColors`.
- Performance & ordering
  - Keep draw calls efficient; avoid excessive state changes.
  - Respect existing render order so banners appear behind ferrets and overlays on top.
  - Avoid layout thrash; frame at 60fps in normal conditions.
- Camera/scale assumptions
  - Respect provided `scale` and position `x,y` in camera space.
  - No additional global transforms; keep drawing local to provided origin.

## 4) Integration guidelines for "fancy ferrets"
- Replace renderer via composition
  - Create `FancyFerretRenderer` implementing the same render signature.
  - Swap in `RacerRenderer` by replacing `this.ferretRenderer = new FancyFerretRenderer();`
  - Keep `FerretAnimationSystem.update(...)` or provide compatible internal update with identical external state.
- Provide feature parity
  - Expose optional foot anchors:
    - `getFootAnchor(racer) -> { xOffset, yOffset }` for precise particle origin (fallback to current heuristic).
  - Maintain stumble visuals and recovery behavior tied to `racer.remainingStumble` and `racer.ferret.isStumbling`.
  - Preserve eye tracking API or emulate internally; keep hover/nameplate unaffected.
- Z-order & occlusion
  - Keep far-side legs drawn first to maintain depth without relying on global layering.
  - Ensure ferret body obscures banners when overlapping.
- Configuration
  - Continue resolving `racer.colors` indices to palette hex.
  - Avoid hardcoded colors; support coat patterns and stripe index behavior or provide a mapping layer.
- Testing checklist
  - Movement smoothness at different zooms.
  - Stumble transitions visible, banner shows behind ferret, camera remains stable.
  - Particles originate at feet during boost and while running.
  - Hit testing still works (update screen position radius if ferret visual footprint changes).

## 5) Minimal interface example (drop-in)
```javascript
class FancyFerretRenderer {
  render(ctx, x, y, racer, time, scale, raceState) {
    const ferret = racer?.ferret; if (!ferret) return;
    // 1) Update animation (internally or call FerretAnimationSystem.update)
    // 2) Resolve colors: const colors = racer.colors.map(i => window.racerColors[i]);
    // 3) Draw order: far legs -> body -> head -> tail -> near legs -> eyes
    // 4) Keep foot position predictable for particles (e.g., y + 15*scale or computed anchor)
  }
  getFootAnchor(racer, scale = 1) { return { dx: 0, dy: 15 * scale }; }
}
```