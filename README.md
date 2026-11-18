# Forskningens Døgn: AI safety explorer

An interactive page for an AI safety workshop at SDU. It presents one problem, "AIs are difficult to control and understand", and lets visitors explore eight common ideas for solving it, four levels deep, and why each one falls short on its own.

## Files

- `index.html`, `style.css`, `app.js`: the page and its logic (plain HTML, CSS and JavaScript, no build step).
- `content.js`: all text. Edit this file to change wording, examples or sources.

## Publishing on GitHub Pages

Settings → Pages → Build and deployment → Source: "Deploy from a branch", branch `main`, folder `/ (root)`. The page is then at `https://simo899t.github.io/forskningens-doegn/`.

## Using it in the workshop

- Solo: share the link or a QR code; people click through on their phones.
- Group: project it and press **Present** (or `P`) for larger text. Arrow keys or a clicker reveal "What goes wrong?" and move to the next level; `Esc` goes back to the solution menu.
