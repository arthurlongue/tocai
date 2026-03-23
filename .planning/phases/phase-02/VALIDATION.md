# Phase 2 Validation: Basic Audio Engine

## Requirement Coverage

| ID | Description | Plan | Status |
|----|-------------|------|--------|
| AUDIO-01 | Context Initialization (Awaited Tone.start()) | 02-02 | [ ] |
| AUDIO-02 | String-Specific Synthesis (6-string synth) | 02-01 | [ ] |
| AUDIO-03 | Note Scheduling (Tone.Part) | 02-02 | [ ] |
| AUDIO-04 | Transport Controls (Play/Pause/Stop/Seek) | 02-02 | [ ] |
| AUDIO-05 | UI Synchronization (Tone.Draw) | 02-02 | [ ] |

## Verification Plan

### Automated Tests
- [ ] `src/engine/AudioEngine.test.ts`: Verify singleton and note triggering.
- [ ] `tsc` validation for `StringSynth.ts`, `AudioEngine.ts`, and hooks.

### Manual Verification (Phase 4 Integration)
*Note: Full manual verification requires the UI from Phase 3/4. For Phase 2, we rely on unit tests and type safety.*

1. **Audio Resume**: Verify that `Tone.start()` is only called on user gesture.
2. **Polyphony**: Verify that multiple strings can play simultaneously.
3. **Transport**: Verify that `Tone.Transport` state matches the `useTransportStatus` hook.
4. **Sync**: Verify `Tone.Draw` callbacks fire at expected musical times (log to console).

## Goal-Backward Verification

### Observable Truths
- [ ] "Play" action resumes audio context without browser warnings.
- [ ] Six independent string synths are active and audible.
- [ ] Notes are scheduled and played at the correct `Tone.Transport` time.
- [ ] UI sync events fire via `Tone.Draw` exactly when audio triggers.

### Key Artifacts
- [ ] `src/engine/AudioEngine.ts` (Singleton coordinator)
- [ ] `src/engine/StringSynth.ts` (6x synth wrapper)
- [ ] `src/hooks/usePlayback.ts` (User actions)
- [ ] `src/hooks/useTransportStatus.ts` (Reactive state)
