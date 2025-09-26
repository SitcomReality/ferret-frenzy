# Ferret Particle-Chain Body Overhaul: Review and Implementation Plan

Goal
- Replace rigid-ellipse ferret bodies with a flexible body formed by 3–5 invisible particles (nodes) connected by constraints, rendered as a smooth, thick spline (“snake-like”).
- Animate a simplified bounding/gallop gait driven by front/back “leg anchors” so body oscillates naturally.
- Keep legs visually “connected to the ground,” but simplify to two primary legs (front/back), with optional near/far presentation.
- Maintain existing rendering pipeline and camera behavior.

---

## Current Graphics System: Quick Review

Where ferrets are drawn now
- render/renderers/FerretRenderer.js
  - Orchestrates ferret drawing per racer: updates animation system, then body, head, tail, legs, eyes.
- render/renderers/FerretBodyRenderer.js
  - Draws body as ellipse + head, tail, legs.
- render/renderers/FerretAnimationSystem.js
  - Drives gait phase, ear flap, stumble/crash, eye tracking.
- render/renderers/RacerRenderer.js
  - Places ferrets in world space and calls FerretRenderer.render.
- render/core/WorldTransform.js
  - Converts world positions to screen space.
- render/systems/ParticleSystem.js
  - Generic particles (dust/boost), likely unchanged.

Key impacts
- Body is currently a single ellipse with param controls; legs are articulated lines. To reach the new paradigm, body generation/animation must shift to a particle-chain with per-frame constraint solving and spline rendering.

---

## New Paradigm Overview

1) Particle chain model
- Each ferret owns an array of 3–5 nodes: [{x,y},{x,y},...], invisible.
- Constraints maintain approximate distances between neighbors for a cohesive body length.
- The chain follows two primary anchors:
  - Head anchor influenced by forward motion and gait bounce (front leg stance).
  - Hip/torso anchor influenced by rear leg stance.
- Optional mild bend forces to keep S-curves natural and avoid kinks.

2) Rendering
- Render a thickened polyline along a smoothed spline (Catmull-Rom or cubic) through nodes.
- Vary thickness slightly along chain for taper (thicker near torso, thinner near head/tail).
- Head and tail features remain, but head position is derived from the front-most node; tail curve derived from last nodes.

3) Gait/grounding
- Simplify legs to two main legs (front/back). Near/far pass can remain for depth.
- Leg contact alternates; stance leg pulls corresponding anchor down/forward; swing leg raises slightly.
- Body oscillation emerges from alternating anchor vertical offsets and forward velocity.

---

## Files To Modify

1) render/renderers/FerretBodyRenderer.js
- Replace ellipse body with spline rendered from chain nodes.
- Add thickness profile, dorsal patterns applied along the body path if needed.
- Update tail: derive root from tail-end node and render curve consistent with spline direction.
- Update legs: render two main legs driven by front/back anchors; keep near/far pass compatibility.

2) render/renderers/FerretAnimationSystem.js
- Add particle-chain integration:
  - Initialize and maintain ferret.bodyChain state (nodes, rest lengths).
  - Update anchors each frame using velocity, gait phase, and simple “spring” offsets for bounce.
  - Solve constraints (Verlet-like): several iterations per frame for stability.
  - Apply damping and mild curvature regularization.
- Update gait:
  - Alternate stance phases: front stance while back swings, then swap.
  - Map gait.cyclePhase into leg contact state and body anchor offsets.
- Maintain existing eye/ear logic; integrate head position from chain.front.

3) render/renderers/FerretRenderer.js
- Minimal changes; ensure color/state passed to the updated body renderer.
- Ensure order: legs (far), body spline, head, tail, legs (near), eyes.

4) render/renderers/RacerRenderer.js
- No functional changes expected; ensure time/scale continues to flow to FerretRenderer.

5) src/entities/racer/FerretFactory.js (and possibly src/entities/racer/Racer.js)
- Initialize ferret.bodyChain:
  - Node count (configurable 3–5), initial spacing, base rest lengths.
  - Default params: stiffness, damping, curvature bias, thickness profile.
- Add gait defaults for two-leg model (front/back contact duty cycles).

6) src/config/racerProperties.js
- Add defaults for:
  - bodyChain: nodeCount, restDistance, stiffness, iterations, damping, thicknessStart/end.
  - gait: stride amplitude scaling for anchors, contact duty cycle.
  - tail: follow factor from last nodes.

7) ui/components/settingsPanel.js (and settings-related assets)
- Optional: add developer toggles to visualize nodes/skeleton and tweak chain params live (debug only).

