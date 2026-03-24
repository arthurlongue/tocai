# Phase 04 Gap Closure - Handoff Notes

## Session Date: 2026-03-23

## What Was Attempted

### Canvas Sync with Speed Control

**Problem:** Canvas scrolling speed doesn't change when user adjusts playback speed (0.25x - 2.0x)

**Root Cause Identified:** 
- AudioEngine.setSpeed() changes `Tone.Transport.bpm.value`
- This causes `Tone.Transport.seconds` to advance at the adjusted rate automatically
- Previous code was applying speed multiplier TWICE (once via BPM, once in Renderer)

**Current Implementation:**
```typescript
// Renderer.ts - uses Transport.seconds directly
const transportTime = Tone.getTransport().seconds;
const currentTime = Math.max(0, transportTime - delay);
```

**Why It Should Work:**
- At 0.25x speed: BPM = 30, Transport.seconds advances at 0.25x rate
- At 2.0x speed: BPM = 240, Transport.seconds advances at 2x rate
- No multiplication needed in Renderer

**Why It Doesn't Work (Symptoms):**
1. Notes don't change scroll speed when speed slider changes
2. Seek doesn't work correctly (minimap and slider)
3. Playhead vanishes off minimap canvas
4. Song doesn't end at right position
5. Audio sync drift at slow speeds (0.25x)

## Files Modified (Latest Commits)

```
571675d cleanup(04-04): remove debug logging
9e2fbe6 fix(04-04): restore Visualizer initialization effect
3f1295f cleanup(04-04): remove unnecessary renderer reset calls
f0a3a79 fix(04-04): use Tone.Transport.seconds directly (BPM handles speed)
b251923 fix(04-04): minimap improvements
```

## Key Files to Debug

1. **src/engine/AudioEngine.ts** - `setSpeed()` changes BPM
2. **src/engine/Renderer.ts** - Uses `Tone.Transport.seconds` for time
3. **src/components/Minimap.tsx** - Playhead rendering
4. **src/engine/MinimapRenderer.ts** - Playhead position calculation
5. **src/hooks/useSpeedControl.ts** - Speed state management

## Debugging Steps for Tomorrow

### Step 1: Verify BPM is actually changing
```javascript
// In browser console while playing:
Tone.getTransport().bpm.value  // Should change when speed slider moves
```

### Step 2: Verify Transport.seconds rate changes
```javascript
// Log Transport.seconds every second at different speeds:
// At 1x: should advance 1 second per real second
// At 0.5x: should advance 0.5 seconds per real second
// At 2x: should advance 2 seconds per real second
```

### Step 3: Check if Renderer is receiving speed updates
```javascript
// Add back debug logging temporarily:
console.log("Speed:", speed, "Transport BPM:", Tone.getTransport().bpm.value);
```

### Step 4: Verify minimap playhead clamping
```typescript
// MinimapRenderer.ts line ~75:
const playheadX = Math.min(width, Math.max(0, currentTime * pixelsPerSecond));
// Should clamp but apparently doesn't
```

## Hypotheses to Test

1. **BPM change not taking effect** - Maybe Tone.Transport needs restart?
2. **React state not propagating** - Speed changes not reaching Renderer?
3. **Minimap using wrong time source** - Should use same time as main renderer
4. **Delay compensation wrong** - The 0.05 constant might need adjustment

## Visual Redesign (Not Started)

Still need to address UAT feedback:
- Color palette too dark
- Note contrast issues
- Add note tails for duration
- Remove white rings
- Improve spacing
- Remove bottom section

## How to Resume

```bash
# 1. Check current state
git log --oneline -5
git status

# 2. Start dev server
pnpm run dev

# 3. Open browser console and test speed changes
# Watch for BPM changes and Transport.seconds behavior

# 4. Continue debugging from here
```

## Recommended Approach

**Option A: Fresh debugging session**
- Add back debug logging
- Verify each piece of the chain independently
- Start from AudioEngine → Transport → Renderer

**Option B: Simplify the approach**
- Remove BPM-based speed control
- Use a simpler time-stretching approach
- Keep visual time separate from audio time

**Option C: Get it working, then make it pretty**
- Focus ONLY on canvas sync for tomorrow
- Leave visual redesign for separate session
- One problem at a time

---

**Good luck tomorrow!** 🎸
