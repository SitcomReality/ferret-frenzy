# Ferret Leg Animation: The "Planted Foot" Illusion

This document explains how the ferret running animation creates the illusion of feet being planted firmly on the ground during a stride, even though the animation is calculated procedurally and relative to the ferret's moving body.

## 1. Overview of the Illusion

The core challenge in a side-scrolling running animation is making the feet appear stationary relative to the ground while they are in contact with it. If a foot slides backward or forward during its ground contact phase (the "plant"), the movement looks unnatural and slippery.

Our system achieves this illusion by synchronizing the backward speed of the foot (relative to the ferret's body) with the forward speed of the ferret's body (relative to the world/track). When these two speeds are equal and opposite, the foot's net velocity relative to the world is zero, making it look "planted".

## 2. Key Animation Components

The animation is driven by two main scripts: `FerretAnimationSystem.js` and `FerretBodyRenderer.js`.

### FerretAnimationSystem: Calculating Gait Parameters

This system acts as the "brain" of the animation. In its `update` function, it calculates the core parameters that drive the leg movement based on the ferret's actual race progress.

1.  **Velocity Calculation**: It determines the ferret's current forward velocity by checking the change in its `race.liveLocations` value over time.
2.  **Gait `cyclePhase`**: A master variable, `ferret.gait.cyclePhase`, is continuously incremented. The amount it increments each frame is directly proportional to the ferret's `velocity`. This ensures the legs cycle faster when the ferret runs faster. This phase value cycles from `0` to `2π`, representing one full stride.
3.  **Gait `stride`**: The length of the ferret's stride is also calculated based on `velocity`. A faster ferret takes longer strides.

### FerretBodyRenderer: Drawing the Legs

This script takes the gait parameters and uses them to draw the legs in the correct position for the current frame.

1.  **Horizontal Foot Position (`strideOffset`)**: The horizontal position of the foot relative to the hip is determined by `Math.sin(cyclePhase)`. As `cyclePhase` progresses from `0` to `2π`:
    -   `sin` goes from 0 -> 1 -> 0 -> -1 -> 0.
    -   This creates a smooth forward (`+`) and backward (`-`) motion for the foot.

2.  **Vertical Foot Position (`liftAmount`)**: The vertical "lift" of the foot is determined by `Math.cos(cyclePhase)`.
    -   `cos` goes from 1 -> 0 -> -1 -> 0 -> 1.
    -   The code is set up to only apply lift when `cos(cyclePhase)` is positive (i.e., when the `cyclePhase` is in the first and fourth quadrants).
    -   This corresponds to the phase where the foot is swinging forward (`sin(cyclePhase)` is increasing). When the foot is moving backward, `liftAmount` is zero, keeping the foot on the "ground".

## 3. How Synchronization Creates the Planted Effect

The magic happens when the backward phase of the foot's horizontal movement aligns with the ferret's forward movement.

-   **Forward Swing (No Plant)**: When `cyclePhase` is between `~1.5π` and `~0.5π`, `cos` is positive, so the foot is lifted off the ground. `sin` is moving from negative to positive, so the foot is swinging forward relative to the body. This is the "recovery" phase of the stride.

-   **Backward Stroke (Planted)**: When `cyclePhase` is between `~0.5π` and `~1.5π`, `cos` is negative, so the foot has zero lift (`liftAmount = 0`). `sin` is moving from positive to negative, so the foot is moving backward relative to the body.

The key is that the speed of this backward movement is designed to match the ferret's forward velocity. Because the `cyclePhase` update rate is proportional to the ferret's velocity, the entire system self-regulates. A faster ferret will have its legs cycle faster, and the backward stroke of the planted foot will be faster, perfectly canceling out the increased forward body speed.

This creates a convincing illusion that the foot is locked to the ground for half of the stride cycle, providing a solid point of contact from which the ferret propels itself forward.

## 4. Integration for a New Ferret System

Any new ferret graphics system must replicate this core principle to be compatible:

-   It needs an animation cycle variable (`cyclePhase`) that is advanced proportionally to the ferret's world velocity.
-   The position of a planted foot must be animated moving backward relative to the ferret's body.
-   The speed of this backward animation must be tuned to match the ferret's forward speed, resulting in a net-zero velocity relative to the ground.

