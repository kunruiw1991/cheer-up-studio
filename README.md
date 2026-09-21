# 🌙✨🌉 Boston ↔ Bay Area Creative Cheer-Up Studio

> **Made with ❤️ from Mom in San Francisco (Bay Area) to Daughter in Boston**

### 🚀 [**Launch Live Studio on iPad / Browser → https://kunruiw1991.github.io/cheer-up-studio/**](https://kunruiw1991.github.io/cheer-up-studio/)

---

## 📱 How to Install as a Full-Screen App on iPad

1. Open **[https://kunruiw1991.github.io/cheer-up-studio/](https://kunruiw1991.github.io/cheer-up-studio/)** in **Safari** on your iPad.
2. Tap the **Share** button (square with upward arrow in the top bar).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** — a **Cheer-Up Studio (🌙)** icon will appear on your iPad Home Screen!
   - *Offline Ready*: Built-in Progressive Web App (PWA) Service Worker (`./sw.js`) automatically caches the entire studio on your iPad so you can design tattoos, play with CatNap, and remix songs even without Wi-Fi!

---

## 🎨 What's Inside the Studio

### 1. 🦋 Temporary Tattoo Designer & Printable Transfer Sheet Studio
- **3 Custom Vector Stamp Collections (19+ Scalable Stickers)**:
  - **CatNap & Smiling Critters**: CatNap with crescent moon pendant, lavender dream mist, starry paws, DogDay, CraftyCorn, and Hoppy Hopscotch.
  - **K-Pop Demon Hunters**: HUNTR/X (Rumi, Mira, Zoey) glowing demon-hunter emblems, magical lightstick blades, and Saja Boys neon idol crests (*Golden*, *Takedown*, *Soda Pop*).
  - **Bay Area ↔ Boston Coast-to-Coast Connection**: Golden Gate Bridge + Boston Zakim skyline, Boston Public Garden ducklings, **"Mom ❤️ Daughter"**, and **"Boston Superstar"** crests.
- **Freehand Brushes & Layer Studio**: Draw with Neon Glow, Glitter/Sparkle, Rainbow, and Metallic Ink brushes; add custom curved/banner text; drag, scale, rotate, duplicate, and undo/redo stamps.
- **Virtual Arm/Wrist Try-On Preview**: Preview how your custom tattoo looks on a virtual arm and wrist with adjustable skin tones and lighting.
- **1-Click Horizontally Mirrored Printable Sheet Export**:
  - Exports both a standard PNG and an **automatically horizontally mirrored 8.5"×11" printable transfer sheet** with cut lines and application instructions.

#### 🖨️ How to Print & Apply Real Temporary Tattoos at Home
1. Load **Inkjet Printable Temporary Tattoo Paper** (e.g., *Sunnyscopa* or *Silhouette* temporary tattoo paper) into any inkjet printer.
2. In the Tattoo Studio, tap **"Export Mirrored Printable Sheet"** and print onto the glossy paper side.
3. Apply the clear adhesive top sheet firmly over the printed design and cut neatly around each tattoo.
4. Peel off the clear plastic layer, press the tattoo **face-down** onto clean skin, hold a **warm wet sponge or cloth** against the backing for **20–30 seconds**, and gently slide off the paper!

---

### 2. 🐱🌙 CatNap & Smiling Critters Cozy Playground
- **Interactive CatNap Companion & Plush Customizer**:
  - Tap or pet CatNap for gentle purrs, lavender dream-mist particle animations, and playful expressions.
  - Dress up CatNap with K-Pop idol stage jackets, glowing neon headphones, crescent moon pendants, and cozy Boston winter scarves.
- **"CatNap's Starlight Rooftop Dash" Arcade Mini-Game**:
  - Leap across starry Boston brownstones and San Francisco Golden Gate towers collecting crescent moons, musical notes, and bonus tattoo stickers while dodging obstacles.

---

### 3. ⚡🎵 *K-Pop Demon Hunters* (HUNTR/X & Saja Boys) Rhythm & Remix Stage
- **Synthesized Web Audio Multi-Track Song Library** (zero external MP3 files needed):
  - ***"Golden"*** — HUNTR/X uplifting power-pop anthem
  - ***"Takedown"*** — High-energy demon-hunter battle beat
  - ***"Soda Pop"*** — Saja Boys upbeat fizzy K-pop groove
- **4-Lane Falling-Note Rhythm Game**:
  - Play with iPad touch lanes (or keyboard keys `D`, `F`, `J`, `K`) synchronized to the beat with `PERFECT` / `GREAT` / `GOOD` hit judgements, combo multipliers, glowing stage pyrotechnics, and lyric callouts.
- **DJ Beat Pad & Song Remix Studio**:
  - Layer drums, basslines, synth leads, and CatNap/idol sound effects to compose, record, and replay your own custom tracks.

---

### 4. 🌉💌 Bay Area ↔ Boston Connection Hub & Postcard Wall
- **Dual-City Live Sky & Clock Widget**: Shows real-time clocks and sky vibes for **Mom in San Francisco (PDT/PST)** and **Daughter in Boston (EDT/EST)** side by side.
- **Letters & Stickers from Mom**: Interactive flip-card postcard wall with messages, heart counters, and collectible stickers.
- **Send Creation Card to Mom**: Bundles your latest custom tattoo design and game high scores into a downloadable shareable PNG postcard to text or email back to Mom.
- **My Creations Gallery**: Saves all custom tattoos, CatNap outfits, and song remixes in `localStorage` so nothing is ever lost across visits.

---

## 🛠️ Repository & Build Structure

- `docs/` — Deployed GitHub Pages static bundle (`index.html`, `manifest.json`, `sw.js`, and modular ES2022 sources).
- `dist/index.html` / `Cheer_Up_Studio_iPad.html` — Self-contained `325.9 KB` single-file standalone HTML bundle (all 24 ES2022 modules and CSS inlined).
- `src/` — Modular source code (`core/`, `tattoo-studio/`, `catnap-playground/`, `kpop-stage/`, `connection-hub/`, `styles/`).
- `scripts/build_dist.py` — Zero-dependency Python bundler that compiles `src/` into `dist/index.html`.
- `tests/run_e2e_suite.py` — 183-check headless Chromium E2E test suite (`183 / 183 PASSED`).
