# Requirement R3 Deep-Dive Analysis & Technical Architecture
## K-Pop Demon Hunters (HUNTR/X & Saja Boys) Rhythm & Remix Stage

**Author**: `explorer_survey_2`
**Date**: 2026-09-21T02:16:30Z
**Project**: Boston ↔ Bay Area Creative Cheer-Up Studio (`/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio`)
**Scope**: Complete functional, musical, synthesis, gameplay, persistence, UI/UX, and headless verification architecture for **Requirement R3**.

---

## Executive Summary

Requirement **R3 (K-Pop Demon Hunters Rhythm & Remix Stage)** transforms the web application into a zero-backend, self-contained interactive concert stage and music production studio inspired by the 2025 animated musical *K-Pop Demon Hunters*. Because the application must be 100% standalone with zero external MP3/WAV asset dependencies, all music is generated in real time via a procedural **Web Audio API Multi-Track Synthesizer & Sequencer Engine**.

To guarantee **100% deterministic pass rates under Headless Chromium (Playwright)** with zero `console.error` or uncaught `pageerror` exceptions—even when browser autoplay policies suspend `AudioContext` or no audio output device is present—the engine decouples its **Song & Beatmap Transport Clock (`HybridAudioTransport`)** from hardware audio buffer callbacks, seamlessly falling back to monotonic `performance.now()` or deterministic test-step time advancement whenever `AudioContext.currentTime` is suspended.

---

## 1. Comprehensive Requirement Breakdown (R3)

| Sub-System | Core Functional Requirements | Target User Experience & Hardware Support |
| :--- | :--- | :--- |
| **R3.1 Synthesized Multi-Track Song Library** | Built-in Web Audio API procedural multi-track synthesizer generating 3 full-bodied songs with zero external MP3s:<br>1. ***"Golden"*** (HUNTR/X uplifting power-pop anthem)<br>2. ***"Takedown"*** (High-energy demon-hunter battle beat)<br>3. ***"Soda Pop"*** (Saja Boys upbeat fizzy K-pop groove) | Rich polyphonic synthesis (drums, sub/slap bass, supersaw/FM chords, lead melody, formant vocal hooks, stage SFX), real-time frequency visualizer, independent stem mute/volume controls. |
| **R3.2 Falling-Note Rhythm Game Mode** | Playable 4-lane falling-note rhythm game synchronized to synthesized beats with hit windows & judgements (`PERFECT`, `GREAT`, `GOOD`, `MISS`), combo multipliers (`1x`→`8x FEVER`), glowing stage pyrotechnics, and synchronized lyric/fanchant callouts. | Desktop keyboard (`D`, `F`, `J`, `K` + `Arrow` keys) AND large zero-latency touch/pointer lane buttons (`pointerdown`) for iPad/tablet play. |
| **R3.3 Beat Pad & Song Remix Studio** | Interactive 16-pad (4×4 grid) loop/drum/synth mixer where users layer drums, basslines, synth leads, and CatNap/idol sound effects, adjust BPM, record live performances, replay custom tracks, and save to Gallery. | Touch-friendly neon pads with active loop indicators, bar-quantized loop toggling, one-shot SFX triggers, timestamped performance recorder, and `localStorage` persistence. |
| **R3.4 Headless Verification Architecture** | Deterministic Web Audio API graph initialization, note spawning, simulated key/touch input handling, hit judgement registration, Beat Pad loop toggling, and `localStorage` persistence verification. | Zero `console.error` / `pageerror` in headless Chromium; dual-clock transport (`AudioContext.currentTime` + monotonic fallback) + `window.__CHEER_UP_R3_TEST_API__`. |

---

## 2. Synthesized Multi-Track Song Library Architecture (Web Audio API)

### 2.1 Audio Graph Topology

All synthesis nodes connect to a structured, gain-staged Web Audio API graph that protects against clipping and exposes real-time spectral data for stage visuals:

```
[Track Stem 1: Drums & Percussion] ──► GainNode (stemGain.drums)  ──┐
[Track Stem 2: Synth Bassline]     ──► GainNode (stemGain.bass)   ──┤
[Track Stem 3: Poly Chords / Pads] ──► GainNode (stemGain.chords) ──┼──► DynamicsCompressorNode (Master Limiter)
[Track Stem 4: Lead Synth Hook]    ──► GainNode (stemGain.lead)   ──┤          │
[Track Stem 5: Formant Vocal Hook] ──► GainNode (stemGain.vocal)  ──┤          ▼
[Track Stem 6: Stage & CatNap SFX] ──► GainNode (stemGain.sfx)    ──┘    AnalyserNode (fftSize=256)
                                                                               │
                                                                               ▼
                                                                      Master GainNode (0.0–1.0)
                                                                               │
                                                                               ▼
                                                                    AudioContext.destination
```

