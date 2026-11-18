# Forskningens Døgn: AI safety explorer

An interactive page for an AI safety workshop at SDU. It presents one problem, "AI is powerful and potentially dangerous", and lets visitors explore three solutions. Each choice shows how the AI gets around it, then offers two sub-solutions to try next, four levels deep.

## Files

- `index.html`: the page shell.
- `style.css`, `tree.css`: the design.
- `demos.js` and `demos.css`: the small visual examples in each "But" card (number wall, chat, bars, code edit, filter, counter, split screen, concept cloud). Which example each option shows is set at the bottom of `content.js`.
- `game.css`: the 1-minute challenge (countdown, scenario, outcome screens). Its text is under `game` in `content.js`.
- `app.js`: screens, branching options and keyboard controls (1/2 or 1-3 to pick, ← back, Esc to the solutions, P for presenter mode).
- `background.js`: the animated network background.
- `content.js`: all text. Three solutions, each a tree where every step splits into two paths, four steps deep. Edit this file to change wording, examples or sources. The short lines shown on screen are in the block at the bottom of the file; the longer text appears under "More detail".

## Publishing on GitHub Pages

Settings, Pages, Deploy from a branch, `main`, `/ (root)`. The page is at `https://simo899t.github.io/forskningens-doegn/`.

## Using it in the workshop

- Solo: share the link or a QR code; people click through on their phones.
- Group: project it and press **Present** (or `P`) for larger text. The right arrow (or a clicker) reveals "What goes wrong?", keys `1` and `2` pick a path, the left arrow goes back and `Esc` returns to the strategies.
- `logo-sdu.png`: the SDU logo in the "Powered by" badge (white on transparent). Replace it to change the logo.
- When you change CSS or JS files, bump the `?v=` number (now 5) in `index.html` so visitors do not get old cached files.
