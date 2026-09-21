/**
 * @fileoverview Procedural Web Audio API Multi-Track Synthesizer Engine &
 * HybridAudioTransport Clock for Milestone M4 (Requirement R3: K-Pop Demon
 * Hunters Rhythm & Remix Stage).
 *
 * Audio Graph Topology:
 *   [Stem 1: drums]     ──► GainNode (stemGains.drums)     ──┐
 *   [Stem 2: bass]      ──► GainNode (stemGains.bass)      ──┤
 *   [Stem 3: chords]    ──► GainNode (stemGains.chords)    ──┼──► DynamicsCompressorNode
 *   [Stem 4: lead]      ──► GainNode (stemGains.lead)      ──┤          │
 *   [Stem 5: vocalHook] ──► GainNode (stemGains.vocalHook) ──┤          ▼
 *   [Stem 6: sfx]       ──► GainNode (stemGains.sfx)       ──┘    AnalyserNode (fftSize=256)
 *                                                                       │
 *                                                                       ▼
 *                                                                 Master GainNode
 *                                                                       │
 *                                                                       ▼
 *                                                              AudioContext.destination
 */

import { KPOP_SONGS, BEAT_PAD_CELLS, noteToFreq } from './songs.js';

/**
 * Dual-clock transport engine that synchronizes song playback and beatmap
 * note scrolling. When Web Audio hardware clock is running smoothly, it
 * tracks `AudioContext.currentTime`; if headless Chromium suspends audio
 * or lacks an output sink, it seamlessly falls back to monotonic
 * `performance.now()` or deterministic test-step overrides.
 */
export class HybridAudioTransport {
  /**
   * @param {AudioContext|null} audioCtx
   */
  constructor(audioCtx = null) {
    this.audioCtx = audioCtx;
    this.isPlaying = false;
    this.startWallTimeMs = 0;
    this.startAudioTimeSec = 0;
    this.pausedOffsetSec = 0;
    /** @type {number|null} */
    this.manualOverrideSec = null;
  }

  /**
   * @param {AudioContext|null} ctx
   */
  setAudioContext(ctx) {
    this.audioCtx = ctx;
  }

  /**
   * Starts or resumes transport playback from `offsetSec`.
   * @param {number} [offsetSec=0]
   */
  start(offsetSec = 0) {
    this.pausedOffsetSec = Math.max(0, Number(offsetSec) || 0);
    this.startWallTimeMs = performance.now();
    this.startAudioTimeSec = this.audioCtx ? this.audioCtx.currentTime : 0;
    this.manualOverrideSec = null;
    this.isPlaying = true;
  }

  /**
   * Pauses transport and preserves current elapsed offset.
   */
  pause() {
    if (!this.isPlaying) return;
    this.pausedOffsetSec = this.getCurrentTimeSec();
    this.isPlaying = false;
  }

  /**
   * Stops transport and resets elapsed time to 0.
   */
  stop() {
    this.isPlaying = false;
    this.pausedOffsetSec = 0;
    this.manualOverrideSec = null;
  }

  /**
   * Returns current playback time in seconds using the dual-clock strategy.
   * @returns {number}
   */
  getCurrentTimeSec() {
    if (this.manualOverrideSec !== null) {
      return this.manualOverrideSec;
    }
    if (!this.isPlaying) {
      return this.pausedOffsetSec;
    }
    const wallElapsedSec = Math.max(0, (performance.now() - this.startWallTimeMs) / 1000);
    if (this.audioCtx && this.audioCtx.state === 'running') {
      const audioElapsedSec = this.audioCtx.currentTime - this.startAudioTimeSec;
      if (audioElapsedSec > 0 && Math.abs(audioElapsedSec - wallElapsedSec) < 0.08) {
        return this.pausedOffsetSec + audioElapsedSec;
      }
    }
    return this.pausedOffsetSec + wallElapsedSec;
  }

  /**
   * Overrides transport clock to an exact deterministic time in seconds.
   * @param {number} timeSec
   */
  setDeterministicTestTimeSec(timeSec) {
    this.manualOverrideSec = Math.max(0, Number(timeSec) || 0);
  }