- **Master Dynamics Compressor Settings**: `threshold: -14 dB`, `knee: 12 dB`, `ratio: 4:1`, `attack: 0.003s`, `release: 0.15s` (prevents digital clipping when multiple polyphonic stems and Beat Pad one-shots trigger simultaneously).
- **Pre-allocated Noise Buffer**: A single 2-second white-noise `AudioBuffer` is generated once at initialization (`buffer.getChannelData(0)[i] = Math.random() * 2 - 1`) and reused across all snare, hi-hat, clap, crash, and sword-slash synthesis voices to eliminate GC pauses.

### 2.2 Detailed Musical & Synthesis Specifications for the 3 Featured Tracks

#### Track 1: *"Golden"* — HUNTR/X (Rumi, Mira, Zoey)
- **Artistic Direction**: Uplifting, soaring stadium power-pop K-pop anthem celebrating courage, friendship, and shining bright across Boston and the Bay Area.
- **Tempo & Meter**: **128 BPM**, 4/4 time (`1 beat = 468.75 ms`, `16th note = 117.1875 ms`).
- **Key & Scale**: **D Major / B Minor** (`D, E, F#, G, A, B, C#`).
- **Harmonic Progression (4-Bar Anthem Loop across 32-Bar Song Structure)**:
  - **Bar 1**: `Dmaj9` (`D3` bass; `F#4, A4, C#5, E5` chords)
  - **Bar 2**: `Aadd9/C#` (`C#3` bass; `E4, A4, B4, E5` chords)
  - **Bar 3**: `Bm7` (`B2` bass; `D4, F#4, A4, D5` chords)
  - **Bar 4**: `Gmaj7` (beats 1–2: `G2` bass; `B3, D4, F#4`) → `A7sus4` (beats 3–4: `A2` bass; `D4, E4, G4`)
- **Synthesizer Voice Recipes**:
  1. **`drums`**:
     - *Kick*: Sine oscillator with rapid pitch envelope (`155 Hz → 44 Hz` exponential ramp over `45 ms`) + sub body decay (`220 ms`).
     - *Snare*: White noise through `BiquadFilterNode` (`bandpass`, `1100 Hz`, `Q=1.2`) + triangle body oscillator (`185 Hz → 95 Hz` over `70 ms`).
     - *Hi-Hats*: White noise through `BiquadFilterNode` (`highpass`, `7800 Hz`) with tight exponential amplitude decay (`45 ms` closed, `180 ms` open on off-beats).
  2. **`bass`**:
     - Driving octave-pumping bassline (`D2-D3-D2-D3...`) using a `sawtooth` oscillator + `-12 semitone` `square` sub-oscillator routed through a `lowpass` filter (`cutoff: 680 Hz`, `Q: 3.5`) with a pluck filter envelope (`+900 Hz` decay over `90 ms`).
  3. **`chords`**:
     - Stadium Supersaw: 3 detuned `sawtooth` oscillators per chord note (`-12 cents`, `0 cents`, `+12 cents`) with stereo panning (`-0.35`, `0`, `+0.35`) and rhythmic sidechain pumping envelope on every quarter-note kick.
  4. **`lead`**:
     - Soaring K-pop anthem hook (`F#5 - E5 - D5 - A4 - B4 - D5 - F#5 - A5`) synthesized via bright pulse-saw hybrid + subtle 1/8th-note stereo feedback delay (`delayTime: 0.234s`, `feedback: 0.25`).
  5. **`vocalHook`**:
     - Formant-filtered vocal synth singing the Rumi/Mira/Zoey chorus melody: `sawtooth` carrier routed through parallel vowel formant bandpass filters (`F1 = 800 Hz [Q=6]`, `F2 = 1150 Hz [Q=8]` for bright *"Ah/Oh"* idol timbre) modulated by a `5.5 Hz` vibrato LFO (`±7 cents`).
  6. **`sfx`**:
     - Golden lightstick chime sweeps (ascending pentatonic triangle bells `D6-E6-F#6-A6-B6-D7`).

