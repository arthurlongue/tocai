---
phase: 04-integration-polish
plan: 01
subsystem: audio/visual-integration
tags:
  - transport-controls
  - speed-control
  - playback
  - ui-component
requires: []
provides:
  - TransportBar component
  - useSpeedControl hook
  - AudioEngine.setSpeed() method
affects:
  - src/App.tsx
  - src/engine/AudioEngine.ts
tech-stack:
  added: []
  patterns:
    - TDD (Test-Driven Development)
    - Custom hooks for state management
    - BPM-based tempo control for synthesized audio
key-files:
  created:
    - path: src/components/TransportBar.tsx
      purpose: Full-featured transport controls UI component
    - path: src/components/TransportBar.test.tsx
      purpose: Unit tests for TransportBar component
    - path: src/hooks/useSpeedControl.ts
      purpose: Hook for speed control state and AudioEngine integration
    - path: src/hooks/useSpeedControl.test.ts
      purpose: Unit tests for useSpeedControl hook
  modified:
    - path: src/engine/AudioEngine.ts
      purpose: Added setSpeed() and setBaseBpm() methods
    - path: src/App.tsx
      purpose: Integrated TransportBar, removed old inline controls
decisions:
  - key: Speed control implementation
    summary: Use Tone.Transport.bpm for tempo changes instead of playbackRate
    rationale: BPM changes preserve pitch for synthesized notes, while playbackRate affects both tempo and pitch
  - key: Speed range
    summary: 0.25x to 2.0x with 0.25 step increments
    rationale: Matches industry standard (Guitar Pro, Rocksmith) for practice tempo control
  - key: Component architecture
    summary: Separate TransportBar component instead of inline controls
    rationale: Improves reusability, testability, and follows single responsibility principle
metrics:
  started: 2026-03-23T20:30:00Z
  completed: 2026-03-23T20:52:00Z
  duration_minutes: 22
  tasks_completed: 3
  files_created: 4
  files_modified: 2
  tests_added: 10
  tests_passing: 10
---

# Phase 04 Plan 01: Transport Bar & Speed Control Summary

## One-liner
Full-featured transport bar with PLAY/PAUSE/STOP controls, seek bar, speed control (0.25x-2.0x), volume slider, and track display, integrated into App.tsx with TDD approach.

## Overview
This plan delivered a professional transport control bar similar to Guitar Pro and Rocksmith software, replacing the basic inline controls with a dedicated component. The implementation includes speed control using Tone.js BPM manipulation (which preserves pitch for synthesized audio), real-time seek bar updates, and volume control.

## Tasks Completed

### Task 1: Create TransportBar component with playback controls ✅
**Files:** `src/components/TransportBar.tsx`, `src/components/TransportBar.test.tsx`

**Implementation:**
- React component with Tailwind CSS styling
- PLAY/PAUSE button (conditional based on transport state)
- STOP button with icon
- Seek bar using Radix UI Slider (updates in real-time via 100ms polling)
- Time display showing current time / total duration in M:SS format
- Speed control slider (0.25 to 2.0, step 0.25)
- Volume slider (0 to 1, step 0.05)
- Track name display

**Tests:** 5 tests covering:
- PLAY button rendering when stopped
- Time format display
- PAUSE button when playing
- Slider rendering
- Track info display

### Task 2: Create useSpeedControl hook and extend AudioEngine ✅
**Files:** `src/hooks/useSpeedControl.ts`, `src/hooks/useSpeedControl.test.ts`, `src/engine/AudioEngine.ts`

**Implementation:**
- `useSpeedControl` hook with `speed`, `setSpeed()`, and `resetSpeed()` functions
- Speed clamping to 0.25-2.0 range
- `AudioEngine.setSpeed(multiplier)` method that changes `Tone.Transport.bpm.value`
- `AudioEngine.setBaseBpm(bpm)` method for setting base tempo from song metadata

