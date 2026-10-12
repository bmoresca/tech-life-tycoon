# Tech Life Tycoon

A Game-Dev-Tycoon-style browser game about a software founder. Start in a garage in 1984 with a
second-hand Commodus 64, ship software across four decades of fictional tech history, and watch
two AI companies make it all obsolete in January 2026. No matter what.

## Run

Any static file server works. No build step.

```sh
python3 -m http.server 8765
# open http://localhost:8765
```

Opening `index.html` directly also works (fonts load from Google Fonts; everything else is local).

## How to play

- **Develop**: name your software, pick a type (unlocks by year), platform and project size,
  then allocate effort across three phases of three sliders each. Each type has a hidden ideal
  mix. Reviews tell you how well you fit it.
- **Research**: research points (🔬) come from developing. Spend them to unlock new software
  categories (34 in total) and team upgrades like Source Control, Unit Testing, Agile and Cloud.
- **Contracts**: paid gigs that block development while you work them.
- **Post**: the BBS → Usenet → your Blog → Chirper. Pump sales (hype), ask for work (contract
  offers) or share your journey (fans).
- **Team / Company**: at ~$25k you choose a path: Indie Hacker (solo, output bonus), Solopreneur
  (2 contractors) or Startup Office (5 employees, large projects), later Corporate HQ (12).
- Press **?** in the top bar for the in-game guide. Space bar pauses. Progress autosaves to localStorage.

## Files

- `data.js` — types, platforms, events timeline, names, ending text
- `engine.js` — game logic (pure; runnable in node for simulation)
- `sprites.js` — canvas pixel-art scenes, computers by era, floating points
- `ui.js` — panels, modals, game loop, save/load