---

#### Track 2: *"Takedown"* — Demon-Hunter Battle Beat (HUNTR/X Battle Theme)
- **Artistic Direction**: High-octane cyberpunk K-pop battle anthem with heavy trap-electro drops, sharp orchestral brass stabs, and demon-slaying choreography energy.
- **Tempo & Meter**: **145 BPM**, 4/4 time (`1 beat = 413.79 ms`, `16th note = 103.45 ms`).
- **Key & Scale**: **E Phrygian Dominant / E Harmonic Minor** (`E, F, G#, A, B, C, D#` / `E, F#, G, A, B, C, D#`).
- **Harmonic Progression (4-Bar Battle Loop across 36-Bar Song Structure)**:
  - **Bar 1**: `Em(add9)` (`E2` 808 glide; `E4, G4, B4, F#5` stabs)
  - **Bar 2**: `Cmaj7#11` (`C2` 808; `E4, G4, B4, F#5` stabs)
  - **Bar 3**: `Am7` (`A1` 808; `C4, E4, G4, B4` stabs)
  - **Bar 4**: `B7(b9)` (`B1` 808 pitch-slide to `E2`; `D#4, F#4, A4, C5` tension stab)
- **Synthesizer Voice Recipes**:
  1. **`drums`**:
     - *808 Battle Kick*: Heavy sine/triangle sub-kick (`190 Hz → 36 Hz` over `55 ms`, sustain tail `320 ms`) with subtle `WaveShaperNode` soft saturation.
     - *Trap Snare & Triplet Rolls*: High-snap noise burst + `210 Hz` body punch, featuring signature K-pop battle 32nd-note snare build-ups at bar transitions.
     - *Rapid Hi-Hat Rolls*: Crisp `8500 Hz` metallic hats with alternating stereo pan (`-0.4` / `+0.4`) and pitch-shifted trap rolls.
  2. **`bass`**:
     - Aggressive Reese / Growl Bass: Dual detuned `sawtooth` oscillators (`-18 cents`, `+18 cents`) passed through a `WaveShaperNode` hyperbolic tangent distortion curve (`Math.tanh(x * 3.2)`) and modulated bandpass/lowpass notch filter.
  3. **`chords`**:
     - Syncopated Battle Brass Stabs: Layered `sawtooth` + `square` chords with sharp `5 ms` attack, `180 ms` decay, and dynamic filter envelope sweep (`2800 Hz → 450 Hz`).
  4. **`lead`**:
     - Fierce syncopated battle riff (`E5 - G5 - F#5 - E5 - B4 - C5 - B4 - G4`) with aggressive pitch-bend attack transients.
  5. **`vocalHook`**:
     - High-energy rap/chant formant synth (`F1 = 700 Hz`, `F2 = 1350 Hz`) with rapid portamento glides (`35 ms` glide time) capturing fierce HUNTR/X battle callouts.
  6. **`sfx`**:
     - Demon-blade energy slash (white noise through resonant bandpass filter sweeping `4500 Hz → 220 Hz` in `140 ms`) and sub-drop impacts.

---

#### Track 3: *"Soda Pop"* — Saja Boys
- **Artistic Direction**: Upbeat, fizzy, effervescent K-pop boy-group groove blending Nu-Disco, Future Funk, sparkling electric pianos, slap bass, and playful soda-bubble sound effects.
- **Tempo & Meter**: **118 BPM**, 4/4 bouncy groove with 16th-note swing (`swing = 0.08`; `1 beat = 508.47 ms`, `16th note = 127.12 ms`).
- **Key & Scale**: **F Major / D Dorian** (`F, G, A, Bb, C, D, E`).
- **Harmonic Progression (4-Bar Fizzy Groove Loop across 32-Bar Song Structure)**:
  - **Bar 1**: `Fmaj9` (`F2` slap bass; `A3, C4, E4, G4` Rhodes EP)
  - **Bar 2**: `Em7` (beats 1–2) → `A7alt` (beats 3–4: `C#4, G4, Bb4, E5`)
  - **Bar 3**: `Dm9` (`D2` slap bass; `F3, A3, C4, E4` Rhodes EP)
  - **Bar 4**: `G13` (beats 1–2: `B3, E4, F4, A4`) → `C9sus4` (beats 3–4: `Bb3, D4, F4, G4`)
