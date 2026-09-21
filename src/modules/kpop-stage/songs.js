/**
 * @fileoverview Song library, multi-track synthesizer score arrangements,
 * synchronized lyric/chant callouts, deterministic 4-lane beatmaps, and
 * 16-pad Beat Pad loop/SFX definitions for Milestone M4 (Requirement R3:
 * K-Pop Demon Hunters Rhythm & Remix Stage).
 *
 * Featured Tracks:
 *  1. "Golden"   — HUNTR/X (Rumi, Mira, Zoey) | 128 BPM | D Major
 *  2. "Takedown" — Demon-Hunter Battle Beat   | 145 BPM | E Phrygian Dominant
 *  3. "Soda Pop" — Saja Boys                  | 118 BPM | F Major
 */

/**
 * Converts a scientific pitch string (e.g., "F#4", "Bb3", "D5") to frequency in Hz.
 * @param {string} noteStr
 * @returns {number}
 */
export function noteToFreq(noteStr) {
  const NOTE_MAP = {
    C: 0, 'C#': 1, Db: 1,
    D: 2, 'D#': 3, Eb: 3,
    E: 4,
    F: 5, 'F#': 6, Gb: 6,
    G: 7, 'G#': 8, Ab: 8,
    A: 9, 'A#': 10, Bb: 10,
    B: 11,
  };
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(String(noteStr).trim());
  if (!match) return 440;
  const semitone = NOTE_MAP[match[1]];
  const octave = parseInt(match[2], 10);
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Generates a deterministic, musically synchronized 4-lane beatmap for a song.
 * Notes begin at beat 3 (around 1.1s–1.5s) so notes are immediately visible
 * within the 1.6s approach window right as playback starts.
 *
 * @param {string} songId
 * @param {number} bpm
 * @param {number} totalBeats
 * @param {Array<{timeSec: number, text: string}>} lyrics
 * @returns {Array<{
 *   id: string,
 *   lane: 0|1|2|3,
 *   hitTimeSec: number,
 *   type: 'tap'|'star_note',
 *   lyricCallout?: string,
 *   state: 'pending'|'hit'|'missed',
 *   judgement?: string
 * }>}
 */
function buildDeterministicBeatmap(songId, bpm, totalBeats, lyrics) {
  const beatDur = 60 / bpm;
  const notes = [];
  let noteIdx = 0;

  // Song-specific rhythmic & lane choreography patterns
  const patterns = {
    golden: [
      { beatOffset: 0.0, lane: 0, star: false },
      { beatOffset: 1.0, lane: 1, star: false },
      { beatOffset: 2.0, lane: 2, star: false },
      { beatOffset: 3.0, lane: 3, star: true },
      { beatOffset: 4.0, lane: 2, star: false },
      { beatOffset: 4.5, lane: 1, star: false },
      { beatOffset: 5.0, lane: 0, star: false },
      { beatOffset: 6.0, lane: 3, star: false },
      { beatOffset: 7.0, lane: 2, star: true },
    ],
    takedown: [
      { beatOffset: 0.0, lane: 0, star: false },
      { beatOffset: 0.5, lane: 1, star: false },
      { beatOffset: 1.0, lane: 2, star: false },
      { beatOffset: 2.0, lane: 3, star: true },
      { beatOffset: 2.5, lane: 2, star: false },
      { beatOffset: 3.0, lane: 1, star: false },
      { beatOffset: 3.5, lane: 0, star: false },
      { beatOffset: 4.0, lane: 1, star: false },
      { beatOffset: 5.0, lane: 3, star: false },
      { beatOffset: 6.0, lane: 0, star: false },
      { beatOffset: 6.5, lane: 2, star: false },
      { beatOffset: 7.0, lane: 3, star: true },
    ],
    soda_pop: [
      { beatOffset: 0.0, lane: 1, star: false },
      { beatOffset: 1.0, lane: 2, star: false },
      { beatOffset: 1.5, lane: 3, star: false },
      { beatOffset: 2.0, lane: 0, star: false },
      { beatOffset: 3.0, lane: 2, star: true },
      { beatOffset: 4.0, lane: 3, star: false },
      { beatOffset: 5.0, lane: 1, star: false },
      { beatOffset: 5.5, lane: 0, star: false },
      { beatOffset: 6.0, lane: 2, star: false },
      { beatOffset: 7.0, lane: 3, star: true },
    ],
  };

  const pattern = patterns[songId] || patterns.golden;
  const startBeat = 2.5; // First hit ~1.1s-1.2s so visible at t=0.0s with approachTimeSec=1.6s

  for (let phraseStart = startBeat; phraseStart < totalBeats; phraseStart += 8) {
    for (const step of pattern) {
      const beat = phraseStart + step.beatOffset;
      if (beat > totalBeats) break;
      const hitTimeSec = Number((beat * beatDur).toFixed(3));
      noteIdx += 1;
      const paddedId = String(noteIdx).padStart(4, '0');
      // Attach lyric callout if a scheduled lyric occurs near this note
      const matchingLyric = lyrics.find(
        (l) => Math.abs(l.timeSec - hitTimeSec) < beatDur * 0.8
      );
      notes.push({
        id: `${songId}-n-${paddedId}`,
        lane: step.lane,
        hitTimeSec,
        type: step.star ? 'star_note' : 'tap',
        lyricCallout: matchingLyric ? matchingLyric.text : undefined,
        state: 'pending',
      });
    }
  }

  return notes;
}

/**
 * Master song definitions for the 3 featured K-Pop Demon Hunters tracks.
 */
export const KPOP_SONGS = {
  golden: {
    id: 'golden',
    title: 'Golden',
    artist: 'HUNTR/X (Rumi, Mira, Zoey)',
    subtitle: 'Uplifting Stadium Power-Pop K-Pop Anthem',
    bpm: 128,
    keySignature: 'D Major',
    durationSec: 45,
    themeColors: {
      primary: '#FFD166',
      secondary: '#FF2E93',
      accent: '#00F5D4',
      glow: 'rgba(255, 209, 102, 0.55)',
    },
    stems: ['drums', 'bass', 'chords', 'lead', 'vocalHook', 'sfx'],
    // 4-bar chord progression loop in D Major (Dmaj9 -> Aadd9/C# -> Bm7 -> Gmaj7/A7sus4)
    chordProgression: [
      { bar: 0, bass: 'D2', notes: ['F#4', 'A4', 'C#5', 'E5'] },
      { bar: 1, bass: 'C#2', notes: ['E4', 'A4', 'B4', 'E5'] },
      { bar: 2, bass: 'B1', notes: ['D4', 'F#4', 'A4', 'D5'] },
      { bar: 3, bass: 'G2', notes: ['B3', 'D4', 'F#4', 'A4'] },
    ],
    // 16-step (1-bar) lead & vocal hook motifs (in scientific pitch notation)
    leadMotif: [
      'F#5', null, 'E5', 'D5', 'A4', null, 'B4', 'D5',
      'F#5', null, 'A5', null, 'E5', 'D5', 'B4', 'A4',
    ],
    vocalMotif: [
      'D5', null, 'F#5', null, 'E5', null, 'D5', 'A4',
      'B4', null, 'D5', 'F#5', 'E5', null, 'D5', null,
    ],
    formants: { f1: 800, f2: 1150 },
    lyrics: [
      { timeSec: 0.5, text: '✨ HUNTR/X ON STAGE — RUMI • MIRA • ZOEY! ✨' },
      { timeSec: 7.5, text: '💛 WE ARE SHINING GOLDEN IN THE DARK! 💛' },
      { timeSec: 15.0, text: '🌉 FROM SAN FRANCISCO BAY TO BOSTON STARS! 🌃' },
      { timeSec: 22.5, text: '🔥 GOLDEN ANTHEM DROP — SING IT LOUD! 🔥' },
      { timeSec: 30.0, text: '💫 COAST TO COAST STRONG — GOLDEN FOREVER! 💫' },
    ],
  },

  takedown: {
    id: 'takedown',
    title: 'Takedown',
    artist: 'HUNTR/X Battle Unit',
    subtitle: 'High-Energy Cyberpunk Demon-Hunter Battle Beat',
    bpm: 145,
    keySignature: 'E Phrygian Dominant',
    durationSec: 45,
    themeColors: {
      primary: '#FF2E93',
      secondary: '#9B5DE5',
      accent: '#00F5D4',
      glow: 'rgba(255, 46, 147, 0.55)',
    },
    stems: ['drums', 'bass', 'chords', 'lead', 'vocalHook', 'sfx'],
    // 4-bar battle progression in E Phrygian Dominant / Harmonic Minor
    chordProgression: [
      { bar: 0, bass: 'E2', notes: ['E4', 'G4', 'B4', 'F#5'] },
      { bar: 1, bass: 'C2', notes: ['E4', 'G4', 'B4', 'F#5'] },
      { bar: 2, bass: 'A1', notes: ['C4', 'E4', 'G4', 'B4'] },
      { bar: 3, bass: 'B1', notes: ['D#4', 'F#4', 'A4', 'C5'] },
    ],
    leadMotif: [
      'E5', 'G5', 'F#5', 'E5', 'B4', 'C5', 'B4', 'G4',
      'E5', null, 'G5', 'B5', 'A5', 'G5', 'F#5', 'E5',
    ],
    vocalMotif: [
      'E5', 'E5', null, 'G5', 'F#5', null, 'E5', 'B4',
      'C5', null, 'B4', 'A4', 'G#4', null, 'E4', null,
    ],
    formants: { f1: 700, f2: 1350 },
    lyrics: [
      { timeSec: 0.5, text: '⚔️ DEMON HUNTERS ASSEMBLE — TAKEDOWN TIME! ⚔️' },
      { timeSec: 6.6, text: '⚡ LIGHTSTICK BLADES ACTIVATED! ⚡' },
      { timeSec: 13.2, text: '🔥 PROTECT THE MUSIC — SLASH THE SHADOWS! 🔥' },
      { timeSec: 19.8, text: '💥 ULTIMATE HUNTR/X TAKEDOWN DROP! 💥' },
      { timeSec: 26.4, text: '🛡️ VICTORY FOR HUNTR/X — SHADOWS CLEARED! 🛡️' },
    ],
  },

  soda_pop: {
    id: 'soda_pop',
    title: 'Soda Pop',
    artist: 'Saja Boys',
    subtitle: 'Upbeat Fizzy K-Pop Boy-Group Nu-Disco Groove',
    bpm: 118,
    keySignature: 'F Major',
    durationSec: 45,
    themeColors: {
      primary: '#00F5D4',
      secondary: '#9B5DE5',
      accent: '#FFD166',
      glow: 'rgba(0, 245, 212, 0.55)',
    },
    stems: ['drums', 'bass', 'chords', 'lead', 'vocalHook', 'sfx'],
    // 4-bar fizzy groove progression in F Major / D Dorian
    chordProgression: [
      { bar: 0, bass: 'F2', notes: ['A3', 'C4', 'E4', 'G4'] },
      { bar: 1, bass: 'A2', notes: ['C#4', 'G4', 'Bb4', 'E5'] },
      { bar: 2, bass: 'D2', notes: ['F3', 'A3', 'C4', 'E4'] },
      { bar: 3, bass: 'C2', notes: ['Bb3', 'D4', 'F4', 'G4'] },
    ],
    leadMotif: [
      'A5', null, 'C6', 'A5', 'G5', null, 'F5', 'D5',
      'F5', 'G5', 'A5', null, 'G5', 'F5', 'D5', 'C5',
    ],
    vocalMotif: [
      'F5', null, 'A5', 'G5', 'F5', null, 'D5', 'C5',
      'D5', null, 'F5', 'G5', 'A5', null, 'F5', null,
    ],
    formants: { f1: 600, f2: 1050 },
    lyrics: [
      { timeSec: 0.5, text: '🥤 SAJA BOYS IN THE HOUSE — POP THAT SODA! 🥤' },
      { timeSec: 8.1, text: '🫧 FIZZY GROOVE — BUBBLE UP THE BEAT! 🫧' },
      { timeSec: 16.2, text: '💖 SPARKLING IDOL WINK — CATCH THE RHYTHM! 💖' },
      { timeSec: 24.4, text: '🌟 SWEET & FIZZY FINALE — SODA POP! 🌟' },
      { timeSec: 32.0, text: '🎉 REFRESHING ENCORE — CHEERS FROM BOSTON! 🎉' },
    ],
  },
};

/**
 * Generates a fresh clone of the beatmap for a given song ID so each play session
 * starts with clean 'pending' note states.
 *
 * @param {string} songId
 * @returns {Array<Object>}
 */
export function createSongBeatmap(songId) {
  const song = KPOP_SONGS[songId] || KPOP_SONGS.golden;
  const totalBeats = Math.floor((song.durationSec * song.bpm) / 60);
  return buildDeterministicBeatmap(song.id, song.bpm, totalBeats, song.lyrics);
}

/**
 * 4-lane configuration for the Rhythm Game.
 */
export const RHYTHM_LANES = [
  {
    index: 0,
    keyLabel: 'D',
    memberName: 'Rumi',
    color: '#FF2E93',
    glow: 'rgba(255, 46, 147, 0.7)',
    keyCodes: ['KeyD', 'ArrowLeft'],
  },
  {
    index: 1,
    keyLabel: 'F',
    memberName: 'Mira',
    color: '#00F5D4',
    glow: 'rgba(0, 245, 212, 0.7)',
    keyCodes: ['KeyF', 'ArrowDown'],
  },
  {
    index: 2,
    keyLabel: 'J',
    memberName: 'Zoey',
    color: '#FFD166',
    glow: 'rgba(255, 209, 102, 0.7)',
    keyCodes: ['KeyJ', 'ArrowUp'],
  },
  {
    index: 3,
    keyLabel: 'K',
    memberName: 'Saja / CatNap',
    color: '#9B5DE5',
    glow: 'rgba(155, 93, 229, 0.7)',
    keyCodes: ['KeyK', 'ArrowRight'],
  },
];

/**
 * 16-Pad (4x4) Beat Pad & Song Remix Studio Matrix Definitions.
 * Rows:
 *  0..3:   Drums & Beats (Loop)
 *  4..7:   Basslines (Loop)
 *  8..11:  Synths & Chords (Loop)
 *  12..15: CatNap & Idol SFX (One-Shot / Loopable)
 */
export const BEAT_PAD_CELLS = [
  // Row 0: Drums & Beats (Loop)
  {
    index: 0,
    padId: 'pad-0',
    title: 'Golden Stadium Beat',
    category: 'drums',
    mode: 'loop',
    icon: '🥁',
    color: '#FFD166',
    recipe: 'golden_drums',
  },
  {
    index: 1,
    padId: 'pad-1',
    title: 'Takedown 808 Trap',
    category: 'drums',
    mode: 'loop',
    icon: '⚡',
    color: '#FF2E93',
    recipe: 'takedown_drums',
  },
  {
    index: 2,
    padId: 'pad-2',
    title: 'Soda Pop Disco Beat',
    category: 'drums',
    mode: 'loop',
    icon: '🕺',
    color: '#00F5D4',
    recipe: 'sodapop_drums',
  },
  {
    index: 3,
    padId: 'pad-3',
    title: 'K-Pop Snare Build',
    category: 'drums',
    mode: 'loop',
    icon: '🔥',
    color: '#FF7B54',
    recipe: 'snare_build',
  },

  // Row 1: Basslines (Loop)
  {
    index: 4,
    padId: 'pad-4',
    title: 'Golden Octave Bass',
    category: 'bass',
    mode: 'loop',
    icon: '🎸',
    color: '#FFD166',
    recipe: 'golden_bass',
  },
  {
    index: 5,
    padId: 'pad-5',
    title: 'Takedown Reese Growl',
    category: 'bass',
    mode: 'loop',
    icon: '🐉',
    color: '#FF2E93',
    recipe: 'takedown_bass',
  },
  {
    index: 6,
    padId: 'pad-6',
    title: 'Soda Pop Slap Bass',
    category: 'bass',
    mode: 'loop',
    icon: '🫧',
    color: '#00F5D4',
    recipe: 'sodapop_bass',
  },
  {
    index: 7,
    padId: 'pad-7',
    title: 'Starlight Arp Bass',
    category: 'bass',
    mode: 'loop',
    icon: '✨',
    color: '#9B5DE5',
    recipe: 'arp_bass',
  },

  // Row 2: Synths & Chords (Loop)
  {
    index: 8,
    padId: 'pad-8',
    title: 'HUNTR/X Supersaws',
    category: 'chords',
    mode: 'loop',
    icon: '🎹',
    color: '#FFD166',
    recipe: 'huntrx_supersaw',
  },
  {
    index: 9,
    padId: 'pad-9',
    title: 'Battle Brass Stabs',
    category: 'chords',
    mode: 'loop',
    icon: '🎺',
    color: '#FF2E93',
    recipe: 'battle_brass',
  },
  {
    index: 10,
    padId: 'pad-10',
    title: 'Sparkling Rhodes EP',
    category: 'chords',
    mode: 'loop',
    icon: '💎',
    color: '#00F5D4',
    recipe: 'rhodes_ep',
  },
  {
    index: 11,
    padId: 'pad-11',
    title: 'Soaring Idol Lead',
    category: 'chords',
    mode: 'loop',
    icon: '🌟',
    color: '#9B5DE5',
    recipe: 'idol_lead',
  },

  // Row 3: CatNap & Idol SFX (One-Shot + Active Indicator)
  {
    index: 12,
    padId: 'pad-12',
    title: 'CatNap Cozy Purr',
    category: 'sfx',
    mode: 'oneshot',
    icon: '🐱',
    color: '#B388FF',
    recipe: 'catnap_purr',
  },
  {
    index: 13,
    padId: 'pad-13',
    title: 'Crescent Moon Sweep',
    category: 'sfx',
    mode: 'oneshot',
    icon: '🌙',
    color: '#7C4DFF',
    recipe: 'moon_sweep',
  },
  {
    index: 14,
    padId: 'pad-14',
    title: 'HUNTR/X "Golden!" Chant',
    category: 'sfx',
    mode: 'oneshot',
    icon: '🎤',
    color: '#FFD166',
    recipe: 'golden_chant',
  },
  {
    index: 15,
    padId: 'pad-15',
    title: 'Saja Soda-Can Pop',
    category: 'sfx',
    mode: 'oneshot',
    icon: '🥤',
    color: '#00F5D4',
    recipe: 'soda_pop_sfx',
  },
];