8) src/utils/helpers.js (optional)
- Utility smoothing, Catmull-Rom spline sampler, normal/tangent computation for ribbon thickness.

9) render/renderers/FerretEyeRenderer.js
- Verify head anchor change; ensure eye placement uses head node position.

10) render/core/WorldTransform.js
- Likely unchanged; positions are still lane-centered.

---

## New Files To Add

1) render/systems/VerletChain.js
- Small, generic chain solver:
  - createChain({count, start, dir, spacing})
  - satisfyConstraints(nodes, restLengths, iterations, stiffness)
  - integrate(nodes, prevNodes, dt, damping)
  - pin/update endpoints from anchors
- Export utilities for reuse and testing.

2) render/renderers/SplineUtils.js
- Spline sampling helpers:
  - catmullRomPoint(t, p0, p1, p2, p3)
  - samplePolyline(points, resolution)
  - computeRibbonNormals(points) for variable width rendering.

3) Optional: render/debug/ChainDebugger.js
- Draw nodes/segments in overlays for developer mode.

---

## Data Model Additions (per ferret)

- ferret.bodyChain
  - nodes: [{x,y}, …]
  - prev: [{x,y}, …] (for Verlet)
  - rest: [d1, d2, …]
  - params: { stiffness, damping, iterations, thicknessStart, thicknessEnd }
  - anchors:
    - head: { x, y, offsetY, weight }
    - hip: { x, y, offsetY, weight }
- ferret.gait
  - cyclePhase, stride (existing)
  - contact: { frontInContact: bool, backInContact: bool, dutyCycle: number }
  - anchorOffsets: { frontY, backY } derived from cycle
- ferret.tail
  - followFactor: 0..1, sway (reuse existing sway modulated by last segment motion)

---

## Rendering Details

- Body
  - Sample spline along nodes; draw with ctx.lineWidth varying from thicknessStart -> thicknessEnd.
  - Fill/stroke strategy: use stroke with round caps/joins for smoothness.
  - Optional dorsal pattern: re-stroke central line with secondary color at thinner width.

- Head
  - Position: at spline front tangent, centered on first node (or slight forward offset).
  - Existing ears/nose/underbite retained.

- Legs (front/back)
  - Hip/shoulder positions inferred from chain midpoints near anchors.
  - Stance leg: foot at ground contact (lane baseline), minimal lift.
  - Swing leg: add lift based on phase; foot forward/back mirrored for motion.

- Tail
  - Use last nodes’ direction to aim tail curve; keep current style but seed from chain orientation.

---

## Algorithm Sketch (per frame, per ferret)

1) Determine gait phase, stance/swing states from velocity and gait.cyclePhase.
2) Compute anchor targets:
   - head/hip x from world position, y from lane center + stance oscillation.
3) Verlet update:
   - Integrate nodes with dt and damping.
   - Pin or lerp nodes near ends to anchors (weights to preserve flexibility).
   - Satisfy constraints (N iterations) for segment distances.
   - Optional curvature smoothing pass.
4) Render:
   - Body spline ribbon (thick stroke).
   - Head features at front.
   - Tail from back, legs from anchors, eyes last.

---

## Integration Steps

Phase 1: Scaffolding
- Add VerletChain.js and SplineUtils.js.
- Add bodyChain initialization in FerretFactory.js with sane defaults in racerProperties.js.
- Gate rendering with a feature flag (e.g., ferret.bodyChain.enabled = true).

Phase 2: Replace Body Rendering
- Modify FerretBodyRenderer.renderBody to draw spline ribbon when enabled.
- Keep current head/legs/tail temporarily for visual continuity.

Phase 3: Gait and Anchors
- Update FerretAnimationSystem to compute anchors and drive chain each frame.
- Replace leg positioning with front/back driven by anchors.

Phase 4: Polish
- Tune thickness taper, damping, iterations for stability/performance.
- Add debug toggles to visualize nodes and anchors.
- Adjust tail and head alignment to match chain orientation.

Performance notes
- 3–5 nodes, 3–5 iterations per frame is very cheap.
- Use lightweight math, avoid allocations in hot paths.
- Only allocate arrays once per ferret; mutate in place.

---

## Test Checklist

- Ferrets bound with visible up/down oscillation at varying speeds.
- Body deforms smoothly without jitter or collapsing.
- Legs alternate contact convincingly; feet appear grounded.
- Stumble/crash still works; chain doesn’t explode; body softens/loosens as needed.
- Z-order unchanged: ferrets remain above banners as previously fixed.
- Mobile/desktop parity and stable frame rate with many racers.

---