- **Synthesizer Voice Recipes**:
  1. **`drums`**:
     - *Disco Kick*: Tight, bouncy punch kick (`140 Hz → 48 Hz` over `38 ms`).
     - *Layered Clap/Rimshot*: 3 micro-staggered noise bursts (`0 ms`, `11 ms`, `23 ms`) through `1400 Hz` bandpass filter for authentic K-pop boy-band handclap texture.
     - *Groove Hats & Shaker*: Swung 16th-note shaker envelope + upbeat open disco hi-hat on every `&` beat.
  2. **`bass`**:
     - Funky Slap Synth Bass: 2-operator FM synthesis (`carrier: sine`, `modulator: sine` at `2:1` frequency ratio with fast `45 ms` modulation index decay) producing snappy thumb-slap and finger-pop octave grooves.
  3. **`chords`**:
     - Sparkling FM Electric Piano (DX7/Rhodes style): Carrier sine + `14:1` crystalline tine modulator with gentle stereo auto-pan tremolo (`4.2 Hz`).
  4. **`lead`**:
     - Bubbly Whistle / Square-Bell Lead playing the catchy Saja Boys hook (`A5 - C6 - A5 - G5 - F5 - D5 - F5 - G5`).
  5. **`vocalHook`**:
     - Boy-group 3-part close harmony formant synth (`F1 = 600 Hz`, `F2 = 1050 Hz`) singing smooth parallel major/minor 3rds and 6ths.
  6. **`sfx`**:
     - Fizzy carbonated bubble pops (sine blips sweeping `600 Hz → 2400 Hz` in `55 ms`) and crisp soda-can tab click-pop transients.

---

## 3. Falling-Note Rhythm Game Engine Architecture

### 3.1 Lane Mapping & Multi-Device Input Contract

| Lane Index | Lane Label | Color / Visual Identity | Desktop Keyboard Keys | iPad / Touch DOM Selector |
| :---: | :---: | :--- | :--- | :--- |
| **Lane 0** | `D` | Neon Magenta (`#FF2E93`) — Rumi | `KeyD`, `ArrowLeft` | `[data-testid="rhythm-lane-btn-0"]` |
| **Lane 1** | `F` | Cyber Cyan (`#00F5D4`) — Mira | `KeyF`, `ArrowDown` | `[data-testid="rhythm-lane-btn-1"]` |
| **Lane 2** | `J` | Solar Gold (`#FFD166`) — Zoey | `KeyJ`, `ArrowUp` | `[data-testid="rhythm-lane-btn-2"]` |
| **Lane 3** | `K` | Lavender Purple (`#9B5DE5`) — Saja/CatNap | `KeyK`, `ArrowRight` | `[data-testid="rhythm-lane-btn-3"]` |

- **Zero-Latency Input Handling**:
  - Desktop keyboard events bind to `window.addEventListener('keydown', handler)` filtering out auto-repeat (`if (event.repeat) return;`).
  - iPad/tablet touch buttons bind to `onPointerDown` (with `touch-action: manipulation` CSS) so touch taps register immediately on finger contact without waiting for `click` synthesis.

### 3.2 Beatmap Representation & Deterministic Generation

Each song defines a structured beatmap array generated deterministically from musical phrase templates + quantized note events:

```typescript
export interface BeatmapNote {
  id: string;                 // Deterministic ID, e.g., "golden-n-0012"
  lane: 0 | 1 | 2 | 3;        // Target lane (0=D, 1=F, 2=J, 3=K)
  hitTimeSec: number;         // Exact target hit time in song transport seconds
  type: 'tap' | 'star_note';  // 'star_note' triggers extra pyrotechnics & bonus points
  lyricCallout?: string;      // Optional synchronized stage callout triggered on hit/arrival
  state: 'pending' | 'hit' | 'missed';
  judgement?: HitJudgement;
}
```

- **Note Scroll Speed & Spawning Window**:
  - `approachTimeSec = 1.6` seconds (notes spawn at the top of the lane when `currentSongTime >= note.hitTimeSec - approachTimeSec`).
  - Normalized vertical position along the lane:
    $$y_{\text{norm}} = \frac{\text{currentSongTime} - (\text{note.hitTimeSec} - \text{approachTimeSec})}{\text{approachTimeSec}}$$
    where $y_{\text{norm}} = 0.0$ is the top spawn line and $y_{\text{norm}} = 1.0$ is the glowing receptor judgement line.

