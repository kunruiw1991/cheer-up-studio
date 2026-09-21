# Original User Request

## 2026-09-21T02:11:40Z

Build a standalone, zero-backend interactive web application ("Boston ↔ Bay Area Creative Cheer-Up Studio") designed for Kunrui's daughter living with her grandmother in Boston while her mom (Kunrui) is in the Bay Area. The app runs directly in any desktop or tablet browser (iPad/laptop/phone) and unites her three favorite creative passions—custom kid temporary tattoos, CatNap from Poppy Playtime (Smiling Critters), and K-Pop Demon Hunters (HUNTR/X & Saja Boys songs)—into an engaging, richly animated creative studio and game portal.

Working directory: /usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio
Integrity mode: development

## Requirements

### R1. Temporary Tattoo Designer & Printable Transfer Sheet Studio
Provide an interactive canvas studio where she can design custom temporary tattoos using:
- A rich library of custom scalable vector stamps/stickers across three collections:
  - **CatNap & Smiling Critters**: CatNap (purple cat with crescent moon pendant, lavender dream clouds, starry night paws) and fellow Smiling Critters icons.
  - **K-Pop Demon Hunters**: HUNTR/X (Rumi, Mira, Zoey) glowing demon-hunter emblems, magical lightstick/weapon motifs, and Saja Boys neon idol crests inspired by *Golden*, *Takedown*, and *Soda Pop*.
  - **Bay Area ↔ Boston Coast-to-Coast Connection**: Golden Gate Bridge + Boston skyline/duckling bridge badges, "Mom ❤️ Daughter" and "Boston Superstar" crests.
- Freehand drawing tools with neon glow, glitter/sparkle, rainbow, and metallic ink brushes, color pickers, customizable text banners, layer/stamp transforms (drag, scale, rotate, duplicate, undo/redo).
- **Virtual Try-On Preview**: An interactive preview showing how her custom tattoo looks applied to a virtual arm/wrist/hand with adjustable skin tones and lighting.
- **Printable Mirrored Tattoo Sheet Export**: A 1-click export that generates both a normal high-resolution PNG and a **horizontally mirrored 8.5"×11" printable transfer sheet** (with cut guides and step-by-step instructions for applying with a wet sponge using inkjet temporary tattoo paper).

### R2. CatNap & Smiling Critters Cozy Playground & Mini-Game
Provide a playful, kid-friendly (non-frightening, cozy-magical) CatNap interactive zone featuring:
- **Interactive CatNap Companion & Plush Customizer**: An animated SVG/Canvas CatNap character that reacts to touch/clicks with purrs, gentle lavender dream-mist particle effects, facial expressions, and customizable outfits/accessories (K-Pop idol jackets, glowing headphones, crescent moon pendants, Boston winter scarves).
- **"CatNap's Starlight Rooftop Dash" Mini-Game**: A responsive keyboard/touch arcade mini-game where CatNap leaps across starry Boston brownstones and San Francisco Golden Gate towers collecting crescent moons, musical notes, and tattoo stickers while avoiding obstacles, with high-score tracking and unlockable sticker rewards for the Tattoo Studio.

### R3. K-Pop Demon Hunters (HUNTR/X & Saja Boys) Rhythm & Remix Stage
Provide an interactive music stage inspired by the 2025 animated musical *K-Pop Demon Hunters*:
- **Synthesized Multi-Track Song Library**: Built-in Web Audio API multi-track arrangements (no external MP3 dependencies required) capturing the distinct energy of her favorite songs:
  - *"Golden"* (HUNTR/X uplifting power-pop anthem)
  - *"Takedown"* (high-energy demon-hunter battle beat)
  - *"Soda Pop"* (Saja Boys upbeat fizzy K-pop groove)
- **Falling-Note Rhythm Game Mode**: Playable 4-lane rhythm game (keyboard keys `D`, `F`, `J`, `K` + full touch/click lane buttons for iPad) synchronized to the synthesized beats with hit judgements (`PERFECT`, `GREAT`, `GOOD`), combo multipliers, glowing stage pyrotechnics, and lyric/chant callouts.
- **Beat Pad & Song Remix Studio**: An interactive loop/drum/synth pad where she can layer drums, basslines, synth leads, and CatNap/idol sound effects to compose, record, and replay her own custom demon-hunter tracks.

### R4. Bay Area ↔ Boston Connection Hub, Postcard Wall & Packaging
- **Personalized Profile & Daily Cheer-Up Capsule**: Editable profile header (customizable with her name/nickname) and a "Letters & Stickers from Mom (Bay Area → Boston)" interactive postcard wall with warm messages from Mom, a live dual-city clock/weather-vibe widget showing San Francisco (Mom — PST/PDT) and Boston (Daughter & Mom — EST/EDT) side by side, and a "Send Creation Card to Mom" postcard generator that bundles her latest tattoo design + game high score into a downloadable shareable image card.
- **My Creations Gallery**: Persistent local storage (`localStorage`) gallery saving her custom tattoos, CatNap outfits, and song remixes so nothing is lost when she reloads the page.
- **Zero-Backend Portability**: Must run completely standalone in any modern browser without requiring a backend server at runtime (plus a bundled single-file or static `dist/` build that can be emailed/AirDropped or hosted anywhere).

## Acceptance Criteria

### Automated Functional & Headless Browser Verification
- [ ] Application loads cleanly in a headless Chromium browser with zero `console.error` or uncaught `pageerror` exceptions across all navigation tabs/views.
- [ ] **Tattoo Studio Verification**: Programmatic test confirms adding stamps from all 3 theme categories, drawing strokes on the canvas, rendering the virtual arm preview, and invoking the **Mirrored Printable Sheet Export**—verifying pixel-level horizontal reflection (`mirroredImage(x, y) === sourceImage(width - 1 - x, y)`) and non-empty image data output.
- [ ] **CatNap Playground Verification**: Programmatic test confirms interactive CatNap companion responds to clicks/customization changes and that the CatNap Rooftop Dash mini-game starts, updates score/state over simulated frames, and cleanly handles game-over and restart.
- [ ] **K-Pop Demon Hunters Stage Verification**: Programmatic test confirms Web Audio API synthesis graph initializes without errors for all 3 featured tracks (*Golden*, *Takedown*, *Soda Pop*), the 4-lane rhythm game spawns notes and registers hit judgements/combos on simulated key/touch inputs, and the Beat Pad mixer toggles loops cleanly.
- [ ] **Persistence & Export Verification**: Programmatic test confirms creations saved to the Gallery persist across a full page reload (`page.reload()`) via `localStorage` and that the "Share with Mom" postcard generator produces a valid downloadable PNG image.