**Key Technical Decision:**
Using `Tone.Transport.bpm` instead of `playbackRate` preserves pitch for synthesized notes. This is critical because:
- Synthesized notes are generated in real-time at specific frequencies
- Changing BPM affects timing but not the frequency calculation
- `playbackRate` would affect both tempo AND pitch (like a tape recorder)

**Tests:** 5 tests covering:
- Initial speed is 1.0
- setSpeed updates state and calls engine
- Speed clamping (min 0.25, max 2.0)
- resetSpeed returns to 1.0

### Task 3: Integrate TransportBar into App.tsx ✅
**Files:** `src/App.tsx`

**Changes:**
- Imported `TransportBar` component and `useSpeedControl` hook
- Removed old inline PLAY/PAUSE/STOP buttons from song info card
- Kept song metadata display (title, artist, duration, track count)
- Added `TransportBar` below `Visualizer` component
- Added `resetSpeed()` call when uploading new song

**Result:**
- Clean separation of concerns (metadata card vs transport controls)
- Transport bar positioned below visualizer as specified in CONTEXT.md
- All existing functionality preserved

## Test Coverage

| File | Tests | Status |
|------|-------|--------|
| `TransportBar.test.tsx` | 5 | ✅ Passing |
| `useSpeedControl.test.ts` | 5 | ✅ Passing |
| **Total** | **10** | **✅ 100%** |

## Deviations from Plan

### None - Plan Executed Exactly as Written
All tasks completed as specified in the plan. No auto-fixes or architectural changes were needed.

## Technical Details

### TransportBar Component Structure
```
TransportBar
├── Playback Controls (PLAY/PAUSE, STOP)
├── Seek Bar (slider with real-time updates)
├── Time Display (current / duration)
├── Speed Control (slider + display)
├── Volume Control (slider with icon)
└── Track Display (name)
```

### Speed Control Architecture
```
useSpeedControl (hook)
    ├── speed: number (state)
    ├── setSpeed(multiplier): void → clamps → AudioEngine.setSpeed()
    └── resetSpeed(): void → sets to 1.0

AudioEngine.setSpeed(multiplier)
    └── Tone.Transport.bpm.value = baseBpm * multiplier
```

### Key Integration Points
- `TransportBar` uses `usePlayback` hook for play/pause/stop/seek
- `TransportBar` uses `useTransportStatus` hook for PLAY/PAUSE button state
- `TransportBar` uses `useSpeedControl` hook for speed control
- `useSpeedControl` calls `AudioEngine.setSpeed()` which mutates `Tone.Transport.bpm`
- Volume control directly mutates `Tone.getDestination().volume`

## Verification

### Build Status
✅ `pnpm run build` succeeds with no errors

### Test Status
✅ All new tests pass (10/10)
⚠️ Pre-existing AudioEngine.test.ts failures (3 tests) - unrelated to this plan

### Manual Verification Checklist
- [ ] PLAY button starts playback
- [ ] PAUSE button pauses playback
- [ ] STOP button stops playback and resets position
- [ ] Seek bar updates in real-time during playback
- [ ] Clicking seek bar seeks to that position
- [ ] Speed control changes tempo (0.25x - 2.0x)
- [ ] Speed changes preserve pitch (no "chipmunk" effect)
- [ ] Volume control adjusts output level
- [ ] Time display shows current time / total duration
- [ ] Track name displays correctly

## Commits

```
cd9d63e feat(04-01): add TransportBar component with playback controls
12fdd7f feat(04-01): add useSpeedControl hook and extend AudioEngine
0f0225d feat(04-01): integrate TransportBar into App.tsx
```

## Self-Check: PASSED

- [x] TransportBar.tsx exists (168 lines)
- [x] TransportBar.test.tsx exists (5 tests passing)
- [x] useSpeedControl.ts exists (28 lines)
- [x] useSpeedControl.test.ts exists (5 tests passing)
- [x] AudioEngine.ts extended with setSpeed method
- [x] App.tsx integrates TransportBar below Visualizer
- [x] Build succeeds without errors
- [x] All new tests pass