### 3.3 Hit Windows, Judgements & Scoring Math

When the player triggers lane $L$ at transport time $t_{\text{input}}$, the engine finds the earliest unhit note in lane $L$ minimizing $|\Delta t| = |t_{\text{input}} - \text{note.hitTimeSec}|$ within the active hit window (`±135 ms`):

| Judgement | Timing Window ($|\Delta t|$) | Base Score | Combo Effect | Accuracy Weight | Visual & Stage Feedback |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`PERFECT`** | $|\Delta t| \le 45\text{ ms}$ | `1,000` | `combo + 1` | `1.00` | Gold/Rainbow starburst, screen edge glow, lightstick wave surge |
| **`GREAT`** | $45\text{ ms} < |\Delta t| \le 90\text{ ms}$ | `700` | `combo + 1` | `0.80` | Cyber cyan ring burst, neon lane flash |
| **`GOOD`** | $90\text{ ms} < |\Delta t| \le 135\text{ ms}$ | `400` | `combo + 1` | `0.50` | Lavender spark burst |
| **`MISS`** | Unhit past $+135\text{ ms}$ | `0` | Reset to `0` | `0.00` | Dim gray fade-out, `"MISS"` callout (encouraging kid-friendly recovery prompt) |

- **Combo Multiplier Tiers**:
  $$\text{Multiplier}(C) = \begin{cases} 1\times & 0 \le C < 10 \\ 2\times & 10 \le C < 25 \\ 4\times & 25 \le C < 50 \\ 8\times \text{ (HUNTR/X FEVER!)} & C \ge 50 \end{cases}$$
- **Total Score Update**:
  $$\Delta \text{Score} = \text{BaseScore}(\text{judgement}) \times \text{Multiplier}(C) \times (\text{note.type} === \text{'star\_note'} \ ? \ 1.5 : 1.0)$$

### 3.4 Synchronized Lyric & Chant Callout Schedule

Each track embeds time-synchronized stage callouts displayed in a glowing banner above the note highway (`[data-testid="rhythm-lyric-callout"]`):
- ***"Golden"* (HUNTR/X)**:
  - `0.5s`: `"✨ HUNTR/X ON STAGE — RUMI • MIRA • ZOEY! ✨"`
  - `7.5s`: `"💛 WE ARE SHINING GOLDEN IN THE DARK! 💛"`
  - `15.0s`: `"🌉 FROM SAN FRANCISCO BAY TO BOSTON STARS! 🌃"`
  - `22.5s`: `"🔥 GOLDEN ANTHEM DROP — SING IT LOUD! 🔥"`
- ***"Takedown"* (Demon-Hunter Battle)**:
  - `0.5s`: `"⚔️ DEMON HUNTERS ASSEMBLE — TAKEDOWN TIME! ⚔️"`
  - `6.6s`: `"⚡ LIGHTSTICK BLADES ACTIVATED! ⚡"`
  - `13.2s`: `"🔥 PROTECT THE MUSIC — SLASH THE SHADOWS! 🔥"`
  - `19.8s`: `"💥 ULTIMATE HUNTR/X TAKEDOWN DROP! 💥"`
- ***"Soda Pop"* (Saja Boys)**:
  - `0.5s`: `"🥤 SAJA BOYS IN THE HOUSE — POP THAT SODA! 🥤"`
  - `8.1s`: `"🫧 FIZZY GROOVE — BUBBLE UP THE BEAT! 🫧"`
  - `16.2s`: `"💖 SPARKLING IDOL WINK — CATCH THE RHYTHM! 💖"`
  - `24.4s`: `"🌟 SWEET & FIZZY FINALE — SODA POP! 🌟"`

---

## 4. Beat Pad & Song Remix Studio Architecture

### 4.1 16-Pad (4×4) Interactive Loop & Sound Effect Matrix

The Beat Pad Studio provides 16 responsive pads organized into 4 functional rows (`[data-testid="beatpad-cell-0"]` through `[data-testid="beatpad-cell-15"]`):

