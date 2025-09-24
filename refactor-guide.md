__DELETE_ME__

# Post-Refactor Cleanup, Maintenance, and Debugging Guide

This guide outlines the fastest path to make the refactor stable, remove redundancy, and get “New Game → Race Week → Setup → Start Race” working with the module architecture.

## 0) Immediate State Assessment (Primary Blockers)

- Module path mismatches cause 404s:
  - src/main.js imports ./ui/... but UI modules live at /ui/… (root), not /src/ui/…
  - RenderManager imports Camera/WorldTransform/etc. from ./systems but the files are in render/core/.
- Duplicate/legacy vs modular systems coexist and conflict:
  - UI: index.html static DOM + legacy initialization + new module UIManager/GameScreen/IntroScreen.
  - Game state: legacy window.gameState (gameState.js) vs src/core/GameState with module state.
  - Word lists: loadXmlWordlists.js, src/main.js loader, src/data/WordListManager.js, and const_* lists.
  - Render: multiple Camera/WorldTransform/Nameplate/ParticleSystem versions; mixed global vs module usage.
  - Racer entity: New componentized src/entities/racer/Racer.js exists, while legacy code still expects window.Racer.
- Save pipeline references globals: SaveGame relies on window.Racer and window.Track to deserialize.
- Start flow is split: “New Game” logic exists in legacy EventHandlers/init.js and in new IntroScreen/UIManager, causing no single working boot path.

## 1) Make It Run: Critical Fix Checklist

Choose Option A or B and stick to it for UI imports.

