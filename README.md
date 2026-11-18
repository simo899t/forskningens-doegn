# Forskningens Døgn: AI safety explorer

An interactive page for an AI safety workshop at SDU. It presents one problem, "AIs are difficult to control and understand", and lets visitors explore eight common ideas for solving it, four levels deep, and why each one falls short on its own.

## Files

- `index.html`: the page shell.
- `style.css`, `tree.css`: the design.
- `app.js`: screens, branching paths, the mini-map and keyboard controls.
- `background.js`: the animated network background.
- `content.js`: all text. Three solutions, each a tree where every step splits into two paths, four steps deep. Edit this file to change wording, examples or sources.

## Publishing on GitHub Pages

Settings, Pages, Deploy from a branch, `main`, `/ (root)`. The page is at `https://simo899t.github.io/forskningens-doegn/`.

## Using it in the workshop

- Solo: share the link or a QR code; people click through on their phones.
- Group: project it and press **Present** (or `P`) for larger text. The right arrow (or a clicker) reveals "What goes wrong?", keys `1` and `2` pick a path, the left arrow goes back and `Esc` returns to the strategies.