| Row | Category | Pad 0 | Pad 1 | Pad 2 | Pad 3 |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **Row 0** | **Drums & Beats** (Loop) | `pad-0`: *Golden* Stadium Beat | `pad-1`: *Takedown* 808 Trap Beat | `pad-2`: *Soda Pop* Disco Groove | `pad-3`: K-Pop Snare Build & Crash |
| **Row 1** | **Basslines** (Loop) | `pad-4`: *Golden* Octave Sub Bass | `pad-5`: *Takedown* Reese Growl | `pad-6`: *Soda Pop* Funky Slap Bass | `pad-7`: Starlight Arpeggio Bass |
| **Row 2** | **Synths & Chords** (Loop) | `pad-8`: HUNTR/X Supersaw Chords | `pad-9`: Battle Brass Stabs | `pad-10`: Sparkling Rhodes EP | `pad-11`: Soaring Idol Lead Hook |
| **Row 3** | **CatNap & Idol SFX** (One-Shot) | `pad-12`: CatNap Cozy Purr & Chime | `pad-13`: Crescent Moon Dream Sweep | `pad-14`: HUNTR/X *"Golden!"* Chant | `pad-15`: Saja Boys Soda-Can Pop |

### 4.2 Recording, Replay & Persistence Schema (`localStorage`)

When the user clicks **Record** (`[data-testid="beatpad-record-btn"]`), the studio logs all pad interactions relative to recording start time:

```typescript
export interface RemixEvent {
  timestampMs: number;
  padIndex: number;           // 0..15
  padId: string;
  action: 'loop_on' | 'loop_off' | 'oneshot_trigger';
  bpm: number;
}

export interface SavedRemix {
  id: string;                 // UUID / timestamp ID
  title: string;              // e.g., "Boston Starlight Demon Hunter Remix #1"
  createdAt: string;          // ISO timestamp
  baseTrackId: 'golden' | 'takedown' | 'soda_pop' | 'custom';
  bpm: number;                // 90..160
  durationMs: number;
  initialActivePads: number[]; // Pad indices active when recording started
  events: RemixEvent[];
  stemVolumes: Record<'drums' | 'bass' | 'chords' | 'sfx', number>;
}
```

- **Gallery Integration Contract**:
  - Saved remixes are stored under `localStorage.getItem('cheer_up_studio_gallery_v1')` (or dedicated key `cheer_up_studio_remixes_v1` mirrored into the unified Gallery state) so both **R3 Beat Pad Studio** and **R4 My Creations Gallery** read and render saved remixes across `page.reload()`.

---

## 5. Headless Chromium Audio & Gameplay Verification Strategy

### 5.1 Root Causes of Headless Browser Failures in Audio/Rhythm Apps

1. **Autoplay Suspension (`AudioContext.state === "suspended"`)**:
   - In headless Chromium, `audioCtx.currentTime` stays frozen at `0.000000` until a trusted user gesture resumes it—and even after `audioCtx.resume()`, virtual CI containers without an ALSA/PulseAudio sink may advance `currentTime` erratically or throw DOMExceptions if unguarded.
2. **Frame-Rate Timing Jitter (`requestAnimationFrame`)**:
   - Under heavy parallel test execution, `requestAnimationFrame` callbacks in headless tabs can experience 50–150 ms jitter, which would cause naive frame-delta rhythm games to miss hit windows.

### 5.2 Architectural Solutions for 100% Deterministic Verification

#### Solution A: Hybrid Monotonic Transport Clock (`HybridAudioTransport`)
The transport clock tracks elapsed playback time using a self-healing dual clock:

```typescript
export class HybridAudioTransport {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private startWallTimeMs = 0;
  private startAudioTimeSec = 0;
  private pausedOffsetSec = 0;
  private manualOverrideSec: number | null = null;

  public getCurrentTimeSec(): number {
    if (this.manualOverrideSec !== null) {
      return this.manualOverrideSec;
    }
    if (!this.isPlaying) {
      return this.pausedOffsetSec;
    }
    const wallElapsedSec = (performance.now() - this.startWallTimeMs) / 1000;
    if (this.audioCtx && this.audioCtx.state === 'running') {
      const audioElapsedSec = this.audioCtx.currentTime - this.startAudioTimeSec;
      // If hardware audio clock is healthy and within 80ms of wall clock, prefer audio clock;
      // otherwise seamlessly use monotonic wall clock so headless tests never stall at 0.0s!
      if (audioElapsedSec > 0 && Math.abs(audioElapsedSec - wallElapsedSec) < 0.08) {
        return this.pausedOffsetSec + audioElapsedSec;
      }
    }
    return this.pausedOffsetSec + wallElapsedSec;
  }

  public setDeterministicTestTimeSec(timeSec: number): void {
    this.manualOverrideSec = timeSec;
  }
}
```