A) Move UI into src/ui (preferred)
- Move /ui/* to /src/ui/* preserving structure.
- Update any internal UI relative imports if needed.
- Result: src/main.js imports remain valid (./ui/...).

B) Keep UI at /ui and fix imports (quick fix)
- In src/main.js, change:
  - import { UIManager } from './ui/UIManager.js' → '../ui/UIManager.js'
  - Same for GameScreen, BettingComponent, HUDComponent, etc.
- Ensure all evented flows point to the same UIManager instance.

Then:
- Pick a single source of truth for UI surface:
  - EITHER use GameScreen (module UI) exclusively and remove duplicate header/HUD/left/right panels from index.html
  - OR keep the static DOM in index.html and remove GameScreen/IntroScreen usage (not recommended)
- Recommended: Keep GameScreen and show it via UIManager; index.html should only include minimal shells (no duplicate controls).

Render layer import fixes:
- In render/RenderManager.js, fix incorrect relative imports:
  - Camera/WorldTransform/HitTestIndex/CanvasAdapter live in render/core/
  - AnimationLoop lives in render/systems/AnimationLoop.js (module) — remove usage of render/core/AnimationLoop.js (global)
  - Nameplate should use render/ui/Nameplate.js; remove window.Nameplate reliance
- Ensure RenderManager only imports module versions and stop referencing window.* duplicates.

Word lists (pick one loader):
- Adopt src/data/WordListManager.js as the single loader and usage API.
- Remove loadXmlWordlists.js and the ad-hoc loader in src/main.js once WordListManager is wired.
- Expose results globally only if legacy code still needs it (temporary bridge): window.racerNamePrefixes/…/racerColors set after WordListManager.loadWordLists().

Save/Load compatibility bridge:
- Until all legacy references are removed, add a small bootstrap bridge after modules initialize:
  - window.Track = window.Track || Track (if Track moved to module)
  - window.Racer = window.Racer || Racer (export Racer as global or via bridge)
  - Keep a TODO to remove this once SaveGame is updated to import classes instead of window.*.

Start flow unification:
- Source of truth: UIManager + GameScreen + RaceManager + ProgressionManager
- Disable legacy DOMInitializer/EventHandlers/init.js flow and wire:
  - “New Game” button (IntroScreen) → eventBus.emit('game:initialize') → generate racers/tracks → hide intro → enable Start Race Week
  - startRaceWeek → eventBus.emit('race:startWeek') → ProgressionManager.startNewRaceWeek() OR existing createNewRaceWeek() replaced by ProgressionManager
  - setupRace → RaceManager.setupRace()
  - startRace → RaceManager.startRace()

Acceptance criteria for this section:
- No 404s from module imports.
- Intro shows, New Game generates racers/tracks, Start Race Week enabled, race renders on canvas, leaderboard updates.

## 2) Consolidate and Delete Redundancies (Safe List)

Delete these after migrating to the module equivalents (verify no references first):
- Legacy global systems:
  - gameState.js (replaced by src/core/GameState.js)
  - loadXmlWordlists.js (use WordListManager)
  - ui/initialization.js (UIManager owns this)
  - ui/components/hud.js (use UI/components/HUDComponent)
- Duplicate render core/loops:
  - render/core/AnimationLoop.js (keep render/systems/AnimationLoop.js)
  - render/core/Camera.js and render/core/WorldTransform.js that attach to window.* if RenderManager and render/index export the module versions
  - One Nameplate duplicate: keep render/ui/Nameplate.js; remove Nameplate.js root
- Old track/flow scripts replaced by RaceManager/ProgressionManager:
  - beginRace.js, processRaceFinish.js, processRacerFinish.js, advanceToNextRace.js, setupTrack.js (migrate logic into RaceManager and RenderManager flow)
- Duplicated word lists:
  - wordlist/const_names.js, wordlist/const_colors.js, wordlist/const_locationSuffixes.js (only after WordListManager fully powers naming/colors)
- Legacy UI handlers:
  - ui/eventHandlers.js, scripts.js, init.js (remove once UIManager + GameScreen control the app)
- Render index exposure decisions:
  - If render/index.js is used as the module barrel, ensure all consumers import from it and delete window.* shims elsewhere.

Tip: Perform “Find All References” before deleting. If legacy files are still referenced, stub them to throw with guidance to migrate.

## 3) Define Single Data Flow

- Game state: Only use src/core/GameState across all modules. Assign window.gameState = gameState.state temporarily for legacy reads only; do not write from globals.
- Name/color data: Only WordListManager API; attach global mirrors for legacy until removed.
- Racer entity: Only src/entities/racer/Racer (+ components) — remove any code creating plain POJOs or relying on legacy generateRacers().
- Track generation: Ensure one path produces Track objects; update SaveGame to import Track/Racer instead of window.* later.

## 4) Render Pipeline Stabilization

- Ensure RenderManager only calls module systems and that it receives race + props from RaceManager.
- Canvas lifecycle:
  - On setupRace, create/resize canvas via CanvasAdapter, set renderManager.setRace(gameState.currentRace, trackProps).
  - On race end, stop the loop and release interactions.
- Camera usage: Keep a single Camera (module). Remove the global Camera.
- Nameplate/Overlay: Only use OverlayRenderer + Nameplate from module folder.

## 5) Start-to-Finish Smoke Test

Run these steps after fixes:
1. Load page: no module 404s; no-js div hidden.
2. Intro shows settings; New Game button visible.
3. Click New Game:
   - Racers/Tracks generated (WordListManager loaded).
   - Settings panel collapses; init button hides; GameScreen shows.
4. Start Race Week → RaceManager/ProgressionManager produce a week with races.
5. Setup Race → canvas appears; track/weather shown; racers visible.
6. Start Race → positions update; leaderboard changes; particles visible on boosts; countdown starts after 3 finishers; race ends; bets settle.
7. No console errors; Save/Load functional.

## 6) Targeted Debugging Playbook

- 404 module import:
  - Fix path OR move files to match import. Prefer moving UI under src/ui or change imports to ../ui/*. Verify with network panel.
- UI not showing:
  - Confirm UIManager.initialize() is called once and showScreen('game') occurs after word lists load.
  - Remove/disable DOMInitializer/ui/eventHandlers legacy initialization.
- New Game button does nothing:
  - Ensure IntroScreen emits game:initialize and that Application listens to it to create entities and hide intro.
- Render blank canvas:
  - Verify renderManager.setRace called with segments > 0 and racers > 0; camera zoom finite; CanvasAdapter.resizeToContainer executed; AnimationLoop running.
- Names undefined:
  - Confirm WordListManager.loadWordLists completed before racer creation; fallback global arrays removed; dynamic functions evaluated once per racer.
- SaveGame exceptions:
  - Until refactor, add a bootstrap bridge: window.Racer = Racer; window.Track = Track.
  - Later, refactor SaveGame to import these classes instead of using window.*.

## 7) Refactor Tasks (Order of Execution)

1. Fix UI module import paths (Option A preferred).
2. Disable legacy initializers (DOMInitializer, ui/eventHandlers, init.js) and wire IntroScreen → game:initialize flow.
3. Standardize word lists through WordListManager; remove ad-hoc loaders.
4. Render imports: correct RenderManager imports to module locations; remove core/global duplicates.
5. Add temporary global bridges for SaveGame (window.Racer/Track).
6. Replace legacy beginRace/process* with RaceManager-controlled update loop.
7. Delete redundant files (see list in Section 2).
8. Update SaveGame to import Racer/Track directly; remove global bridges.
9. Final pass: remove window.gameState and other global mirrors.

## 8) Definition of Done

- Zero console errors on boot and during a complete race.
- No 404s; all imports resolve.
- Single UI flow via UIManager; Intro → GameScreen.
- Single data flow: GameState, WordListManager, Racer component system.
- Render pipeline stable with a single Camera/AnimationLoop/Nameplate implementation.
- Redundant files removed; SaveGame uses module imports; no window.* dependencies remain.

## 9) Final Notes

- Prefer moving files to match imports (keeps import statements stable) over peppering relative paths.
- Keep temporary global bridges minimal and documented; schedule their removal once SaveGame and any legacy consumers are updated.
- Make small commits per step; run the smoke test checklist after each milestone.

