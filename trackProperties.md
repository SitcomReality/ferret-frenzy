
```
# Track Properties Documentation

This document explains how track properties work together to generate racing tracks in the game.

## Overview

Tracks are generated using a system of sections, segments, and lanes that work together to create varied racing experiences.

## Core Properties

### `numberOfLanes` (number, default: 10)
- **Purpose**: Defines how many lanes/racers can race on a track simultaneously
- **Usage**: Determines the number of racing lanes. Each lane can hold one racer
- **Range**: Typically 2-20 lanes
- **Example**: `numberOfLanes: 10` allows 10 racers to compete on the track

### `totalPoolSize` (number, default: 30)
- **Purpose**: Total number of tracks available in the game pool
- **Usage**: Used when generating the initial set of available tracks
- **Range**: 10-1000 tracks
- **Example**: `totalPoolSize: 30` generates 30 unique tracks for the game

## Track Structure Properties

### `numberOfSegments` (number, default: 21)
- **Purpose**: **DEPRECATED** - This property is no longer used in track generation
- **Legacy**: Was originally intended to define total segments but replaced by sections system
- **Current**: Track length is now determined by `minSectionsPerTrack` and `maxSectionsPerTrack`

### `sequentialSegments` (number, default: 3)
- **Purpose**: **DEPRECATED** - No longer used in current track generation
- **Legacy**: Was intended to control segment sequencing but replaced by sections system

### `segmentsPerSection` (number, default: 3)
- **Purpose**: How many individual segments make up each track section
- **Usage**: Each section of track is subdivided into this many segments for fine-grained position tracking
- **Range**: Typically 1-5 segments per section
- **Example**: `segmentsPerSection: 3` means each track section contains 3 segments

### `minSectionsPerTrack` (number, default: 3)
- **Purpose**: Minimum number of sections in a generated track
- **Usage**: Ensures tracks aren't too short
- **Range**: Usually 2-10 sections
- **Example**: `minSectionsPerTrack: 3` creates tracks with at least 3 sections

### `maxSectionsPerTrack` (number, default: 7)
- **Purpose**: Maximum number of sections in a generated track
- **Usage**: Ensures tracks aren't too long
- **Range**: Usually 5-20 sections
- **Example**: `maxSectionsPerTrack: 7` creates tracks with maximum 7 sections

### `minConsecutiveSegmentsOfSameType` (number, default: 1)
- **Purpose**: Minimum consecutive segments of the same ground type
- **Usage**: Prevents tracks from having too many rapid ground type changes
- **Range**: Usually 1-5 segments
- **Example**: `minConsecutiveSegmentsOfSameType: 2` ensures at least 2 segments of the same type are together

## How Track Generation Works

1. **Track Length**: Randomly selects number of sections between `minSectionsPerTrack` and `maxSectionsPerTrack`

2. **Section Generation**: Each section gets assigned a ground type (asphalt, grass, dirt, etc.)

3. **Segment Creation**: Each section is divided into `segmentsPerSection` individual segments

4. **Ground Type Assignment**: Ground types are assigned ensuring `minConsecutiveSegmentsOfSameType` is respected

5. **Finish Line**: Always added as the final segment

## Track Generation Example

```javascript
// With these settings:
{
  minSectionsPerTrack: 3,
  maxSectionsPerTrack: 7,
  segmentsPerSection: 3,
  minConsecutiveSegmentsOfSameType: 2
}

// A generated track might look like:
// Track: "Thunder Raceway" with 5 sections
// Section 1: Asphalt (3 segments)
// Section 2: Grass (3 segments) 
// Section 3: Dirt (3 segments)
// Section 4: Gravel (3 segments)
// Section 5: Asphalt (3 segments)
// Finish Line (1 segment)
// Total: 16 segments (5 sections × 3 segments + finish line)

```