#### Solution B: Safe Web Audio API Wrapper (`SafeAudioGraph`)
- All Web Audio node creation is wrapped in defensive guards:
  - `new (window.AudioContext || (window as any).webkitAudioContext)()` inside `try / catch`.
  - Every `audioCtx.resume()` call chains `.catch(() => {})` so unhandled promise rejections NEVER occur.
  - All `exponentialRampToValueAtTime(value, endTime)` calls clamp `value = Math.max(0.0001, value)` and `endTime = Math.max(audioCtx.currentTime + 0.001, endTime)` to guarantee zero `RangeError` / `InvalidAccessError` exceptions across all browsers.

#### Solution C: Deterministic Test & Inspection Bridge (`window.__CHEER_UP_R3_TEST_API__`)
Expose a clean, strongly typed inspection and simulation API on `window.__CHEER_UP_R3_TEST_API__`:

```typescript
export interface CheerUpR3TestApi {
  // Song Synthesis Verification
  getAvailableSongs: () => Array<{ id: string; title: string; artist: string; bpm: number }>;
  initializeAndVerifySongGraph: (songId: 'golden' | 'takedown' | 'soda_pop') => {
    initialized: boolean;
    songId: string;
    activeStems: string[];
    nodeCount: number;
    hasErrors: boolean;
  };
  // Rhythm Game Verification
  startRhythmGame: (songId: 'golden' | 'takedown' | 'soda_pop') => void;
  setTransportTimeSec: (timeSec: number) => void;
  triggerLaneInput: (lane: 0 | 1 | 2 | 3, inputType?: 'keyboard' | 'touch') => HitJudgement | null;
  getRhythmGameState: () => {
    isPlaying: boolean;
    songId: string;
    currentTimeSec: number;
    score: number;
    combo: number;
    maxCombo: number;
    multiplier: number;
    judgements: Record<'PERFECT' | 'GREAT' | 'GOOD' | 'MISS', number>;
    visibleNotesCount: number;
    currentLyricCallout: string;
  };
  // Beat Pad Studio Verification
  toggleBeatPadCell: (padIndex: number) => boolean;
  getBeatPadState: () => {
    bpm: number;
    activePadIndices: number[];
    isRecording: boolean;
    isReplaying: boolean;
    recordedEventsCount: number;
  };
  saveCurrentRemixToGallery: (title: string) => SavedRemix;
}
```

### 5.3 End-to-End Playwright Verification Scenarios (Acceptance Criterion #4)

1. **Multi-Track Synthesis Verification**:
   - Navigate to the K-Pop Demon Hunters Stage (`[data-testid="nav-tab-stage"]`).
   - Sequentially select *Golden*, *Takedown*, and *Soda Pop* (`[data-testid="song-card-golden"]`, `[data-testid="song-card-takedown"]`, `[data-testid="song-card-soda_pop"]`).
   - Assert zero `console.error` / `pageerror`, verify Web Audio synthesis graph initialization (`activeStems.length === 6`), and confirm audio visualizer canvas renders non-zero pixel data.
2. **4-Lane Falling-Note Rhythm Game Verification**:
   - Launch *Golden* in Rhythm Game Mode (`[data-testid="start-rhythm-game-btn"]`).
   - Verify falling notes spawn in lanes 0–3 (`visibleNotesCount > 0`).
   - Simulate both keyboard (`page.keyboard.press('KeyD')`, `'KeyF'`, `'KeyJ'`, `'KeyK'`) and touch/click (`page.click('[data-testid="rhythm-lane-btn-0"]')`) inputs aligned with note arrival times.
   - Assert `PERFECT` / `GREAT` / `GOOD` judgements increment, combo counter and score increase, and lyric callout banner updates dynamically.
3. **Beat Pad & Song Remix Studio Verification**:
   - Switch to Beat Pad Studio (`[data-testid="mode-tab-beatpad"]`).
   - Toggle multiple drum, bass, synth, and CatNap SFX pads (`[data-testid="beatpad-cell-0"]`, `[data-testid="beatpad-cell-4"]`, `[data-testid="beatpad-cell-8"]`, `[data-testid="beatpad-cell-12"]`).
   - Record a short sequence, stop recording, click Save Remix to Gallery, reload the page (`await page.reload()`), and verify the saved remix persists in `localStorage` and appears in the Gallery.
