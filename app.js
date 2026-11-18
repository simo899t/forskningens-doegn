(function () {
  "use strict";

  var DATA = window.EXPLORER;
  var app = document.getElementById("app");
  var STORE = "ai-safety-visited-v2";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = null; // what the current screen is
  var timer = null; // pending "what goes wrong" reveal

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
  function stepHref(sol, path) { return "#/s/" + sol.id + "/r" + path; }
  function go(h) { location.hash = h; }
  function rise(i) { return ' class="rise" style="--i:' + i + '"'; }

  // ---------------- page transitions ----------------
  function render(html, after) {
    clearTimeout(timer);
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
    if (window.bgCalm) window.bgCalm(kind === "step");
  }

  // ---------------- home ----------------
  function renderHome() {
    state = { kind: "home" }; setChrome("home");
    var p = DATA.problem;
    render(
      '<section class="screen hero"><div class="hero-inner">' +
      '<h1><span class="l rise" style="--i:0">' + esc(p.titleTop) + '</span><span class="l rise" style="--i:1"><span class="danger-text">' + esc(p.titleBottom) + "</span></span></h1>" +
      '<p class="sub rise" style="--i:2">' + esc(p.sub) + "</p>" +
      "<div" + rise(3) + '><a class="explore" href="#/solutions"><span>' + esc(p.button) + "</span>" + icon("arrow") + "</a></div>" +
      "</div></section>"
    );
  }

  // ---------------- the three solutions ----------------
  function renderMenu() {
    state = { kind: "menu" }; setChrome("solutions");
    var tiles = DATA.solutions.map(function (s, i) {
      return (
        '<a class="tile ' + s.theme + ' rise" style="--i:' + (i + 1) + '" href="' + stepHref(s, "") + '">' +
        '<span class="icon">' + icon(s.icon) + "</span>" +
        "<h3>" + esc(s.title) + "</h3>" + icon("arrow", "tile-go") +
        "</a>"
      );
    }).join("");
    render(
      '<section class="screen menu"><div class="container">' +
      '<h2 class="h2 menu-title rise" style="--i:0">' + esc(DATA.problem.menuTitle) + "</h2>" +
      '<div class="tiles">' + tiles + "</div>" +
      "</div></section>",
      bindSpotlight
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

  // ---------------- a step: the fix, what goes wrong, two options ----------------
  function renderStep(solId, path) {
    var sol = solById(solId);
    if (!sol) return renderMenu();
    var node = nodeAt(sol, path);
    if (!node) return go(stepHref(sol, ""));
    var depth = path.length;
    state = { kind: "step", sol: sol, path: path, node: node };
    setChrome("step");
    markVisited(sol.id + ":" + path);

    // Where you came from: the solution, then each option picked so far (the current one is the headline)
    var crumbs = '<span class="c">' + (depth ? '<a href="' + stepHref(sol, "") + '">' : "<span>") + '<span class="ci">' + icon(sol.icon) + "</span>" + esc(sol.title) + (depth ? "</a>" : "</span>") + "</span>";
    for (var d = 1; d < depth; d++) {
      crumbs += '<span class="c">' + icon("chev", "sep") + '<a href="' + stepHref(sol, path.slice(0, d)) + '">' + esc(nodeAt(sol, path.slice(0, d)).label) + "</a></span>";
    }
    var backHref = depth ? stepHref(sol, path.slice(0, -1)) : "#/solutions";

    var next;
    if (node.paths) {
      next = '<div class="paths">' + node.paths.map(function (c, i) {
        return '<a class="path-card" style="--i:' + i + '" href="' + stepHref(sol, path + i) + '">' +
          '<span class="path-key">' + (i + 1) + '</span><span class="path-text">' + esc(c.label) + "</span>" + icon("arrow", "go") + "</a>";
      }).join("") + "</div>";
    } else {
      var sib = path.slice(0, -1) + (path.slice(-1) === "0" ? "1" : "0");
      next = '<article class="card good-card"><div class="label">' + icon("spark") + "What researchers do</div><p>" + esc(node.goodShort || node.researchers) + "</p></article>" +
        '<div class="actions"><a class="btn primary" href="' + stepHref(sol, sib) + '">Try the other option' + icon("arrow", "arrow") + "</a>" +
        '<a class="btn" href="#/solutions">' + icon("grid") + "Other solutions</a></div>";
    }
    var ex = node.example || {};
    var more = '<details class="example"><summary>' + icon("book") + "More detail" + icon("chev", "chev") + '</summary><div class="ex-body"><p>' + esc(node.wrong) + "</p>" +
      (ex.body ? "<p>" + esc(ex.body) + "</p>" : "") +
      (ex.source ? '<p class="src">Source: ' + (ex.link ? '<a href="' + esc(ex.link) + '" target="_blank" rel="noopener">' + esc(ex.source) + "</a>" : esc(ex.source)) + "</p>" : "") +
      "</div></details>";

    render(
      '<section class="screen step ' + sol.theme + '"><div class="step-main">' +
      '<div class="step-top rise" style="--i:0"><a class="back" href="' + backHref + '" aria-label="Back" title="Back">' + icon("back") + "</a>" +
      '<nav class="crumbs" aria-label="Your choices">' + crumbs + "</nav></div>" +
      '<h2 class="fix rise" style="--i:1">' + esc(node.fix) + "</h2>" +
      '<div id="after" class="after-wrong">' +
      '<article class="card wrong-card" role="status"><div class="label">' + icon("alert") + "But</div><p class=\"text\">" + esc(node.short) + "</p></article>" +
      next + more + "</div>" +
      "</div></section>",
      function () {
        bindSpotlight();
        var after = document.getElementById("after");
        timer = setTimeout(function () {
          after.classList.add("show");
          document.body.classList.add("alert");
          if (window.bgPulse) window.bgPulse("danger");
          if (!node.paths && window.bgPulse) setTimeout(function () { window.bgPulse("good"); }, 900);
          timer = setTimeout(function () { document.body.classList.remove("alert"); }, 1400);
        }, reduce ? 0 : 450);
      }
    );
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "solutions" || h[0] === "why") renderMenu();
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
    if (state.kind === "menu" && /^[1-3]$/.test(k)) return go(stepHref(DATA.solutions[+k - 1], ""));
    if (state.kind !== "step") return;
    if ((k === "1" || k === "2") && state.node.paths) go(stepHref(state.sol, state.path + (+k - 1)));
    if (fwd && !state.node.paths) { e.preventDefault(); go("#/solutions"); }
    if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); history.back(); }
  });

  window.addEventListener("hashchange", route);
  route();
})();