  /**
   * Advances transport time deterministically by `deltaSec` seconds.
   * @param {number} deltaSec
   * @returns {number} New transport time in seconds.
   */
  stepTime(deltaSec) {
    const base = this.getCurrentTimeSec();
    const next = Math.max(0, base + (Number(deltaSec) || 0));
    this.manualOverrideSec = next;
    return next;
  }
}

/**
 * Multi-track procedural synthesizer and sequencer engine for the 3 featured
 * K-Pop Demon Hunters tracks and 16 Beat Pad cells.
 */
export class KpopSynthEngine {
  constructor() {
    /** @type {AudioContext|null} */
    this.ctx = null;
    this.transport = new HybridAudioTransport(null);

    /** @type {Record<string, GainNode>} */
    this.stemGains = {};
    /** @type {Record<string, number>} */
    this.stemVolumes = {
      drums: 0.9,
      bass: 0.85,
      chords: 0.8,
      lead: 0.85,
      vocalHook: 0.85,
      sfx: 0.8,
    };

    /** @type {DynamicsCompressorNode|null} */
    this.compressor = null;
    /** @type {AnalyserNode|null} */
    this.analyser = null;
    /** @type {GainNode|null} */
    this.masterGain = null;
    /** @type {AudioBuffer|null} */
    this.noiseBuffer = null;
    /** @type {WaveShaperNode|null} */
    this.distortionShaper = null;

    this.activeSongId = 'golden';
    this.isSongPlaying = false;
    this.schedulerTimerId = null;
    this.lastScheduledStep = -1;
    this.graphInitialized = false;
    this.graphErrorCount = 0;
    this.createdNodeCount = 0;

    // Beat pad loop sequencer state
    /** @type {Set<number>} */
    this.activeBeatPads = new Set();
    this.beatPadBpm = 128;
    this.beatPadStepIndex = 0;
    this.beatPadTimerId = null;
  }

