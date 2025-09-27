import { FerretGaitSystem } from "../systems/FerretGaitSystem.js";
import { VerletBodySystem } from "../systems/VerletBodySystem.js";
import { VerletTailSystem } from "../systems/VerletTailSystem.js";
import { FerretLookSystem } from "../systems/FerretLookSystem.js";

/**
 * FerretAnimationSystem - Handles ferret animation and movement
 */
export class FerretAnimationSystem {
  constructor() {
    // Animation state will be managed per ferret instance
  }

  update(ferret, racer, time, currentRace) {
    const dt = Math.max(0.0001, time - (ferret._lastTime ?? time));
    const dtSeconds = Math.max(0.0001, dt / 1000);
    
    // --- 1. Update primary timing and gait parameters ---
    FerretGaitSystem.update(ferret, racer, time, currentRace);

    // Don't update particles if racer has finished (gait system handled final state cleanup)
    if (racer.visual?.finished) return;

    // --- 2. Update particle chain physics ---
    if (ferret.bodyChain?.enabled) {
      VerletBodySystem.update(ferret, racer, dtSeconds);
    }
    if (ferret.tailChain?.enabled) {
      VerletTailSystem.update(ferret, racer, dtSeconds);
    }

    // --- 3. Update eye tracking and expressions ---
    FerretLookSystem.update(ferret, racer, time, currentRace);
  }
}