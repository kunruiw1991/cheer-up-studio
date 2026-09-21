# Handoff Report — `explorer_survey_2`
## Survey & Architecture for Requirement R3 (K-Pop Demon Hunters Rhythm & Remix Stage)

**Agent**: `explorer_survey_2`
**Handoff Type**: Hard Handoff (Task Complete)
**Date**: 2026-09-21T02:19:30Z
**Parent Orchestrator**: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
**Full Technical Analysis**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_2/analysis.md`

---

## 1. Observation

1. **Authoritative Requirement Inspection (`/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/ORIGINAL_REQUEST.md`)**:
   - **Lines 27–35 (Requirement R3)**:
     - **Synthesized Multi-Track Song Library**: Built-in Web Audio API multi-track arrangements (zero external MP3 dependencies) capturing the distinct energy of:
       1. *"Golden"* (HUNTR/X uplifting power-pop anthem)
       2. *"Takedown"* (high-energy demon-hunter battle beat)
       3. *"Soda Pop"* (Saja Boys upbeat fizzy K-pop groove)
     - **Falling-Note Rhythm Game Mode**: Playable 4-lane rhythm game (keyboard keys `D`, `F`, `J`, `K` + full touch/click lane buttons for iPad) synchronized to synthesized beats with hit judgements (`PERFECT`, `GREAT`, `GOOD`, plus `MISS` tracking), combo multipliers, glowing stage pyrotechnics, and lyric/chant callouts.
     - **Beat Pad & Song Remix Studio**: Interactive loop/drum/synth pad where users layer drums, basslines, synth leads, and CatNap/idol sound effects to compose, record, and replay custom demon-hunter tracks.
   - **Lines 38–39 (Requirement R4 Cross-Module Persistence)**:
     - **My Creations Gallery**: Persistent `localStorage` gallery saving custom tattoos, CatNap outfits, and song remixes across page reloads (`page.reload()`).
   - **Lines 44 & 47 (Acceptance Criteria)**:
     - Zero `console.error` or uncaught `pageerror` exceptions across all views in headless Chromium.
     - Programmatic verification confirms Web Audio API synthesis graph initializes without errors for all 3 featured tracks (*Golden*, *Takedown*, *Soda Pop*), the 4-lane rhythm game spawns notes and registers hit judgements/combos on simulated key/touch inputs, and the Beat Pad mixer toggles loops cleanly.

---

## 2. Logic Chain

1. **Zero-MP3 Multi-Track Synthesis Requirement (Observation 1, Lines 29–32) $\rightarrow$ Procedural 6-Stem Web Audio Graph**:
   - Because the application must run standalone without external MP3 files, each of the 3 tracks must be synthesized procedurally in Web Audio API across 6 gain-staged stems (`drums`, `bass`, `chords`, `lead`, `vocalHook`, `sfx`) routed through a master `DynamicsCompressorNode` (`threshold: -14dB`, `ratio: 4:1`) and `AnalyserNode` (`fftSize: 256`).
   - To make each track musically authentic and distinct:
     - ***"Golden"* (HUNTR/X)**: **128 BPM**, D Major (`Dmaj9 – Aadd9/C# – Bm7 – Gmaj7/A7sus4`), stadium 4-on-the-floor kick/snare, octave saw-sub bass, 3-voice detuned supersaw pads with sidechain pumping, bright lead hook, and formant vocal synth (`F1=800Hz, F2=1150Hz`).
     - ***"Takedown"* (Demon-Hunter Battle Beat)**: **145 BPM**, E Phrygian Dominant (`Em(add9) – Cmaj7#11 – Am7 – B7(b9)`), heavy 808 pitch-drop kick, trap triplet snare rolls, `WaveShaperNode` distorted Reese growl bass, sharp orchestral brass stabs, fierce battle lead, and blade-slash noise sweeps.
     - ***"Soda Pop"* (Saja Boys)**: **118 BPM** with `0.08` 16th-note swing, F Major / D Dorian (`Fmaj9 – Em7/A7alt – Dm9 – G13/C9sus4`), bouncy disco kick + layered handclaps, 2-operator FM slap bass, sparkling DX7/Rhodes electric piano, bubbly whistle lead, and carbonated bubble pitch-blips.
