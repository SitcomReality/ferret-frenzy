class FerretAnimationSystem {
  update(ferret, racer, time) {
    const currentSpeed = racer.speedThisRace[racer.speedThisRace.length - 1] || 10;
    const baseSpeed = gameState.settings.racerProperties.speedBase;
    const speedRatio = currentSpeed / baseSpeed;
    
    // Update gait cycle based on movement speed
    ferret.gait.cyclePhase += speedRatio * 0.15;
    if (ferret.gait.cyclePhase > Math.PI * 2) {
      ferret.gait.cyclePhase -= Math.PI * 2;
    }

    // Update stumble/crash animation
    if (ferret.isStumbling) {
      ferret.crashPhase += 0.2;
      
      // Reset crash when stumble ends
      if (racer.remainingStumble <= 1) {
        ferret.isStumbling = false;
        ferret.crashPhase = 0;
      }
    }

    // Update eye tracking
    this.updateEyeTracking(ferret, racer, time);
  }

  updateEyeTracking(ferret, racer, time) {
    const currentRace = gameState.currentRace;
    if (!currentRace || !currentRace.racers) return;

    const myLaneIndex = currentRace.racers.indexOf(racer.id);
    let targetFound = false;

    // Check adjacent lanes for targets
    for (let offset of [-1, 1]) {
      const targetLane = myLaneIndex + offset;
      if (targetLane >= 0 && targetLane < currentRace.racers.length) {
        const targetRacerId = currentRace.racers[targetLane];
        const targetX = currentRace.liveLocations[targetRacerId] || 0;
        const myX = currentRace.liveLocations[racer.id] || 0;
        
        // Only track if target is within reasonable distance
        if (Math.abs(targetX - myX) < 20) {
          ferret.eye.targetRid = targetRacerId;
          
          // Calculate look direction based on relative position
          const deltaX = targetX - myX;
          const distance = Math.abs(deltaX);
          const maxPupilOffset = 1.5;
          
          if (distance > 1) {
            ferret.eye.targetPupilX = Math.sign(deltaX) * Math.min(maxPupilOffset, distance / 10);
            ferret.eye.targetPupilY = (offset * 0.5);
          } else {
            ferret.eye.targetPupilX = 1;
            ferret.eye.targetPupilY = 0;
          }
          targetFound = true;
          break;
        }
      }
    }

    // Default to looking forward if no target
    if (!targetFound) {
      ferret.eye.targetRid = null;
      ferret.eye.targetPupilX = 1;
      ferret.eye.targetPupilY = 0;
    }

    // Smooth pupil movement
    const moveSpeed = 3;
    const deltaTime = 0.016; // Assume 60fps
    ferret.eye.pupil.x += (ferret.eye.targetPupilX - ferret.eye.pupil.x) * deltaTime * moveSpeed;
    ferret.eye.pupil.y += (ferret.eye.targetPupilY - ferret.eye.pupil.y) * deltaTime * moveSpeed;

    // Update eyelid expressions
    const moodTimer = time * 0.5 + racer.id;
    ferret.eye.upperLid = 0.1 + Math.sin(moodTimer) * 0.05;
    ferret.eye.lowerLid = 0.05 + Math.cos(moodTimer * 0.7) * 0.02;
  }
}

window.FerretAnimationSystem = FerretAnimationSystem;