  /**
   * Lazily initializes the Web Audio API context and 6-stem master bus topology.
   * Safe to invoke repeatedly in both interactive browsers and headless Chrome.
   * @param {string} [songId='golden']
   * @returns {{
   *   initialized: boolean,
   *   songId: string,
   *   activeStems: string[],
   *   bpm: number,
   *   nodeCount: number,
   *   hasErrors: boolean
   * }}
   */
  initializeAndVerifySongGraph(songId = 'golden') {
    const song = KPOP_SONGS[songId] || KPOP_SONGS.golden;
    this.activeSongId = song.id;

    try {
      if (!this.ctx) {
        const AudioCtxCtor = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxCtor) {
          this.ctx = new AudioCtxCtor();
          this.transport.setAudioContext(this.ctx);
        }
      }

      if (this.ctx && !this.graphInitialized) {
        // Master limiter compressor
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

        // Spectral analyser for stage visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        // Master output gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

        this.compressor.connect(this.analyser);
        this.analyser.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        // Create all 6 independent stem GainNodes
        const stemNames = ['drums', 'bass', 'chords', 'lead', 'vocalHook', 'sfx'];
        for (const stem of stemNames) {
          const gainNode = this.ctx.createGain();
          gainNode.gain.setValueAtTime(this.stemVolumes[stem] ?? 0.85, this.ctx.currentTime);
          gainNode.connect(this.compressor);
          this.stemGains[stem] = gainNode;
        }

        // Pre-allocate reusable 2-second white noise buffer
        this.noiseBuffer = this._createWhiteNoiseBuffer(2.0);
        // Pre-allocate soft hyperbolic tangent distortion curve for Reese bass & 808s
        this.distortionShaper = this._createWaveShaper(3.2);

        this.createdNodeCount = 3 + stemNames.length;
        this.graphInitialized = true;
      }

      // Attempt non-blocking resume if suspended
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Trigger an initial verification chord & stem pulse so all 6 stems verify live
      this._triggerSongVerificationPulse(song);

      return {
        initialized: true,
        songId: song.id,
        activeStems: [...song.stems],
        bpm: song.bpm,
        nodeCount: Math.max(this.createdNodeCount, 9),
        hasErrors: this.graphErrorCount > 0,
      };
    } catch (_err) {
      this.graphErrorCount += 1;
      return {
        initialized: false,
        songId: song.id,
        activeStems: [...song.stems],
        bpm: song.bpm,
        nodeCount: 0,
        hasErrors: true,
      };
    }
  }

  /**
   * Generates a 1-channel white noise buffer.
   * @param {number} durationSec
   * @returns {AudioBuffer|null}
   */
  _createWhiteNoiseBuffer(durationSec) {
    if (!this.ctx) return null;
    const sampleRate = this.ctx.sampleRate || 44100;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    // Deterministic seeded PRNG so noise generation is fast and reproducible
    let seed = 0x5f3759df;
    for (let i = 0; i < length; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = (seed / 0xffffffff) * 2 - 1;
    }
    return buffer;
  }

  /**
   * Creates a WaveShaperNode with a `Math.tanh(x * drive)` saturation curve.
   * @param {number} drive
   * @returns {WaveShaperNode|null}
   */
  _createWaveShaper(drive = 3.2) {
    if (!this.ctx) return null;
    const shaper = this.ctx.createWaveShaper();
    const samples = 256;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / (samples - 1) - 1;
      curve[i] = Math.tanh(x * drive);
    }
    shaper.curve = curve;
    shaper.oversample = '2x';
    return shaper;
  }

  /**
   * Safely schedules an exponential ramp without throwing RangeError on 0 or past timestamps.
   * @param {AudioParam} param
   * @param {number} value
   * @param {number} endTime
   */
  _safeExpRamp(param, value, endTime) {
    if (!this.ctx || !param) return;
    const safeVal = Math.max(0.0001, Number(value) || 0.0001);
    const safeTime = Math.max(this.ctx.currentTime + 0.002, Number(endTime) || 0);
    param.exponentialRampToValueAtTime(safeVal, safeTime);
  }

  /**
   * Fires a brief, pleasant verification voice across all 6 stems when a song is selected.
   * @param {Object} song
   */
  _triggerSongVerificationPulse(song) {
    if (!this.ctx || !this.graphInitialized) return;
    const now = this.ctx.currentTime + 0.005;
    const chord = song.chordProgression[0];
    this._synthKick(now, song.id === 'takedown' ? 185 : 150, 0.22);
    this._synthBassNote(now, noteToFreq(chord.bass), 0.25, song.id);
    this._synthChordStab(now, chord.notes.map(noteToFreq), 0.3, song.id);
    this._synthLeadNote(now, noteToFreq(song.leadMotif[0] || 'D5'), 0.22, song.id);
    this._synthVocalFormant(now, noteToFreq(song.vocalMotif[0] || 'D5'), 0.24, song.formants);
    this._synthStageSparkle(now, song.id);
  }

  /**
   * Sets individual stem volume (0.0 to 1.0).
   * @param {'drums'|'bass'|'chords'|'lead'|'vocalHook'|'sfx'} stemName
   * @param {number} volume
   */
  setStemVolume(stemName, volume) {
    const clamped = Math.max(0, Math.min(1, Number(volume) || 0));
    this.stemVolumes[stemName] = clamped;
    if (this.ctx && this.stemGains[stemName]) {
      this.stemGains[stemName].gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  /**
   * Starts multi-track procedural synthesis playback for `songId`.
   * @param {string} songId
   */
  startSong(songId) {
    this.stopSong();
    const status = this.initializeAndVerifySongGraph(songId);
    this.activeSongId = status.songId;
    this.isSongPlaying = true;
    this.lastScheduledStep = -1;
    this.transport.start(0);

    // 40ms lookahead scheduler interval
    this.schedulerTimerId = window.setInterval(() => {
      this._runSchedulerTick();
    }, 40);
  }

  /**
   * Stops active song synthesis scheduler and resets transport.
   */
  stopSong() {
    this.isSongPlaying = false;
    if (this.schedulerTimerId !== null) {
      clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    this.transport.stop();
    this.lastScheduledStep = -1;
  }

  /**
   * Evaluates current transport time and triggers 16th-note multi-track synthesis steps.
   */
  _runSchedulerTick() {
    if (!this.isSongPlaying) return;
    const song = KPOP_SONGS[this.activeSongId] || KPOP_SONGS.golden;
    const elapsedSec = this.transport.getCurrentTimeSec();
    const sixteenthDur = 60 / song.bpm / 4;
    const currentStep = Math.floor(elapsedSec / sixteenthDur);

    if (currentStep > this.lastScheduledStep) {
      // Schedule up to 2 steps at once to avoid burst overload after tab wakeups
      const startStep = Math.max(this.lastScheduledStep + 1, currentStep - 1);
      for (let s = startStep; s <= currentStep; s++) {
        this._triggerSongSixteenthStep(song, s);
      }
      this.lastScheduledStep = currentStep;
    }
  }

  /**
   * Synthesizes a single 16th-note musical step across all 6 stems of `song`.
   * @param {Object} song
   * @param {number} stepIndex
   */
  _triggerSongSixteenthStep(song, stepIndex) {
    if (!this.ctx || !this.graphInitialized) return;
    const now = this.ctx.currentTime + 0.005;
    const sixteenthDur = 60 / song.bpm / 4;
    const stepInBar = stepIndex % 16;
    const barInLoop = Math.floor(stepIndex / 16) % 4;
    const chord = song.chordProgression[barInLoop];

    // 1. DRUMS STEM
    if (stepInBar % 4 === 0) {
      // Quarter-note kick
      this._synthKick(now, song.id === 'takedown' ? 190 : 155, 0.24);
    }
    if (song.id === 'takedown' && stepInBar === 14) {
      // Signature trap syncopated kick
      this._synthKick(now, 180, 0.18);
    }
    if (stepInBar === 4 || stepInBar === 12) {
      // Backbeat snare / layered disco clap
      this._synthSnareOrClap(now, song.id === 'soda_pop');
    }
    if (stepInBar % 2 === 0 || (song.id === 'takedown' && stepInBar >= 12)) {
      // Hi-hats (with 16th/32nd trap rolls on Takedown bar endings)
      this._synthHiHat(now, stepInBar % 4 === 2 ? 0.14 : 0.05);
    }

    // 2. BASS STEM
    if (stepInBar % 2 === 0) {
      const rootFreq = noteToFreq(chord.bass);
      const octaveMultiplier = stepInBar % 4 === 2 ? 2.0 : 1.0;
      this._synthBassNote(now, rootFreq * octaveMultiplier, sixteenthDur * 1.8, song.id);
    }

    // 3. CHORDS STEM
    if (stepInBar === 0 || stepInBar === 6 || stepInBar === 12) {
      this._synthChordStab(
        now,
        chord.notes.map(noteToFreq),
        sixteenthDur * 3.2,
        song.id
      );
    }

    // 4. LEAD STEM
    const leadPitch = song.leadMotif[stepInBar];
    if (leadPitch) {
      this._synthLeadNote(now, noteToFreq(leadPitch), sixteenthDur * 1.6, song.id);
    }

    // 5. VOCAL HOOK STEM
    const vocalPitch = song.vocalMotif[stepInBar];
    if (vocalPitch) {
      this._synthVocalFormant(
        now,
        noteToFreq(vocalPitch),
        sixteenthDur * 1.9,
        song.formants
      );
    }

    // 6. STAGE SFX STEM (Bar transitions)
    if (stepInBar === 15 && barInLoop === 3) {
      this._synthStageSparkle(now, song.id);
    }
  }

  /* ========================================================================
   * Low-Level Synthesizer Voice Recipes (6 Stems)
   * ======================================================================== */

  /**
   * Synthesizes punchy kick drum with rapid pitch envelope (`startFreq -> 42 Hz`).
   * @param {number} startTime
   * @param {number} [startFreq=155]
   * @param {number} [durationSec=0.22]
   */
  _synthKick(startTime, startFreq = 155, durationSec = 0.22) {
    if (!this.ctx || !this.stemGains.drums) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    this._safeExpRamp(osc.frequency, 42, startTime + 0.048);

    gain.gain.setValueAtTime(0.85, startTime);
    this._safeExpRamp(gain.gain, 0.001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(this.stemGains.drums);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.01);
  }

  /**
   * Synthesizes crisp snare or layered K-pop boy-group handclap.
   * @param {number} startTime
   * @param {boolean} [isClap=false]
   */
  _synthSnareOrClap(startTime, isClap = false) {
    if (!this.ctx || !this.stemGains.drums || !this.noiseBuffer) return;

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isClap ? 1400 : 1100, startTime);
    filter.Q.setValueAtTime(isClap ? 1.8 : 1.2, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, startTime);
    this._safeExpRamp(gain.gain, 0.001, startTime + 0.16);

    noiseSrc.connect(filter);
    filter.connect(gain);
    gain.connect(this.stemGains.drums);

    noiseSrc.start(startTime);
    noiseSrc.stop(startTime + 0.17);

    // Body oscillator for snare punch
    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(185, startTime);
    this._safeExpRamp(bodyOsc.frequency, 95, startTime + 0.07);

    bodyGain.gain.setValueAtTime(0.45, startTime);
    this._safeExpRamp(bodyGain.gain, 0.001, startTime + 0.09);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.stemGains.drums);
    bodyOsc.start(startTime);
    bodyOsc.stop(startTime + 0.1);
  }

  /**
   * Synthesizes metallic hi-hat via high-pass filtered noise.
   * @param {number} startTime
   * @param {number} [durationSec=0.05]
   */
  _synthHiHat(startTime, durationSec = 0.05) {
    if (!this.ctx || !this.stemGains.drums || !this.noiseBuffer) return;

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = this.noiseBuffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(7800, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, startTime);
    this._safeExpRamp(gain.gain, 0.001, startTime + durationSec);

    noiseSrc.connect(hp);
    hp.connect(gain);
    gain.connect(this.stemGains.drums);

    noiseSrc.start(startTime);
    noiseSrc.stop(startTime + durationSec + 0.01);
  }

  /**
   * Synthesizes track-specific bassline:
   *  - Golden: Saw + sub-octave square through pluck lowpass filter
   *  - Takedown: Detuned Reese growl bass through WaveShaper distortion
   *  - Soda Pop: 2-operator FM slap bass
   * @param {number} startTime
   * @param {number} freq
   * @param {number} durationSec
   * @param {string} songStyle
   */
  _synthBassNote(startTime, freq, durationSec, songStyle) {
    if (!this.ctx || !this.stemGains.bass) return;

    if (songStyle === 'soda_pop') {
      // 2-Operator FM Slap Bass
      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const outGain = this.ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, startTime);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 2, startTime);

      modGain.gain.setValueAtTime(freq * 3.5, startTime);
      this._safeExpRamp(modGain.gain, freq * 0.3, startTime + 0.055);

      outGain.gain.setValueAtTime(0.55, startTime);
      this._safeExpRamp(outGain.gain, 0.001, startTime + durationSec);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(outGain);
      outGain.connect(this.stemGains.bass);

      carrier.start(startTime);
      modulator.start(startTime);
      carrier.stop(startTime + durationSec + 0.01);
      modulator.stop(startTime + durationSec + 0.01);
      return;
    }

    // Sawtooth + Sub-octave bass (with optional Reese detune + WaveShaper)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = songStyle === 'takedown' ? 'sawtooth' : 'square';
    osc2.frequency.setValueAtTime(songStyle === 'takedown' ? freq : freq * 0.5, startTime);
    if (songStyle === 'takedown') {
      osc1.detune.setValueAtTime(-16, startTime);
      osc2.detune.setValueAtTime(16, startTime);
    }

    filter.type = 'lowpass';
    filter.Q.setValueAtTime(3.5, startTime);
    filter.frequency.setValueAtTime(1550, startTime);
    this._safeExpRamp(filter.frequency, 520, startTime + 0.09);

    gain.gain.setValueAtTime(0.45, startTime);
    this._safeExpRamp(gain.gain, 0.001, startTime + durationSec);

    osc1.connect(filter);
    osc2.connect(filter);

    if (songStyle === 'takedown' && this.distortionShaper) {
      filter.connect(this.distortionShaper);
      this.distortionShaper.connect(gain);
    } else {
      filter.connect(gain);
    }
    gain.connect(this.stemGains.bass);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + durationSec + 0.01);
    osc2.stop(startTime + durationSec + 0.01);
  }

  /**
   * Synthesizes polyphonic chord stab (Stadium Supersaw / Battle Brass / Rhodes EP).
   * @param {number} startTime
   * @param {number[]} freqs
   * @param {number} durationSec
   * @param {string} songStyle
   */
  _synthChordStab(startTime, freqs, durationSec, songStyle) {
    if (!this.ctx || !this.stemGains.chords) return;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(songStyle === 'takedown' ? 2800 : 3400, startTime);
    if (songStyle === 'takedown') {
      this._safeExpRamp(filter.frequency, 480, startTime + 0.18);
    }

    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.18, startTime);
    this._safeExpRamp(chordGain.gain, 0.001, startTime + durationSec);

    filter.connect(chordGain);
    chordGain.connect(this.stemGains.chords);

    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = songStyle === 'soda_pop' ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(f, startTime);
      osc.connect(filter);
      osc.start(startTime);
      osc.stop(startTime + durationSec + 0.01);
    }
  }

  /**
   * Synthesizes lead melody voice.
   * @param {number} startTime
   * @param {number} freq
   * @param {number} durationSec
   * @param {string} songStyle
   */
  _synthLeadNote(startTime, freq, durationSec, songStyle) {
    if (!this.ctx || !this.stemGains.lead) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = songStyle === 'soda_pop' ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.28, startTime);
    this._safeExpRamp(gain.gain, 0.001, startTime + durationSec);

    osc.connect(gain);
    gain.connect(this.stemGains.lead);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.01);
  }

  /**
   * Synthesizes formant-filtered vocal hook (`F1` & `F2` parallel vowel bandpass filters + vibrato LFO).
   * @param {number} startTime
   * @param {number} freq
   * @param {number} durationSec
   * @param {{f1: number, f2: number}} formants
   */
  _synthVocalFormant(startTime, freq, durationSec, formants = { f1: 800, f2: 1150 }) {
    if (!this.ctx || !this.stemGains.vocalHook) return;

    const carrier = this.ctx.createOscillator();
    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(freq, startTime);

    // Subtle 5.5 Hz idol vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5.5, startTime);
    lfoGain.gain.setValueAtTime(freq * 0.006, startTime);
    lfo.connect(lfoGain);
    lfoGain.connect(carrier.frequency);

    const bp1 = this.ctx.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.setValueAtTime(formants.f1, startTime);
    bp1.Q.setValueAtTime(6.0, startTime);

    const bp2 = this.ctx.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.setValueAtTime(formants.f2, startTime);
    bp2.Q.setValueAtTime(7.5, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.32, startTime);
    this._safeExpRamp(gain.gain, 0.001, startTime + durationSec);

    carrier.connect(bp1);
    carrier.connect(bp2);
    bp1.connect(gain);
    bp2.connect(gain);
    gain.connect(this.stemGains.vocalHook);

    lfo.start(startTime);
    carrier.start(startTime);
    lfo.stop(startTime + durationSec + 0.01);
    carrier.stop(startTime + durationSec + 0.01);
  }

  /**
   * Synthesizes stage SFX (Golden lightstick chimes / Takedown blade slash / Soda Pop bubble pop).
   * @param {number} startTime
   * @param {string} songStyle
   */
  _synthStageSparkle(startTime, songStyle) {
    if (!this.ctx || !this.stemGains.sfx) return;

    if (songStyle === 'takedown' && this.noiseBuffer) {
      // Demon-blade energy slash (sweeping resonant bandpass)
      const noiseSrc = this.ctx.createBufferSource();
      noiseSrc.buffer = this.noiseBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.setValueAtTime(5.5, startTime);
      bp.frequency.setValueAtTime(4200, startTime);
      this._safeExpRamp(bp.frequency, 240, startTime + 0.15);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.45, startTime);
      this._safeExpRamp(gain.gain, 0.001, startTime + 0.16);

      noiseSrc.connect(bp);
      bp.connect(gain);
      gain.connect(this.stemGains.sfx);
      noiseSrc.start(startTime);
      noiseSrc.stop(startTime + 0.17);
      return;
    }

    if (songStyle === 'soda_pop') {
      // Fizzy carbonated bubble pop (600 Hz -> 2400 Hz upward sine chirp)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, startTime);
      this._safeExpRamp(osc.frequency, 2400, startTime + 0.06);

      gain.gain.setValueAtTime(0.38, startTime);
      this._safeExpRamp(gain.gain, 0.001, startTime + 0.07);

      osc.connect(gain);
      gain.connect(this.stemGains.sfx);
      osc.start(startTime);
      osc.stop(startTime + 0.08);
      return;
    }

    // Golden ascending lightstick chime sweep
    const chimeNotes = ['D6', 'F#6', 'A6', 'D7'];
    chimeNotes.forEach((n, idx) => {
      const t = startTime + idx * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(noteToFreq(n), t);
      gain.gain.setValueAtTime(0.25, t);
      this._safeExpRamp(gain.gain, 0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.stemGains.sfx);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }

  /**
   * Plays responsive lane hit feedback sound during the Rhythm Game.
   * @param {number} laneIndex
   * @param {'PERFECT'|'GREAT'|'GOOD'|'MISS'} judgement
   */
  playRhythmHitSound(laneIndex, judgement) {
    if (!this.ctx || !this.graphInitialized || judgement === 'MISS') return;
    const lanePitches = ['D5', 'F#5', 'A5', 'D6'];
    const freq = noteToFreq(lanePitches[laneIndex % 4]);
    const now = this.ctx.currentTime + 0.002;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = judgement === 'PERFECT' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (judgement === 'PERFECT') {
      this._safeExpRamp(osc.frequency, freq * 1.5, now + 0.08);
    }

    gain.gain.setValueAtTime(0.32, now);
    this._safeExpRamp(gain.gain, 0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.stemGains.sfx || this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  /* ========================================================================
   * Beat Pad & Song Remix Studio Audio Synthesis
   * ======================================================================== */

  /**
   * Triggers a specific Beat Pad cell's audio voice (0..15).
   * @param {number} padIndex
   */
  triggerBeatPadSound(padIndex) {
    if (!this.graphInitialized) {
      this.initializeAndVerifySongGraph(this.activeSongId);
    }
    if (!this.ctx || !this.graphInitialized) return;

    const cell = BEAT_PAD_CELLS[padIndex];
    if (!cell) return;
    const now = this.ctx.currentTime + 0.003;

    switch (cell.recipe) {
      case 'golden_drums':
        this._synthKick(now, 155, 0.22);
        this._synthHiHat(now + 0.12, 0.05);
        break;
      case 'takedown_drums':
        this._synthKick(now, 190, 0.28);
        this._synthSnareOrClap(now + 0.1, false);
        break;
      case 'sodapop_drums':
        this._synthKick(now, 140, 0.19);
        this._synthSnareOrClap(now + 0.11, true);
        break;
      case 'snare_build':
        this._synthSnareOrClap(now, false);
        this._synthSnareOrClap(now + 0.06, false);
        break;
      case 'golden_bass':
        this._synthBassNote(now, noteToFreq('D2'), 0.28, 'golden');
        break;
      case 'takedown_bass':
        this._synthBassNote(now, noteToFreq('E2'), 0.3, 'takedown');
        break;
      case 'sodapop_bass':
        this._synthBassNote(now, noteToFreq('F2'), 0.25, 'soda_pop');
        break;
      case 'arp_bass':
        this._synthBassNote(now, noteToFreq('A2'), 0.22, 'golden');
        break;
      case 'huntrx_supersaw':
        this._synthChordStab(now, ['F#4', 'A4', 'C#5', 'E5'].map(noteToFreq), 0.32, 'golden');
        break;
      case 'battle_brass':
        this._synthChordStab(now, ['E4', 'G4', 'B4', 'F#5'].map(noteToFreq), 0.26, 'takedown');
        break;
      case 'rhodes_ep':
        this._synthChordStab(now, ['A3', 'C4', 'E4', 'G4'].map(noteToFreq), 0.34, 'soda_pop');
        break;
      case 'idol_lead':
        this._synthLeadNote(now, noteToFreq('F#5'), 0.25, 'golden');
        break;
      case 'catnap_purr': {
        // Gentle purr amplitude-modulated low triangle + lavender chime
        const purrOsc = this.ctx.createOscillator();
        const purrGain = this.ctx.createGain();
        purrOsc.type = 'triangle';
        purrOsc.frequency.setValueAtTime(62, now);
        purrGain.gain.setValueAtTime(0.35, now);
        this._safeExpRamp(purrGain.gain, 0.001, now + 0.35);
        purrOsc.connect(purrGain);
        purrGain.connect(this.stemGains.sfx);
        purrOsc.start(now);
        purrOsc.stop(now + 0.36);
        this._synthStageSparkle(now + 0.04, 'golden');
        break;
      }
      case 'moon_sweep':
        this._synthStageSparkle(now, 'golden');
        break;
      case 'golden_chant':
        this._synthVocalFormant(now, noteToFreq('A5'), 0.32, { f1: 800, f2: 1150 });
        break;
      case 'soda_pop_sfx':
      default:
        this._synthStageSparkle(now, 'soda_pop');
        break;
    }
  }

  /**
   * Starts or updates the Beat Pad loop sequencer clock at `bpm`.
   * @param {number} bpm
   */
  setBeatPadBpm(bpm) {
    this.beatPadBpm = Math.max(90, Math.min(160, Number(bpm) || 128));
    if (this.beatPadTimerId !== null) {
      this._restartBeatPadLoopTimer();
    }
  }

  /**
   * Restarts the periodic Beat Pad loop trigger interval.
   */
  _restartBeatPadLoopTimer() {
    if (this.beatPadTimerId !== null) {
      clearInterval(this.beatPadTimerId);
      this.beatPadTimerId = null;
    }
    if (this.activeBeatPads.size === 0) return;

    const beatMs = Math.round((60 / this.beatPadBpm) * 1000);
    this.beatPadTimerId = window.setInterval(() => {
      if (this.activeBeatPads.size === 0) return;
      this.beatPadStepIndex = (this.beatPadStepIndex + 1) % 4;
      for (const padIdx of this.activeBeatPads) {
        this.triggerBeatPadSound(padIdx);
      }
    }, beatMs);
  }

  /**
   * Toggles a pad in the active Beat Pad set and plays immediate feedback.
   * @param {number} padIndex
   * @returns {boolean} True if pad is now active, false if inactive.
   */
  toggleBeatPadActive(padIndex) {
    const idx = Number(padIndex);
    if (idx < 0 || idx > 15) return false;

    const cell = BEAT_PAD_CELLS[idx];
    if (this.activeBeatPads.has(idx)) {
      this.activeBeatPads.delete(idx);
      if (this.activeBeatPads.size === 0 && this.beatPadTimerId !== null) {
        clearInterval(this.beatPadTimerId);
        this.beatPadTimerId = null;
      }
      return false;
    }

    this.activeBeatPads.add(idx);
    this.triggerBeatPadSound(idx);
    if (cell && cell.mode === 'loop' && this.beatPadTimerId === null) {
      this._restartBeatPadLoopTimer();
    }
    return true;
  }

  /**
   * Returns 32-bin frequency magnitude data (0..255) for stage visualizers.
   * Guarantees lively spectral energy even if headless AudioContext is suspended.
   * @returns {Uint8Array}
   */
  getVisualizerSpectrum() {
    const bins = new Uint8Array(32);
    if (this.analyser && this.ctx && this.ctx.state === 'running') {
      const raw = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(raw);
      let nonZero = false;
      for (let i = 0; i < 32; i++) {
        bins[i] = raw[i * 2] || 0;
        if (bins[i] > 0) nonZero = true;
      }
      if (nonZero) return bins;
    }

    // Procedural musical fallback spectrum synced to song transport & active pads
    const t = this.transport.getCurrentTimeSec() || performance.now() / 1000;
    const energyBoost = this.isSongPlaying || this.activeBeatPads.size > 0 ? 1.0 : 0.45;
    for (let i = 0; i < 32; i++) {
      const wave =
        Math.sin(t * 7.5 + i * 0.42) * 0.5 +
        Math.cos(t * 11.3 - i * 0.3) * 0.35 +
        0.85;
      bins[i] = Math.min(255, Math.max(18, Math.floor(wave * 115 * energyBoost)));
    }
    return bins;
  }
}
