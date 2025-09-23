# Ferret Racer Implementation Guide

## Overview
This guide outlines the step-by-step process for transforming the current blob racers into procedurally generated ferrets with running animations, independent eye tracking, and physics-based interactions.

## Implementation Steps

### Step 1: Create Ferret Data Structure
**Goal**: Define the ferret anatomy and procedural generation system
**Files to modify**: 
- Create `FerretFactory.js`
- Modify `Racer.js`

**Changes**:
- Create `FerretFactory.js` with methods to generate ferret body proportions
- Add ferret-specific properties to `Racer` constructor
- Define ferret anatomy parameters (body length/height, leg length, tail length, head shape, nose length, etc.)
- Implement procedural generation using racer seed for consistency

### Step 2: Basic Ferret Shape Rendering
**Goal**: Replace blob rendering with basic ferret silhouette
**Files to modify**:
- `render/renderers/RacerRenderer.js`

**Changes**:
- Replace `drawBlob()` method with `drawFerret()`
- Implement basic ferret body shape using bezier curves
- Add head, body, legs, and tail as separate drawable components
- Use existing racer colors for ferret coat patterns
- Remove blob-specific breathing animation

### Step 3: Leg Animation System
**Goal**: Implement running animation with speed-based leg movement
**Files to modify**:
- `render/renderers/RacerRenderer.js`
- Modify `FerretFactory.js`

**Changes**:
- Add leg positioning system with 4 legs (front-left, front-right, back-left, back-right)
- Implement running cycle animation with configurable stride length
- Tie animation speed to racer's current movement speed
- Add ground contact detection for realistic leg placement
- Use simple inverse kinematics or trigonometric approach for leg joints

### Step 4: Independent Eye System
**Goal**: Replace synchronized blinking with individual eye tracking
**Files to modify**:
- `render/renderers/RacerRenderer.js`
- `FerretFactory.js`

**Changes**:
- Add eye state tracking to ferret data (pupil direction, eyelid position, blink timer)
- Implement eye tracking logic to look at adjacent lane racers
- Add independent blinking system with random intervals per ferret
- Create eyelid animation (top and bottom lids) for emotional expression
- Remove synchronized eye movement from existing system

### Step 5: Enhanced Stumbling Animation
**Goal**: Replace current stumbling with ferret crash animation
**Files to modify**:
- `render/renderers/RacerRenderer.js`
- `beginRace.js`

**Changes**:
- Modify stumbling logic in `beginRace.js` to trigger ferret crash state
- Add crash animation where ferret tumbles and hits ground
- Integrate with existing particle system for dirt/debris spray
- Add recovery animation where ferret scrambles back to running
- Ensure particles use ground-type appropriate colors

### Step 6: Body Proportion Variation
**Goal**: Add visual variety through procedural body variations
**Files to modify**:
- `FerretFactory.js`
- `render/renderers/RacerRenderer.js`

**Changes**:
- Expand ferret generation to include more body variations
- Add nose length, underbite depth, ear size, body stockiness parameters
- Implement head shape variations (pointed vs rounded)
- Add tail fluffiness and length variations
- Ensure variations are deterministic based on racer seed

### Step 7: Advanced Animation Polish
**Goal**: Add secondary animation details for life-like movement
**Files to modify**:
- `render/renderers/RacerRenderer.js`

**Changes**:
- Add tail swaying animation during running
- Implement ear flapping during high-speed movement
- Add subtle head bobbing synchronized with running cycle
- Add nose twitching animation during normal running
- Implement different running styles based on ferret body proportions

### Step 8: Boost Animation Integration
**Goal**: Adapt boost effects for ferret anatomy
**Files to modify**:
- `render/renderers/RacerRenderer.js`
- `beginRace.js`

**Changes**:
- Modify boost particle emission to come from ferret's back paws
- Add boost-specific ferret animations (lower body posture, extended stride)
- Integrate boost state with eye expression (focused/determined look)
- Ensure boost particles work well with ferret running animation

### Step 9: Performance Optimization
**Goal**: Ensure smooth animation performance with complex ferret rendering
**Files to modify**:
- `render/renderers/RacerRenderer.js`
- `render/core/AnimationLoop.js`

**Changes**:
- Optimize ferret rendering pipeline for 10+ simultaneous ferrets
- Implement level-of-detail system for distant ferrets
- Cache frequently used ferret shape calculations
- Profile and optimize animation update loops

### Step 10: Testing and Polish
**Goal**: Fine-tune animations and fix edge cases
**Files to modify**:
- Various files as needed for bug fixes

**Changes**:
- Test ferret animations at various speeds
- Ensure stumbling recovery looks natural
- Verify eye tracking works correctly with lane changes
- Polish animation timing and easing curves
- Add any missing edge case handling

## Technical Considerations

### Ferret Anatomy Parameters
- **Body**: length (0.8-1.2x base), height (0.9-1.1x base), stockiness (0.8-1.2x)
- **Head**: nose length (0.7-1.3x), underbite depth (0-0.3x), ear size (0.8-1.2x)
- **Legs**: length (0.8-1.2x), thickness (0.8-1.2x)
- **Tail**: length (0.7-1.5x), fluffiness (0.8-1.3x)

### Animation States
- **Running**: Normal running cycle with 4-beat gait
- **Stumbling**: Crash sequence with tumbling
- **Boosting**: Extended stride with lower posture
- **Recovering**: Scrambling back to running from stumble

### Eye Tracking Logic
- Default: Look forward (right direction)
- Priority targets: Adjacent lane racers within detection range
- Smooth interpolation between targets
- Independent blink cycles (2-8 second intervals)

### Performance Targets
- Maintain 60 FPS with 10 ferrets running simultaneously
- Each ferret should have smooth leg animation at 30+ animation frames
- Eye tracking updates should be smooth but not overwhelming CPU

## File Dependencies
- `FerretFactory.js` → New factory for procedural ferret generation
- `render/renderers/RacerRenderer.js` → Main rendering logic
- `beginRace.js` → Movement and stumbling integration
- `Racer.js` → Ferret data storage in racer objects

## Implementation Notes
- Maintain backward compatibility where possible
- Use existing particle system for stumbling effects
- Preserve current racer color system for ferret coat colors
- Keep existing camera and track rendering systems unchanged
- Ensure ferret animations work with current speed calculation system