2. **Desktop + iPad Rhythm Game Requirement (Observation 1, Line 33) $\rightarrow$ Unified 4-Lane Receptor & Judgement Engine**:
   - Mapping Lane 0 (`D`/`ArrowLeft`), Lane 1 (`F`/`ArrowDown`), Lane 2 (`J`/`ArrowUp`), and Lane 3 (`K`/`ArrowRight`) alongside large `onPointerDown` touch buttons (`[data-testid="rhythm-lane-btn-0..3"]`) guarantees zero-latency input on both desktop keyboards and iPads.
   - Timing windows (`PERFECT <= 45ms`, `GREAT <= 90ms`, `GOOD <= 135ms`, `MISS > 135ms`) feed a combo multiplier (`1x` $\rightarrow$ `2x` at 10 $\rightarrow$ `4x` at 25 $\rightarrow$ `8x FEVER` at 50), stage particle pyrotechnics, and phrase-synchronized lyric/fanchant banners (`[data-testid="rhythm-lyric-callout"]`).
3. **Beat Pad & Gallery Persistence Requirement (Observation 1, Lines 34 & 38) $\rightarrow$ 16-Pad Quantized Matrix + Event Recorder**:
   - A 4×4 pad grid (Row 0: Drum loops, Row 1: Bassline loops, Row 2: Synth/Chord loops, Row 3: CatNap/Idol one-shot SFX) with BPM control (`90–160 BPM`), live timestamped event recording (`RemixEvent[]`), deterministic replay, and `localStorage` Gallery serialization (`SavedRemix`).
4. **Headless Chromium Determinism Requirement (Observation 1, Lines 44 & 47) $\rightarrow$ `HybridAudioTransport` + `window.__CHEER_UP_R3_TEST_API__`**:
   - In headless Chromium, `AudioContext` frequently initializes in `"suspended"` state where `audioCtx.currentTime === 0`.
   - Therefore, `HybridAudioTransport` automatically falls back to monotonic `performance.now() / 1000` whenever `audioCtx.state !== 'running'` or `audioCtx.currentTime` stalls, AND exposes deterministic time-stepping (`setTransportTimeSec`) + state inspection via `window.__CHEER_UP_R3_TEST_API__`.

---

## 3. Caveats

- **Browser Autoplay Gesture Unlock**: On real iOS Safari / desktop browsers, audible output starts immediately upon the user's first pointer/key interaction (`audioCtx.resume().catch(() => {})` attached globally to pointer/key listeners). In headless Playwright tests without audio hardware, all visual, beatmap, judgement, combo, and Beat Pad state transitions progress 100% deterministically via `HybridAudioTransport`.

---

## 4. Conclusion

The Orchestrator (`PROJECT.md`) and R3 Implementation / Testing Workers should adopt the complete module architecture specified in `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_2/analysis.md`:
1. Implement `SoundEngine` & `HybridAudioTransport` with 6-stem Web Audio API synthesis recipes for *"Golden"* (128 BPM, D Major), *"Takedown"* (145 BPM, E Phrygian Dominant), and *"Soda Pop"* (118 BPM, F Major).
2. Implement the 4-lane Falling-Note Rhythm Game component supporting `D`/`F`/`J`/`K` + iPad `pointerdown` lane buttons, `PERFECT`/`GREAT`/`GOOD`/`MISS` judgements, combo fever multipliers, canvas stage pyrotechnics, and synchronized lyric callouts.
3. Implement the 16-pad Beat Pad & Song Remix Studio with live loop toggling, CatNap/idol SFX triggers, event recorder/replayer, and `localStorage` Gallery persistence.
4. Expose `window.__CHEER_UP_R3_TEST_API__` and standardized `data-testid` attributes across all R3 controls.

---

## 5. Verification Method

Independent verification in Playwright / Headless Chromium must execute and assert the following:
1. **Inspect Analysis Document**:
   - View `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_2/analysis.md` for complete data models, synthesis parameters, DOM selectors, and test contracts.
2. **Automated Playwright Verification Assertions**:
   - **Zero Errors**: Assert `consoleErrors.length === 0` and `pageErrors.length === 0` across all R3 interactions.
   - **3-Song Synthesis Graph Initialization**: Invoke `window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph(songId)` for `'golden'`, `'takedown'`, and `'soda_pop'` $\rightarrow$ assert `initialized === true`, `activeStems.length === 6`, and `hasErrors === false`.
   - **4-Lane Rhythm Gameplay**: Start *Golden* rhythm game, verify falling notes spawn (`visibleNotesCount > 0`), dispatch `KeyD` / `KeyF` / `KeyJ` / `KeyK` and `[data-testid="rhythm-lane-btn-0..3"]` clicks aligned with note hit times $\rightarrow$ assert `score > 0`, `combo >= 1`, and hit judgements (`PERFECT`/`GREAT`/`GOOD`) increment.
   - **Beat Pad & Persistence**: Toggle Beat Pad cells `0, 4, 8, 12`, record events, save remix to Gallery, execute `await page.reload()`, and assert saved remix persists in `localStorage`.
