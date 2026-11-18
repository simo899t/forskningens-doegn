(function () {
  "use strict";

  var DATA = window.EXPLORER;
  var app = document.getElementById("app");
  var STORE = "ai-safety-visited-v2";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = null; // what the current screen is
  var typing = null; // active typewriter, so it can be skipped

  // ---------------- icons ----------------
  var ICONS = {
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/><circle cx="12" cy="12" r="2.2"/>',
    shield: '<path d="M12 3l8 3v6c0 4.6-3.4 8.3-8 9-4.6-.7-8-4.4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18h.01"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z"/><path d="M8 7h7"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    fork: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V7M12 13v4"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3"/><path d="M7 15h10"/>',
    redo: '<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  // ---------------- helpers ----------------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* no storage */ } }
  function visited() { return load(STORE, {}); }
  function markVisited(key) { var v = visited(); if (!v[key]) { v[key] = 1; save(STORE, v); } }
  function solById(id) { for (var i = 0; i < DATA.solutions.length; i++) if (DATA.solutions[i].id === id) return DATA.solutions[i]; return null; }
  function nodeAt(sol, path) {
    var n = sol.root;
    for (var i = 0; i < path.length; i++) { if (!n.paths) return null; n = n.paths[+path[i]]; if (!n) return null; }
    return n;
  }
  function leafPaths(node, prefix, out) {
    out = out || [];
    if (!node.paths) out.push(prefix); else node.paths.forEach(function (c, i) { leafPaths(c, prefix + i, out); });
    return out;
  }
  function endingsFound(sol) {
    var v = visited(); return leafPaths(sol.root, "").filter(function (p) { return v[sol.id + ":" + p]; }).length;
  }
  function stepHref(sol, path) { return "#/s/" + sol.id + "/r" + path; }
  function go(h) { location.hash = h; }
  function rise(i) { return ' class="rise" style="--i:' + i + '"'; }

  // ---------------- page transitions ----------------
  function render(html, after) {
    if (typing) { clearInterval(typing.timer); typing = null; }
    var old = app.firstElementChild;
    var swap = function () {
      app.innerHTML = html;
      window.scrollTo(0, 0);
      app.focus({ preventScroll: true });
      if (after) after();
    };
    if (old && !reduce) { old.classList.add("leaving"); setTimeout(swap, 200); } else swap();
  }
  function setChrome(kind) {
    document.body.classList.toggle("on-home", kind === "home");
    document.body.classList.remove("alert");
    document.querySelectorAll("[data-nav]").forEach(function (a) { a.classList.toggle("active", a.getAttribute("data-nav") === kind); });
    if (window.bgCalm) window.bgCalm(kind === "step" || kind === "why");
  }

  // ---------------- home ----------------
  function renderHome() {
    state = { kind: "home" }; setChrome("home");
    var p = DATA.problem;
    render(
      '<section class="screen hero"><div class="hero-inner">' +
      '<div' + rise(0) + '><span class="kicker-pill"><span class="pulse-dot"></span>' + esc(p.kicker) + "</span></div>" +
      '<h1><span class="l rise" style="--i:1">' + esc(p.titleTop) + '</span><span class="l rise" style="--i:2"><span class="danger-text">' + esc(p.titleBottom) + "</span></span></h1>" +
      '<p class="sub rise" style="--i:3">' + esc(p.sub) + "</p>" +
      '<div' + rise(4) + '><a class="explore" href="#/solutions"><span>' + esc(p.button) + "</span>" + icon("arrow") + "</a></div>" +
      '<div class="hero-meta rise" style="--i:5">' + p.meta.map(function (m) { return "<span>" + esc(m) + "</span>"; }).join("") + "</div>" +
      "</div></section>"
    );
  }

  // ---------------- tree drawing (mini-map and tile preview) ----------------
  function treeSvg(sol, opts) {
    opts = opts || {};
    var v = visited();
    var W = opts.w || 320, H = opts.h || 168, pad = 14;
    var leaves = leafPaths(sol.root, "");
    var depth = leaves[0].length; // 3
    var pos = {};
    var colW = (W - pad * 2) / depth;
    leaves.forEach(function (p, i) { pos[p] = { x: pad + depth * colW, y: pad + (i * (H - pad * 2)) / (leaves.length - 1) }; });
    (function place(node, path) {
      if (!node.paths) return pos[path];
      var a = place(node.paths[0], path + "0"), b = place(node.paths[1], path + "1");
      pos[path] = { x: pad + path.length * colW, y: (a.y + b.y) / 2 };
      return pos[path];
    })(sol.root, "");
    var cur = opts.current;
    var onTrail = function (p) { return cur != null && cur.indexOf(p) === 0; };
    var edges = "", dots = "";
    (function walk(node, path) {
      if (!node.paths) return;
      node.paths.forEach(function (c, i) {
        var cp = path + i, a = pos[path], b = pos[cp];
        var mx = (a.x + b.x) / 2;
        var lit = onTrail(cp) ? "trail" : v[sol.id + ":" + cp] ? "seen" : "";
        edges += '<path class="edge ' + lit + '" d="M' + a.x + " " + a.y + "C" + mx + " " + a.y + " " + mx + " " + b.y + " " + b.x + " " + b.y + '"/>';
        walk(c, cp);
      });
    })(sol.root, "");
    Object.keys(pos).sort(function (a, b) { return a.length - b.length; }).forEach(function (p) {
      var seen = v[sol.id + ":" + p], isCur = p === cur, leaf = !nodeAt(sol, p).paths;
      var cls = "dot" + (seen ? " seen" : "") + (isCur ? " cur" : "") + (onTrail(p) ? " trail" : "") + (leaf ? " leaf" : "");
      var r = isCur ? 7 : leaf ? 4.5 : 5.5;
      var c = '<circle class="' + cls + '" cx="' + pos[p].x + '" cy="' + pos[p].y + '" r="' + r + '"/>';
      if (opts.links && (seen || isCur)) c = '<a href="' + stepHref(sol, p) + '" aria-label="' + esc(nodeAt(sol, p).fix) + '">' + c + "</a>";
      dots += c;
    });
    return '<svg class="tree ' + (opts.cls || "") + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Map of ' + esc(sol.title) + ' paths">' + edges + dots + "</svg>";
  }

  // ---------------- solution menu ----------------
  function renderMenu() {
    state = { kind: "menu" }; setChrome("solutions");
    var p = DATA.problem;
    var total = 0, found = 0;
    var tiles = DATA.solutions.map(function (s, i) {
      var n = leafPaths(s.root, "").length, f = endingsFound(s);
      total += n; found += f;
      var started = visited()[s.id + ":"];
      return (
        '<a class="tile ' + s.theme + (f === n ? " done" : "") + ' rise" style="--i:' + (i + 2) + '" href="' + stepHref(s, "") + '">' +
        '<div class="tile-top"><span class="icon">' + icon(s.icon) + '</span><span class="tile-num">0' + (i + 1) + "</span></div>" +
        "<div><h3>" + esc(s.title) + "</h3><p>" + esc(s.tagline) + "</p></div>" +
        treeSvg(s, { cls: "tile-tree" }) +
        '<div class="tile-foot"><span class="found">' + (f === n ? '<span class="badge-done">' + icon("check") + "All endings found</span>" : f + " of " + n + " endings found") + "</span>" +
        '<span class="tile-cta">' + (started ? "Continue" : "Start") + icon("arrow") + "</span></div>" +
        "</a>"
      );
    }).join("");
    render(
      '<section class="screen"><div class="container">' +
      '<div class="menu-head"><div><div class="eyebrow rise" style="--i:0">Choose a strategy</div>' +
      '<h2 class="h2 rise" style="--i:1">' + esc(p.menuTitle) + "</h2>" +
      '<p class="lead rise" style="--i:1">' + esc(p.menuLead) + "</p></div>" +
      '<div class="meter rise" style="--i:2"><div class="meter-label"><span>Endings discovered</span><b>' + found + " / " + total + '</b></div><div class="meter-bar"><i data-w="' + Math.round((found / total) * 100) + '"></i></div></div></div>' +
      '<div class="tiles">' + tiles + "</div>" +
      '<a class="why-banner rise" style="--i:6" href="#/why"><span class="icon">' + icon("heart") + '</span><span><b>' + esc(DATA.closing.title) +
      "</b><span>What all of this adds up to, and what researchers are doing about it.</span></span>" + icon("arrow", "go") + "</a>" +
      (found ? '<div class="menu-foot"><button class="chip-btn" type="button" id="reset">' + icon("redo") + " Start over</button></div>" : "") +
      "</div></section>",
      function () {
        setTimeout(function () { var bar = app.querySelector(".meter-bar i"); if (bar) bar.style.width = bar.getAttribute("data-w") + "%"; }, 250);
        var r = document.getElementById("reset");
        if (r) r.addEventListener("click", function () { save(STORE, {}); renderMenu(); });
        bindSpotlight();
      }
    );
  }

  function bindSpotlight() {
    app.querySelectorAll(".tile, .path-card").forEach(function (t) {
      t.addEventListener("pointermove", function (e) {
        var r = t.getBoundingClientRect();
        t.style.setProperty("--mx", e.clientX - r.left + "px");
        t.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  // ---------------- a step in the tree ----------------
  function renderStep(solId, path) {
    var sol = solById(solId);
    if (!sol) return renderMenu();
    var node = nodeAt(sol, path);
    if (!node) return go(stepHref(sol, ""));
    var depth = path.length, maxDepth = leafPaths(sol.root, "")[0].length;
    state = { kind: "step", sol: sol, path: path, node: node, revealed: false };
    setChrome("step");
    markVisited(sol.id + ":" + path);

    var trail = "";
    for (var d = 0; d <= depth; d++) {
      var pp = path.slice(0, d), nn = nodeAt(sol, pp);
      var name = d === 0 ? sol.title : nn.label;
      trail += (d ? '<span class="sep">/</span>' : "") +
        (d === depth ? '<span class="crumb now">' + esc(name) + "</span>" : '<a class="crumb" href="' + stepHref(sol, pp) + '">' + esc(name) + "</a>");
    }
    var stepper = "";
    for (var k = 0; k <= maxDepth; k++) stepper += '<div class="' + (k < depth ? "past" : k === depth ? "now" : "") + '">Step ' + (k + 1) + "</div>";

    render(
      '<section class="screen step ' + sol.theme + '"><div class="step-layout">' +
      '<div class="step-main">' +
      '<div class="step-top rise" style="--i:0"><a class="back" href="#/solutions">' + icon("back") + "All strategies</a>" +
      '<span class="sol-chip"><span class="icon">' + icon(sol.icon) + "</span>" + esc(sol.title) + "</span></div>" +
      '<nav class="trail rise" style="--i:0" aria-label="Your path">' + trail + "</nav>" +
      '<div class="stepper rise" style="--i:1">' + stepper + "</div>" +
      '<article class="card fix-card rise" style="--i:2"><div class="label">' + icon("flask") + "Step " + (depth + 1) + " &middot; The fix</div>" +
      "<h2>" + esc(node.fix) + "</h2>" +
      '<p><span class="ok">' + icon("check") + "</span>" + esc(node.text) + "</p></article>" +
      '<div id="after"><div class="reveal-row rise" style="--i:3"><button class="btn danger" type="button" id="reveal">' + icon("alert") + "What goes wrong?</button>" +
      '<span class="hint">or press <kbd>&rarr;</kbd></span></div></div>' +
      "</div>" +
      '<aside class="map card rise" style="--i:3"><div class="label">' + icon("fork") + "Your map</div>" + treeSvg(sol, { current: path, links: true, cls: "map-tree" }) +
      '<p class="map-note">' + endingsFound(sol) + " of " + leafPaths(sol.root, "").length + " endings found. Tap a visited point to jump back.</p></aside>" +
      "</div></section>",
      function () { document.getElementById("reveal").addEventListener("click", reveal); }
    );
  }

  function exampleBlock(ex) {
    if (!ex) return "";
    var src = ex.source ? '<p class="src">Source: ' + (ex.link ? '<a href="' + esc(ex.link) + '" target="_blank" rel="noopener">' + esc(ex.source) + "</a>" : esc(ex.source)) + "</p>" : "";
    return '<details class="example"><summary>' + icon("book") + "Real example" + icon("chev", "chev") + '</summary><div class="ex-body"><p>' + esc(ex.body) + "</p>" + src + "</div></details>";
  }

  function typeInto(el, text, done) {
    if (reduce) { el.textContent = text; if (done) done(); return; }
    var i = 0, caret = document.createElement("span");
    caret.className = "caret";
    el.textContent = ""; el.appendChild(caret);
    var finish = function () {
      if (!typing) return;
      clearInterval(typing.timer); typing = null;
      el.textContent = text;
      if (done) done();
    };
    typing = { finish: finish, timer: setInterval(function () {
      i += 2;
      el.textContent = text.slice(0, i); el.appendChild(caret);
      if (i >= text.length) finish();
    }, 16) };
  }

  function reveal() {
    if (!state || state.kind !== "step") return;
    if (typing) { typing.finish(); return; }
    if (state.revealed) return;
    state.revealed = true;
    var s = state, sol = s.sol, node = s.node, after = document.getElementById("after");
    document.body.classList.add("alert");
    if (window.bgPulse) window.bgPulse("danger");
    after.innerHTML =
      '<article class="card wrong-card" role="status"><div class="label">' + icon("alert") + "What goes wrong</div>" +
      '<p class="text" aria-label="' + esc(node.wrong) + '"></p></article>';
    var textEl = after.querySelector(".text");
    after.querySelector(".wrong-card").scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    typeInto(textEl, node.wrong, function () {
      var html = exampleBlock(node.example);
      if (node.paths) {
        html += '<div class="choose"><div class="label">' + icon("fork") + "Choose your next move</div>" +
          '<div class="paths">' + node.paths.map(function (c, i) {
            return '<a class="path-card" style="--i:' + i + '" href="' + stepHref(sol, s.path + i) + '">' +
              '<span class="path-key">' + (i + 1) + "</span><span class=\"path-text\">" + esc(c.label) + "</span>" + icon("arrow", "go") + "</a>";
          }).join("") + "</div></div>";
      } else {
        var sib = s.path.slice(0, -1) + (s.path.slice(-1) === "0" ? "1" : "0");
        html += '<article class="card good-card"><div class="label">' + icon("spark") + "End of this path &middot; What researchers do</div><p>" + esc(node.researchers) + "</p></article>" +
          '<div class="terms">' + (node.terms || []).map(function (t) { return '<div class="term"><b>' + esc(t[0]) + "</b><span>" + esc(t[1]) + "</span></div>"; }).join("") + "</div>" +
          '<div class="actions"><a class="btn primary" href="' + stepHref(sol, sib) + '">Try the other path' + icon("arrow", "arrow") + "</a>" +
          '<a class="btn" href="#/solutions">' + icon("grid") + "Other strategies</a>" +
          '<a class="btn ghost" href="#/why">Why this matters</a></div>';
        if (window.bgPulse) setTimeout(function () { window.bgPulse("good"); }, 900);
      }
      var wrap = document.createElement("div");
      wrap.className = "after-wrong";
      wrap.innerHTML = html;
      after.appendChild(wrap);
      bindSpotlight();
      setTimeout(function () { document.body.classList.remove("alert"); }, 1400);
    });
  }

  // ---------------- why it matters ----------------
  function renderWhy() {
    state = { kind: "why" }; setChrome("why");
    var c = DATA.closing;
    var holes = [[[20, 30, 14], [70, 60, 10], [40, 120, 16], [80, 140, 9]], [[60, 25, 12], [25, 80, 15], [75, 110, 11], [35, 150, 9]],
      [[30, 40, 10], [70, 85, 16], [20, 135, 12], [65, 150, 8]], [[50, 20, 9], [80, 70, 13], [30, 100, 11], [60, 140, 15]], [[25, 55, 13], [65, 40, 9], [50, 120, 14], [80, 155, 10]]];
    var slices = holes.map(function (hs, i) {
      return '<div class="slice" style="left:' + (8 + i * 17) + '%;z-index:' + (10 - i) + '">' + hs.map(function (h) {
        return '<i style="left:' + h[0] + "%;top:" + h[1] + "px;width:" + h[2] + "px;height:" + h[2] + 'px"></i>';
      }).join("") + "</div>";
    }).join("");
    render(
      '<section class="screen"><div class="container">' +
      '<div class="why-hero"><div class="eyebrow rise" style="--i:0">Putting it together</div>' +
      '<h2 class="h2 rise" style="--i:1">' + esc(c.title) + '</h2><p class="lead rise" style="--i:2">' + esc(c.lead) + "</p></div>" +
      '<div class="patterns">' + c.patterns.map(function (p, i) {
        return '<div class="pattern rise" style="--i:' + (i + 3) + '"><span class="n grad-text">0' + (i + 1) + "</span><b>" + esc(p[0]) + "</b><span>" + esc(p[1]) + "</span></div>";
      }).join("") + "</div>" +
      '<div class="section card cheese-card rise" style="--i:6"><div class="cheese-wrap"><div class="cheese-stage" id="stage"><div class="threat" id="threat"></div>' + slices + "</div>" +
      '<div class="cheese-ctrl"><div class="eyebrow">No single slice is enough</div><h3>Stack the layers</h3>' +
      '<div class="big"><span id="through">40</span><small> of 100</small></div><div class="small">dangerous mistakes slip through (illustration)</div>' +
      '<input type="range" min="1" max="5" value="1" id="layers" aria-label="Number of safety layers">' +
      '<div class="small"><span id="layer-n">1 layer</span> &middot; each catches 60%</div><p>' + esc(c.cheese) + "</p></div></div></div>" +
      '<div class="section"><div class="eyebrow">The field today</div><h3>What researchers are working on</h3><div class="chips">' +
      c.field.map(function (f) { return '<span class="chip">' + esc(f) + "</span>"; }).join("") + "</div></div>" +
      '<div class="section"><div class="eyebrow">Discuss</div><h3>Talk about it</h3><div class="questions">' +
      c.questions.map(function (q, i) { return '<div class="q"><span class="qn">' + (i + 1) + "</span><span>" + esc(q) + "</span></div>"; }).join("") + "</div></div>" +
      '<div class="section"><div class="eyebrow">Go further</div><h3>Learn more</h3><div class="links">' +
      c.learn.map(function (l) { return '<a class="btn" href="' + esc(l[1]) + '" target="_blank" rel="noopener">' + esc(l[0]) + icon("arrow", "arrow") + "</a>"; }).join("") + "</div></div>" +
      '<div class="actions" style="justify-content:center;margin-top:56px"><a class="btn primary" href="#/solutions">' + icon("grid") + 'Back to strategies</a><a class="btn" href="#/">Start page</a></div>' +
      "</div></section>",
      function () {
        var range = document.getElementById("layers");
        var update = function () {
          var n = +range.value, through = Math.round(100 * Math.pow(0.4, n));
          document.getElementById("through").textContent = through;
          document.getElementById("layer-n").textContent = n + (n === 1 ? " layer" : " layers");
          app.querySelectorAll(".slice").forEach(function (sl, i) { sl.classList.toggle("off", i >= n); });
          document.getElementById("threat").style.width = (n >= 4 ? 8 + (n - 1) * 17 + 4 : 100) + "%";
          document.getElementById("threat").style.opacity = through <= 3 ? 0.35 : 1;
        };
        range.addEventListener("input", update);
        update();
      }
    );
  }

  // ---------------- router ----------------
  function route() {
    var h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "solutions") renderMenu();
    else if (h[0] === "why") renderWhy();
    else if (h[0] === "s" && h[1]) renderStep(h[1], (h[2] || "r").replace(/^r/, "").replace(/[^01]/g, ""));
    else renderHome();
  }

  // ---------------- presenter mode ----------------
  var toggle = document.getElementById("present-toggle");
  function setPresent(on) {
    document.body.classList.toggle("present", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    save("ai-safety-present", on);
  }
  toggle.addEventListener("click", function () { setPresent(!document.body.classList.contains("present")); });
  setPresent(/[?&]present\b/.test(location.search) || load("ai-safety-present", false));

  // ---------------- keyboard (projector / clicker) ----------------
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    var k = e.key;
    if (k === "p" || k === "P") return setPresent(!document.body.classList.contains("present"));
    if (k === "Escape") return go("#/solutions");
    if (!state) return;
    var fwd = k === "ArrowRight" || k === "PageDown" || (k === " " && tag !== "BUTTON" && tag !== "A" && tag !== "SUMMARY");
    if (state.kind === "home" && (fwd || k === "Enter") && tag !== "A") { e.preventDefault(); return go("#/solutions"); }
    if (state.kind !== "step") return;
    if (fwd) {
      e.preventDefault();
      if (!state.revealed || typing) return reveal();
      if (!state.node.paths) return go("#/solutions");
    }
    if ((k === "1" || k === "2") && state.revealed && !typing && state.node.paths) go(stepHref(state.sol, state.path + (+k - 1)));
    if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); history.back(); }
  });

  window.addEventListener("hashchange", route);
  route();
})();
