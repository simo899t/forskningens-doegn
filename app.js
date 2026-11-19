(function () {
  "use strict";

  // ---------------- language ----------------
  // Danish (content.da.js) only holds words. It is laid over the English tree, so both stay in step.
  function merge(base, over) {
    if (over == null) return base;
    if (Array.isArray(base)) return base.map(function (b, i) { return merge(b, over[i]); });
    if (base && typeof base === "object") {
      var out = {};
      Object.keys(base).forEach(function (k) { out[k] = merge(base[k], over[k]); });
      return out;
    }
    return over;
  }
  var LANG = "en";
  try { LANG = localStorage.getItem("ai-safety-lang") === "da" ? "da" : "en"; } catch (e) { /* no storage */ }
  if (/[?&]lang=da\b/.test(location.search)) LANG = "da";
  if (/[?&]lang=en\b/.test(location.search)) LANG = "en";
  function build() { return LANG === "da" && window.EXPLORER_DA ? merge(window.EXPLORER, window.EXPLORER_DA) : window.EXPLORER; }
  var DATA = build();
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
    power: '<path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5z"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    pulse: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    toggle: '<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="7" cy="12" r="3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z"/>',
    thumb: '<path d="M7 11v9H4v-9h3zM7 11l4-8a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/>',
    loop: '<path d="M4 12a8 8 0 0 1 14-5.3L20 9"/><path d="M20 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L4 15"/><path d="M4 20v-5h5"/>',
    scroll: '<path d="M6 3h11v14a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h11v1"/><path d="M9 8h5M9 12h5"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    building: '<path d="M4 21V5l8-2v18M12 7l8 2v12M2 21h20"/><path d="M8 9h.01M8 13h.01M8 17h.01M16 13h.01M16 17h.01"/>',
    filter: '<path d="M3 4h18l-7 8v6l-4 2v-8L3 4z"/>',
    tag: '<path d="M3 12V3h9l9 9-9 9-9-9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
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
  // One look for every choice on the site: a round badge with a number and a symbol, then a title and a short line.
  var CHOICE_COLORS = ["#b9a6ff", "#7cc4ff", "#ff9fb8", "#ffd23f", "#7fd8a6", "#ffb07a"];
  function choiceColor(i) { return CHOICE_COLORS[i % CHOICE_COLORS.length]; }
  function orb(i, iconName) {
    return '<span class="ch-orb" aria-hidden="true"><span class="ch-ring"></span><span class="ch-num">' + (i + 1 < 10 ? "0" : "") + (i + 1) + "</span>" + icon(iconName || "check") + "</span>";
  }
  function choice(href, label, desc, iconName, i, cls) {
    return '<a class="choice ' + (cls || "") + '" style="--i:' + i + ";--cc:" + (cls === "choice-win" ? "#e2462b" : choiceColor(i)) + '" href="' + href + '">' + orb(i, iconName) +
      '<span class="ch-title">' + esc(label) + "</span>" + (desc ? '<span class="ch-desc">' + esc(desc) + "</span>" : "") + "</a>";
  }
  // ---------------- missions (the game) ----------------
  function missionText() { return LANG === "da" ? merge(window.MISSIONS.en, window.MISSIONS.da) : window.MISSIONS.en; }
  function renderMissions() {
    state = { kind: "menu" }; setChrome("solutions");
    var t = missionText();
    var items = [["align", t.align], ["interp", t.interp], ["control", t.control]].map(function (x, i) { return choice("#/m/" + x[0], x[1].tagline, x[1].title, x[1].icon, i); }).join("");
    render(
      '<section class="screen menu"><div class="container">' +
      '<h2 class="h2 menu-title rise" style="--i:0">' + esc(t.menuTitle) + "</h2>" +
      '<p class="mission rise" style="--i:1">' + esc(t.menuSub) + "</p>" +
      '<div class="choices">' + items + "</div></div></section>"
    );
  }
  function renderMission(id) {
    if (["align", "interp", "brain", "steer", "control", "access", "monitor"].indexOf(id) < 0) return go("#/play");
    state = { kind: "mission", id: id }; setChrome("step");
    render('<section class="screen step mission-' + id + '"><div class="step-main">' +
      '<div class="step-top rise" style="--i:0"><a class="back" href="' + (id === "access" || id === "monitor" ? "#/m/control" : id === "brain" || id === "steer" ? "#/m/interp" : "#/play") + '" aria-label="' + esc(DATA.ui.back) + '" title="' + esc(DATA.ui.back) + '">' + icon("back") + "</a></div>" +
      '<div id="mission"></div></div></section>', function () {
      window.Missions.render(document.getElementById("mission"), id, {
        lang: LANG, t: missionText(), icon: icon, esc: esc, color: choiceColor, orb: orb, choice: choice, demoWords: DATA.ui.demo,
        shutdownChoice: choice("#/win", DATA.solutions[2].root.paths[4].label, DATA.solutions[2].root.paths[4].fix, "power", 0, "choice-win"),
        shutdown: function (i) { return choice("#/win", DATA.solutions[2].root.paths[4].label, DATA.solutions[2].root.paths[4].fix, "power", i, "choice-win"); },
      });
    });
  }
  function rise(i) { return ' class="rise" style="--i:' + i + '"'; }

  // ---------------- page transitions ----------------
  function render(html, after) {
    clearTimeout(timer);
    if (window.Demo) window.Demo.stop();
    if (window.Missions) window.Missions.stop();
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
    document.body.classList.toggle("on-step", kind === "step");
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
      (p.homeMission ? '<p class="home-mission rise" style="--i:3">' + esc(p.homeMission) + "</p>" : "") +
      "<div" + rise(4) + '><a class="explore" href="#/play"><span>' + esc(p.button) + "</span>" + icon("arrow") + "</a></div>" +
      "</div></section>"
    );
  }

  // ---------------- the three solutions ----------------
  function renderMenu() {
    state = { kind: "menu" }; setChrome("solutions");
    var tiles = DATA.solutions.map(function (s, i) { return choice(stepHref(s, ""), s.title, s.tagline, s.icon, i); }).join("");
    var head = '<h2 class="h2 menu-title rise" style="--i:0">' + esc(DATA.problem.menuTitle) + "</h2>" +
      (DATA.problem.mission ? '<p class="mission rise" style="--i:1">' + esc(DATA.problem.mission) + "</p>" : "");
    render(
      '<section class="screen menu"><div class="container">' + head +
      '<p class="choose-label rise" style="--i:2">' + esc(DATA.ui.pickCategory) + "</p>" +
      '<div class="choices">' + tiles + "</div>" +
      "</div></section>",
      bindSpotlight
    );
  }

  function bindSpotlight() {
    app.querySelectorAll(".tile, .choice").forEach(function (t) {
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
    if (node.win) return go("#/win");
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
      next = '<p class="choose-label">' + esc(node.category ? DATA.ui.pickCategory : DATA.ui.pickNext) + "</p>" +
        '<div class="choices after-in">' + node.paths.map(function (c, i) {
          return choice(c.win ? "#/win" : stepHref(sol, path + i), c.label, c.fix, c.icon, i, c.win ? "choice-win" : "");
        }).join("") + "</div>";
    } else {
      var g = DATA.game;
      next = '<div class="outcome"><p class="outcome-kicker">' + esc(g.loseKicker) + "</p>" +
        "<h3>" + esc(g.loseTitle) + "</h3>" +
        '<p class="researchers">' + esc(node.goodShort) + "</p></div>" +
        '<div class="actions"><a class="btn primary" href="#/">' + icon("redo") + esc(g.again) + "</a></div>";
    }
    var ex = node.example || {};
    var more = '<details class="example"><summary>' + icon("book") + esc(DATA.ui.moreDetail) + icon("chev", "chev") + '</summary><div class="ex-body"><p>' + esc(node.wrong) + "</p>" +
      (ex.body ? "<p>" + esc(ex.body) + "</p>" : "") +
      (ex.source ? '<p class="src">' + esc(DATA.ui.source) + " " + (ex.link ? '<a href="' + esc(ex.link) + '" target="_blank" rel="noopener">' + esc(ex.source) + "</a>" : esc(ex.source)) + "</p>" : "") +
      "</div></details>";

    render(
      '<section class="screen step ' + sol.theme + (node.category ? " is-category" : "") + '"><div class="step-main">' +
      '<div class="step-top rise" style="--i:0"><a class="back" href="' + backHref + '" aria-label="' + esc(DATA.ui.back) + '" title="' + esc(DATA.ui.back) + '">' + icon("back") + "</a>" +
      '<nav class="crumbs" aria-label="Your choices">' + crumbs + "</nav></div>" +
      '<h2 class="fix rise" style="--i:1">' + esc(node.fix) + "</h2>" +
      (node.intro ? '<p class="cat-intro rise" style="--i:2">' + esc(node.intro) + "</p>" : "") +
      '<div id="after" class="after-wrong">' +
      (node.category ? "" : '<div class="problem" role="status"><p class="problem-line"><b>' + esc(DATA.ui.problem) + "</b> " + esc(node.short) + "</p>" + (node.demo ? '<div class="demo" id="demo"></div>' : "") + "</div>") +
      next + (node.category ? "" : more) + "</div>" +
      "</div></section>",
      function () {
        bindSpotlight();
        var after = document.getElementById("after");
        if (node.category) { after.classList.add("show", "category"); return; }
        timer = setTimeout(function () {
          after.classList.add("show");
          if (window.Demo && node.demo) window.Demo.render(document.getElementById("demo"), node.demo, DATA.ui.demo);
        }, reduce ? 0 : 450);
      }
    );
  }

  // ---------------- the only ending that works ----------------
  function renderWin() {
    state = { kind: "end" }; setChrome("end");
    var g = DATA.game;
    if (window.bgPulse) window.bgPulse("good");
    render(
      '<section class="screen hero end win"><div class="hero-inner">' +
      '<div class="rise" style="--i:0"><span class="alert-pill good">' + esc(g.winKicker) + "</span></div>" +
      '<h1 class="end-title rise" style="--i:1"><span class="grad-text">' + esc(g.winTitle) + "</span></h1>" +
      '<p class="sub rise" style="--i:2">' + esc(g.winText) + "</p>" +
      '<p class="sub end-why rise" style="--i:3">' + esc(g.winWhy) + "</p>" +
      '<div class="end-actions rise" style="--i:4"><a class="explore" href="#/"><span>' + esc(g.again) + "</span>" + icon("redo") + "</a></div>" +
      "</div></section>"
    );
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "m" && h[1]) renderMission(h[1]);
    else if (h[0] === "win") renderWin();
    else if (h[0] === "play" || h[0] === "solutions" || h[0] === "end" || h[0] === "why" || h[0] === "s") renderMissions();
    else renderHome();
  }

  // ---------------- page chrome and the language switch ----------------
  var langBtn = document.getElementById("lang-toggle");
  function applyChrome() {
    var u = DATA.ui;
    document.documentElement.lang = LANG;
    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = u[el.getAttribute("data-t")]; });
    langBtn.textContent = u.langButton; langBtn.title = u.langTitle; langBtn.setAttribute("aria-label", u.langTitle);
  }
  langBtn.addEventListener("click", function () {
    LANG = LANG === "da" ? "en" : "da";
    try { localStorage.setItem("ai-safety-lang", LANG); } catch (e) { /* no storage */ }
    DATA = build(); applyChrome(); route();
  });
  applyChrome();

  // ---------------- settings (behind PIN 1612): fullscreen and zoom ----------------
  var PIN = "1612", kiosk = false, typed = "", pinOk = null;
  var pinEl = document.getElementById("pin"), setEl = document.getElementById("settings");
  function enterFs() { var d = document.documentElement; var f = d.requestFullscreen || d.webkitRequestFullscreen; if (f) { var r = f.call(d); if (r && r.catch) r.catch(function () {}); } }
  function exitFs() { var f = document.exitFullscreen || document.webkitExitFullscreen; if (f && isFs()) { var r = f.call(document); if (r && r.catch) r.catch(function () {}); } }
  function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function dots() { pinEl.querySelectorAll(".pin-dots i").forEach(function (d, i) { d.classList.toggle("on", i < typed.length); }); }
  function askPin(ok) { pinOk = ok; typed = ""; dots(); pinEl.hidden = false; }
  pinEl.querySelector(".pin-keys").innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map(function (k) {
    return k === "" ? "<span></span>" : '<button type="button" data-k="' + k + '">' + k + "</button>";
  }).join("");
  pinEl.querySelectorAll("[data-k]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-k");
      if (k === "⌫") typed = typed.slice(0, -1); else if (typed.length < PIN.length) typed += k;
      dots();
      if (typed.length === PIN.length) {
        if (typed === PIN) { pinEl.hidden = true; if (pinOk) pinOk(); }
        else { pinEl.classList.add("wrong"); setTimeout(function () { pinEl.classList.remove("wrong"); typed = ""; dots(); }, 500); }
      }
    });
  });
  pinEl.querySelector(".pin-back").addEventListener("click", function () { pinEl.hidden = true; });
  ["fullscreenchange", "webkitfullscreenchange"].forEach(function (ev) {
    document.addEventListener(ev, function () { if (kiosk && !isFs()) { kiosk = false; document.body.classList.remove("kiosk"); setEl.querySelector(".set-fs").setAttribute("aria-pressed", "false"); } });
  });
  function setKiosk(on) {
    kiosk = on; document.body.classList.toggle("kiosk", on);
    setEl.querySelector(".set-fs").setAttribute("aria-pressed", on ? "true" : "false");
    if (on) enterFs(); else exitFs();
  }
  var ZOOMS = [0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6, 1.8, 2], zi = ZOOMS.indexOf(+load("ai-safety-zoom", 1));
  if (zi < 0) zi = 2;
  function applyZoom() {
    var app = document.getElementById("app"); app.style.zoom = ZOOMS[zi]; app.style.setProperty("--zoom", ZOOMS[zi]);
    setEl.querySelector(".set-zoom b").textContent = Math.round(ZOOMS[zi] * 100) + "%";
    save("ai-safety-zoom", ZOOMS[zi]);
  }
  setEl.querySelectorAll("[data-z]").forEach(function (b) {
    b.addEventListener("click", function () { zi = Math.max(0, Math.min(ZOOMS.length - 1, zi + +b.getAttribute("data-z"))); applyZoom(); });
  });
  setEl.querySelector(".set-fs").addEventListener("click", function () { setKiosk(!kiosk); });
  setEl.querySelector(".set-close").addEventListener("click", function () { setEl.hidden = true; });
  document.getElementById("set-btn").addEventListener("click", function () { askPin(function () { setEl.hidden = false; }); });
  applyZoom();

  // ---------------- back to the landing page after 3 minutes without activity ----------------
  var idle = null;
  function poke() {
    clearTimeout(idle);
    idle = setTimeout(function () { if (location.hash && location.hash !== "#/") { go("#/"); window.scrollTo(0, 0); } }, 180000);
  }
  ["pointerdown", "pointermove", "keydown", "wheel", "touchstart", "scroll"].forEach(function (ev) { window.addEventListener(ev, poke, { passive: true }); });
  poke();

  // ---------------- keyboard (projector / clicker) ----------------
  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    var k = e.key;
    if (k === "Escape") return go("#/solutions");
    if (!state) return;
    var fwd = k === "ArrowRight" || k === "PageDown" || (k === " " && tag !== "BUTTON" && tag !== "A" && tag !== "SUMMARY");
    if (state.kind === "home" && (fwd || k === "Enter") && tag !== "A") { e.preventDefault(); return go("#/solutions"); }
    if (state.kind === "menu" && /^[1-3]$/.test(k)) return go(["#/m/align", "#/m/interp", "#/m/control"][+k - 1]);
    if (state.kind !== "step") return;
    if (/^[1-9]$/.test(k) && state.node.paths && state.node.paths[+k - 1]) go(state.node.paths[+k - 1].win ? "#/win" : stepHref(state.sol, state.path + (+k - 1)));
    if (fwd && !state.node.paths) { e.preventDefault(); go("#/solutions"); }
    if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); history.back(); }
  });

  window.addEventListener("hashchange", route);
  route();
})();
