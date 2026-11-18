// The two missions (mini-games). Text is in missions-content.js.
// Missions.render(el, id, ctx) draws mission `id` ("align" or "brain") into `el`.
// ctx: { lang, t (MISSIONS[lang] merged over English), icon(name), esc(s), choiceRound(i, iconName, cls), demoWords }
window.Missions = (function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [], raf = 0;
  function later(fn, ms) { var t = setTimeout(fn, reduce ? 0 : ms); timers.push(t); return t; }
  function stop() { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); if (window.Demo) window.Demo.stop(); }

  // explanations stay folded behind a "Read why" button, so each screen is mostly the thing you play with
  function why(c, label, html) {
    return '<details class="readwhy"><summary><span>' + c.esc(label) + '</span><i aria-hidden="true">+</i></summary><div class="readwhy-body">' + html + "</div></details>";
  }
  function head(c, m, short) {
    return '<div class="m-head rise" style="--i:0"><span class="m-kicker">' + c.esc(m.tagline) + "</span>" +
      '<h2 class="fix">' + c.esc(m.heading) + "</h2>" + (short ? "" : '<p class="cat-intro">' + c.esc(m.intro) + "</p>") + "</div>";
  }
  function outcome(c, text, pre) {
    var t = c.t;
    return '<div class="outcome">' +
      why(c, t.readMore, (pre || "") + '<p class="researchers">' + c.esc(text) + "</p>") + "</div>" +
      '<div class="actions m-actions"><button class="btn primary" type="button" data-again>' + c.icon("redo") + c.esc(t.retry) + "</button>" +
      '<a class="btn" href="#/play">' + c.esc(t.otherMission) + "</a></div>";
  }

  // ======================= Mission 1: teach it rules =======================
  function align(el, c) {
    var m = c.t.align, order = []; // picked rule ids, most important first
    function rule(id) { return m.rules.filter(function (r) { return r.id === id; })[0]; }
    function pickScreen() {
      stop();
      el.innerHTML = head(c, m) +
        '<div class="m-rulebox rise" style="--i:1"><div><p class="choose-label">' + c.esc(m.pick) + '</p><div class="m-rules">' + m.rules.map(function (r, i) {
          return '<button type="button" class="choice m-toggle" data-rule="' + r.id + '" style="--i:' + i + ";--cc:" + c.color(i) + '">' +
            c.orb(i, r.icon) + '<span class="ch-title">' + c.esc(r.label) + "</span></button>";
        }).join("") + '</div></div><div class="m-list"><p class="choose-label">' + c.esc(m.list) + "</p>" +
        [m.slot1, m.slot2].map(function (lab, k) { return '<div class="m-slot" data-slot="' + k + '"><span class="m-slot-n">#' + (k + 1) + '</span><div class="m-slot-body"><small>' + c.esc(lab) + '</small><div class="m-slot-in"></div></div></div>'; }).join("") +
        "</div></div>" +
        '<div class="m-go rise" style="--i:3"><button class="explore" type="button" data-train><span>' + c.esc(m.train) + "</span>" + c.icon("spark") + "</button></div>";
      var btn = el.querySelector("[data-train]");
      function colorOf(id) { return c.color(m.rules.map(function (r) { return r.id; }).indexOf(id)); }
      function sync() {
        el.querySelectorAll(".m-toggle").forEach(function (b) { b.classList.toggle("used", order.indexOf(b.getAttribute("data-rule")) >= 0); });
        el.querySelectorAll(".m-slot").forEach(function (sl, k) {
          var id = order[k], r = id && rule(id), box = sl.querySelector(".m-slot-in");
          sl.classList.toggle("full", !!id);
          box.innerHTML = id ? '<span class="m-slot-item" data-rule="' + id + '" style="--cc:' + colorOf(id) + '"><span class="m-slot-ic">' + c.icon(r.icon) + "</span>" + c.esc(r.label) + "</span>"
            : '<span class="m-slot-empty">' + c.esc(m.drop) + "</span>";
          var it = box.querySelector(".m-slot-item"); if (it) drag(it, true);
        });
        btn.disabled = !order.length;
      }
      function slotAt(x, y) { var hit = null; el.querySelectorAll(".m-slot").forEach(function (sl) { var r = sl.getBoundingClientRect(); if (x > r.left && x < r.right && y > r.top && y < r.bottom) hit = +sl.getAttribute("data-slot"); }); return hit; }
      function place(id, k) { // put rule id into slot k (swapping if it came from the other slot)
        var from = order.indexOf(id);
        if (k === null) { if (from >= 0) order.splice(from, 1); return; }
        if (from === k) return;
        if (from >= 0) { order[from] = order[k]; order[k] = id; order = order.filter(Boolean); return; }
        if (k >= order.length) order.push(id); else order[k] = id;
      }
      function tap(id, fromList) {
        var k = order.indexOf(id);
        if (fromList || k >= 0) order.splice(k, 1); else if (order.length < 2) order.push(id); else order[1] = id;
        sync();
      }
      function drag(b, fromList) {
        var id = b.getAttribute("data-rule"), ghost = null, sx = 0, sy = 0, moved = false;
        b.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; moved = false; b.setPointerCapture(e.pointerId); e.preventDefault(); });
        b.addEventListener("pointermove", function (e) {
          if (!b.hasPointerCapture(e.pointerId)) return;
          if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 6) {
            moved = true;
            ghost = document.createElement("span"); ghost.className = "m-slot-item m-drag-ghost"; ghost.style.setProperty("--cc", colorOf(id));
            ghost.innerHTML = '<span class="m-slot-ic">' + c.icon(rule(id).icon) + "</span>" + c.esc(rule(id).label);
            document.body.appendChild(ghost); el.querySelector(".m-list").classList.add("dragging");
          }
          if (ghost) {
            ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px";
            var k = slotAt(e.clientX, e.clientY);
            el.querySelectorAll(".m-slot").forEach(function (sl, i) { sl.classList.toggle("over", i === k); });
          }
        });
        function end(e) {
          if (ghost) {
            ghost.remove(); ghost = null; el.querySelector(".m-list").classList.remove("dragging");
            el.querySelectorAll(".m-slot").forEach(function (sl) { sl.classList.remove("over"); });
            if (e.type === "pointerup") { var k = slotAt(e.clientX, e.clientY); if (k !== null || fromList) { if (k !== null && k > order.length) k = order.length; place(id, k); sync(); } }
          } else if (e.type === "pointerup" && !moved) tap(id, fromList);
        }
        b.addEventListener("pointerup", end); b.addEventListener("pointercancel", end);
        b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(id, fromList); } });
      }
      el.querySelectorAll(".m-toggle").forEach(function (b) { drag(b, false); });
      btn.addEventListener("click", train);
      sync();
    }
    function train() {
      stop();
      el.innerHTML = head(c, m) +
        '<div class="m-train"><div class="m-chips">' + order.map(function (id, k) { var r = rule(id); return '<span class="m-chip"><b>#' + (k + 1) + "</b>" + c.icon(r.icon) + c.esc(r.label) + "</span>"; }).join("") + "</div>" +
        '<p class="m-train-label">' + c.esc(m.training) + '</p><div class="m-bar"><i></i></div><p class="m-train-count"><b>0</b> ' + c.esc(m.examples) + "</p></div>";
      var bar = el.querySelector(".m-bar i"), num = el.querySelector(".m-train-count b"), t0 = performance.now(), ms = reduce ? 1 : 2600;
      (function tick(now) {
        var k = Math.min(1, (now - t0) / ms);
        bar.style.width = k * 100 + "%";
        num.textContent = Math.round(k * k * 1000000).toLocaleString(c.lang === "da" ? "da-DK" : "en-US");
        if (k < 1) raf = requestAnimationFrame(tick); else later(result, 350);
      })(t0);
    }
    function result() {
      var lines, why;
      if (order.length === 1) { lines = m.singles[order[0]].lines; why = m.singles[order[0]].why; }
      else {
        var top = order[0], low = order[1];
        var p = m.pairs.filter(function (x) { return (x.a === top && x.b === low) || (x.a === low && x.b === top); })[0];
        lines = p.ask.concat([["think", m.think.replace("{a}", rule(top).label).replace("{b}", rule(low).label)], ["ai", p.win[top]]]);
        why = p.why[top];
      }
      el.innerHTML = head(c, m, true) +
        '<p class="m-done">' + c.icon("check") + c.esc(m.trained) + "</p>" +
        '<div class="demo" id="m-chat"></div>' +
        '<p class="m-stamp out m-align-why">' + c.esc(why) + "</p>" +
        outcome(c, m.outcome);
      window.Demo.render(el.querySelector("#m-chat"), { type: "chat", app: m.app, lines: lines }, c.demoWords);
      el.querySelector("[data-again]").addEventListener("click", function () { order = []; pickScreen(); window.scrollTo(0, 0); });
    }
    pickScreen();
  }

  // ======================= Mission 2: operate on its brain =======================
  var FEATURES = [ // where each concept sits on the scanner (0-100) and its colour
    { id: "bridge", at: 18, color: "#38bdf8", spread: 11 },
    { id: "dog", at: 50, color: "#fbbf24", spread: 11 },
    { id: "gun", at: 82, color: "#f43f5e", spread: 11 },
  ];
  function brain(el, c) {
    var m = c.t.brain;
    stop();
    el.innerHTML = head(c, m) +
      '<div class="m-brain"><canvas aria-hidden="true"></canvas><div class="m-found" aria-live="polite"></div></div>' +
      '<div class="m-scan"><label for="m-slider">' + c.icon("search") + c.esc(m.scan) + '</label><input id="m-slider" type="range" min="0" max="100" value="0"></div>' +
      '<div class="m-go"><button class="explore" type="button" data-remove disabled><span>' + c.esc(m.remove) + "</span>" + c.icon("toggle") + "</button></div>" +
      '<div id="m-after"></div><div class="m-brain-outcome"></div>';
    var cv = el.querySelector("canvas"), ctx = cv.getContext("2d"), slider = el.querySelector("#m-slider"), found = el.querySelector(".m-found"),
      btn = el.querySelector("[data-remove]");
    var W, H, dpr = Math.min(window.devicePixelRatio || 1, 2), nodes = [], links = [], current = null, removed = null, t = 0;

    // neurons in the shape of a brain (two lobes); each concept owns a band, and nearby neurons are shared
    var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function layout() {
      W = el.querySelector(".m-brain").clientWidth; H = Math.min(360, Math.max(240, W * 0.5));
      cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px"; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length) return;
      seed = 7;
      while (nodes.length < 170) {
        var x = rnd(), y = rnd();
        var dx = (x - 0.5) / 0.48, dy = (y - 0.52) / 0.42, inside = dx * dx + dy * dy < 1 && !(Math.abs(x - 0.5) < 0.012 && y < 0.5);
        if (!inside) continue;
        var p = x * 100, own = [], near = [];
        FEATURES.forEach(function (f) { var d = Math.abs(p - f.at); if (d < f.spread + rnd() * 3) own.push(f.id); else if (d < f.spread + 9 && rnd() < 0.6) near.push(f.id); });
        nodes.push({ x: x, y: y, own: own, near: near, r: 1.8 + rnd() * 1.6, ph: rnd() * 6.28, dead: 0, hitOther: 0 });
      }
      nodes.forEach(function (a, i) {
        for (var j = i + 1; j < nodes.length; j++) { var b = nodes[j], d = Math.hypot(a.x - b.x, (a.y - b.y) * 0.6); if (d < 0.075) links.push([i, j]); }
      });
    }
    function featureAt(v) { var best = null; FEATURES.forEach(function (f) { if (Math.abs(v - f.at) <= 7) best = f; }); return best; }
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      var sx = (+slider.value / 100) * W;
      var g = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
      g.addColorStop(0, "rgba(56,189,248,0)"); g.addColorStop(0.5, removed ? "rgba(255,255,255,0.05)" : "rgba(56,189,248,0.16)"); g.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = g; ctx.fillRect(sx - 60, 0, 120, H);
      ctx.lineWidth = 1;
      links.forEach(function (l) {
        var a = nodes[l[0]], b = nodes[l[1]], dead = Math.max(a.dead, b.dead);
        ctx.strokeStyle = "rgba(160,170,220," + (0.12 * (1 - dead * 0.8)) + ")";
        ctx.beginPath(); ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); ctx.stroke();
      });
      nodes.forEach(function (n) {
        var lit = current && n.own.indexOf(current.id) >= 0 && !removed, glow = 0.55 + 0.45 * Math.sin(t * 3 + n.ph);
        var col = "rgba(200,205,255," + (0.35 + 0.25 * glow) + ")", r = n.r;
        if (lit) { col = current.color; r = n.r + 1.6; }
        if (n.dead) { col = "rgba(90,90,110,0.4)"; r = n.r * 0.7; }
        if (n.hitOther) { col = "rgba(251,146,60,0.95)"; r = n.r + 0.8; }
        ctx.fillStyle = col;
        if (lit || n.hitOther) { ctx.shadowColor = col; ctx.shadowBlur = 12; } else ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(n.x * W, n.y * H, r, 0, 6.283); ctx.fill();
      });
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }
    function onScan() {
      if (removed) return;
      current = featureAt(+slider.value);
      if (current) {
        var pct = 100 - Math.round(Math.abs(+slider.value - current.at) * 3);
        found.innerHTML = '<span class="m-dot" style="background:' + current.color + '"></span>' + c.esc(m.found) + " <b>" + c.esc(m.features[current.id]) + "</b> <small>" + pct + "% " + c.esc(m.match) + "</small>";
        found.classList.add("on");
      } else { found.textContent = m.none; found.classList.remove("on"); }
      btn.disabled = !current;
    }
    function remove() {
      if (!current || removed) return;
      removed = current; btn.disabled = true; slider.disabled = true;
      btn.querySelector("span").textContent = m.removing;
      nodes.forEach(function (n) {
        if (n.own.indexOf(removed.id) >= 0) n.dead = 1;
        else if (n.near.indexOf(removed.id) >= 0) n.hitOther = 1; // shared neurons: the side effect
      });
      later(showResult, 1200);
    }
    function putBack() {
      nodes.forEach(function (n) { n.dead = 0; n.hitOther = 0; });
      removed = null; slider.disabled = false;
      btn.querySelector("span").textContent = m.remove;
      el.querySelector(".m-go").style.display = "";
      el.querySelector("#m-after").innerHTML = "";
      onScan();
      el.querySelector(".m-brain").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
    function showResult() {
      var after = el.querySelector("#m-after");
      after.innerHTML =
        '<div class="m-report"><p><span class="m-dot" style="background:' + removed.color + '"></span><b>' + c.esc(m.features[removed.id]) + "</b> ✓</p>" +
        '<p class="m-hit">' + c.icon("alert") + c.esc(m.alsoHit) + " <b>" + c.esc(m.damage[removed.id]) + "</b></p></div>" +
        '<div class="demo" id="m-chat"></div>' +
        '<div class="m-go"><button class="explore" type="button" data-putback><span>' + c.esc(m.putBack) + "</span>" + c.icon("redo") + "</button></div>";
      window.Demo.render(after.querySelector("#m-chat"), { type: "chat", app: m.app, lines: m.effects[removed.id] }, c.demoWords);
      after.querySelector("[data-putback]").addEventListener("click", putBack);
      var out = el.querySelector(".m-brain-outcome");
      if (!out.innerHTML) {
        out.innerHTML = outcome(c, m.outcome);
        out.querySelector("[data-again]").addEventListener("click", function () { brain(el, c); window.scrollTo(0, 0); });
      }
      el.querySelector(".m-go").style.display = "none";
      after.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
    layout(); onScan(); draw();
    slider.addEventListener("input", onScan);
    btn.addEventListener("click", remove);
    window.addEventListener("resize", layout);
  }

  // ======================= Control 2: choose its access =======================
  // how much each switch adds to danger and usefulness while it is on (each column sums to 100)
  var SW = { bank: [20, 20], msg: [14, 20], pass: [20, 18], code: [14, 22], copy: [16, 6], auto: [16, 14] };
  function access(el, c) {
    var m = c.t.access, off = {};
    function levels() {
      var d = 0, u = 0;
      Object.keys(SW).forEach(function (id) { if (!off[id]) { d += SW[id][0]; u += SW[id][1]; } });
      return { d: d, u: u };
    }
    function screen() {
      stop();
      el.innerHTML = head(c, m) +
        '<div class="m-panel"><div class="m-switches">' + m.switches.map(function (s, i) {
          return '<button type="button" class="m-sw" data-id="' + s.id + '" aria-pressed="' + (off[s.id] ? "false" : "true") + '" style="--i:' + i + '">' +
            '<span class="m-sw-ic">' + c.icon(s.icon) + '</span><span class="m-sw-txt"><b>' + c.esc(s.label) + "</b></span>" +
            '<span class="m-knob" aria-hidden="true"><i></i></span></button>';
        }).join("") + "</div>" +
        '<div class="m-vbars"><div class="m-vbar danger"><b class="m-vnum"></b><div class="m-vtrack"><i></i></div><span>' + c.esc(m.danger) + "</span></div>" +
        '<div class="m-vbar useful"><b class="m-vnum"></b><div class="m-vtrack"><i></i></div><span>' + c.esc(m.useful) + "</span></div></div></div>" +
        '<p class="choose-label">' + c.esc(m.give) + '</p><div class="choices m-tasks">' + m.tasks3.map(function (t, i) {
          return '<button type="button" class="choice m-task-btn" data-task="' + t.id + '" style="--i:' + i + ";--cc:" + c.color(i + 3) + '">' + c.orb(i, t.icon) + '<span class="ch-title">' + c.esc(t.label) + "</span></button>";
        }).join("") + "</div>" +
        '<div id="m-after"></div>';
      function sync() {
        var v = levels(), bars = el.querySelectorAll(".m-vbar");
        [v.d, v.u].forEach(function (x, k) { bars[k].querySelector("i").style.height = x + "%"; bars[k].querySelector(".m-vnum").textContent = x + "%"; });
      }
      el.querySelectorAll(".m-sw").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = b.getAttribute("data-id");
          if (off[id]) delete off[id]; else off[id] = 1;
          b.setAttribute("aria-pressed", off[id] ? "false" : "true");
          sync();
        });
      });
      el.querySelectorAll("[data-task]").forEach(function (b) { b.addEventListener("click", function () { run(b.getAttribute("data-task")); }); });
      sync();
    }
    // test: the model does the simple task with every tool you left on, and each tool is one more
    // decision it makes that you never asked for
    function run(task) {
      var t = m.tasks3.filter(function (x) { return x.id === task; })[0], sc = m.scripts[task];
      var tools = Object.keys(sc).filter(function (id) { return !off[id]; }), self = !off.auto;
      var msgs = [["you", t.label], ["ai", m.start]];
      if (!tools.length) msgs.push(["ai", m.none]);
      tools.forEach(function (id) {
        var sw = m.switches.filter(function (x) { return x.id === id; })[0];
        if (self) msgs.push(["tool", sw, sc[id][1]]); else { msgs.push(["ask", sw, sc[id][0]]); msgs.push(["you", m.yes]); }
      });
      if (tools.length) msgs.push(["ai", m.done]);
      var n = tools.length, res = !n ? m.results.weak : !self ? m.results.kept.replace("{n}", n) : n === 1 ? m.results.one : m.results.lost.replace("{n}", n);
      el.querySelectorAll(".m-task-btn").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-task") === task); });
      stop();
      var after = el.querySelector("#m-after");
      after.innerHTML = '<div class="m-cw m-agent"><div class="m-cw-head"><span class="m-cw-ava">' + c.icon("chip") + "</span><div><b>" + c.esc(m.model) + "</b></div>" +
        '<div class="m-count"><b>0</b><span>' + c.esc(m.count) + '</span></div></div><div class="m-cw-body"></div></div><div class="m-run-end"></div>';
      after.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      var body = after.querySelector(".m-cw-body"), num = after.querySelector(".m-count"), at = 300, k = 0;
      msgs.forEach(function (x) {
        later(function () {
          var h;
          if (x[0] === "you") h = '<div class="m-cw-msg you">' + c.esc(x[1]) + "</div>";
          else if (x[0] === "ai") h = '<div class="m-cw-msg ai">' + c.esc(x[1]) + "</div>";
          else if (x[0] === "ask") h = '<div class="m-cw-msg ai"><span class="m-tool">' + c.icon(x[1].icon) + c.esc(x[1].label) + "</span>" + c.esc(x[2]) + "</div>";
          else {
            h = '<div class="m-cw-msg ai self"><span class="m-tool">' + c.icon(x[1].icon) + c.esc(x[1].label) + "</span>" + c.esc(x[2]) + "</div>";
            k++; num.querySelector("b").textContent = k; num.classList.remove("bump"); void num.offsetWidth; num.classList.add("bump", "on");
          }
          body.insertAdjacentHTML("beforeend", h); body.scrollTop = body.scrollHeight;
        }, at);
        at += x[0] === "you" ? 700 : x[0] === "ai" ? 900 : 1500;
      });
      later(function () {
        after.querySelector(".m-run-end").innerHTML = '<p class="m-stamp ' + (n && self ? "out" : n ? "in" : "mid") + '">' + c.esc(res) + "</p>";
        if (!el.querySelector(".m-access-outcome")) {
          el.insertAdjacentHTML("beforeend", '<div class="m-access-outcome">' + outcome(c, m.outcome) + "</div>");
          el.querySelector(".m-access-outcome [data-again]").addEventListener("click", function () { off = {}; screen(); window.scrollTo(0, 0); });
        }
      }, at + 200);
    }
    screen();
  }

  // ======================= Interpretability: pick a tool =======================
  function interpMenu(el, c) {
    var m = c.t.interp;
    el.innerHTML = head(c, m) + '<p class="choose-label rise" style="--i:1">' + c.esc(m.pick) + "</p>" +
      '<div class="choices">' + c.choice("#/m/brain", c.t.brain.title, c.t.brain.heading + ".", c.t.brain.icon, 0) +
      c.choice("#/m/steer", c.t.steer.title, c.t.steer.heading + ".", c.t.steer.icon, 1) + "</div>";
  }

  // ======================= Interpretability 2: steering vectors =======================
  var NET = [4, 6, 7, 6, 3];
  function steer(el, c) {
    var m = c.t.steer, lvl = {}, last = null, total = 0, typing = 0;
    function colorOf(id) { return c.color(m.vectors.map(function (v) { return v.id; }).indexOf(id)); }
    function net() {
      var W = 460, H = 280, x = NET.map(function (_, L) { return 30 + L * (W - 60) / (NET.length - 1); }), svg = "", pts = [];
      NET.forEach(function (n, L) { pts[L] = []; for (var j = 0; j < n; j++) pts[L].push([x[L], H / 2 + (j - (n - 1) / 2) * 36]); });
      for (var L = 0; L < NET.length - 1; L++) {
        svg += '<g class="ln" data-l="' + L + '">';
        pts[L].forEach(function (a) { pts[L + 1].forEach(function (b) { svg += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'; }); });
        svg += "</g>";
      }
      pts.forEach(function (layer, L) { layer.forEach(function (p, j) { svg += '<circle data-l="' + L + '" data-j="' + j + '" cx="' + p[0] + '" cy="' + p[1] + '" r="10"/>'; }); });
      return '<svg viewBox="0 0 ' + W + " " + H + '" aria-hidden="true">' + svg + "</svg>";
    }
    function landing() {
      stop();
      el.innerHTML = '<div class="m-head m-land rise" style="--i:0"><span class="m-kicker">' + c.esc(m.tagline) + "</span>" +
        '<h2 class="fix">' + c.esc(m.introHeading) + '</h2><p class="m-land-text">' + c.esc(m.introText) + "</p></div>" +
        '<div class="m-land-vecs rise" style="--i:1">' + m.vectors.map(function (v, i) {
          return '<span class="m-land-chip" style="--cc:' + c.color(i) + ";--k:" + i + '">' + c.icon(v.icon) + c.esc(v.label) + "</span>";
        }).join("") + "</div>" +
        '<div class="m-go rise" style="--i:2"><button class="explore" type="button" data-try><span>' + c.esc(m.tryIt) + "</span>" + c.icon("spark") + "</button></div>";
      el.querySelector("[data-try]").addEventListener("click", function () { play(); window.scrollTo(0, 0); });
    }
    function play() {
      stop(); lvl = {}; last = null; total = 0;
      el.innerHTML = head(c, m) +
        '<div class="choices m-vecs">' + m.vectors.map(function (v, i) {
          return '<button type="button" class="choice m-vec" data-v="' + v.id + '" style="--i:' + i + ";--cc:" + c.color(i) + '">' +
            c.orb(i, v.icon) + '<span class="ch-title">' + c.esc(v.label) + '</span><span class="m-dots"><i></i><i></i><i></i></span></button>';
        }).join("") + "</div>" +
        '<div class="m-steer"><div class="m-net"><span class="m-drop">' + c.esc(m.hint) + "</span>" + net() + "</div>" +
        '<div class="m-cw"><div class="m-cw-head"><span class="m-cw-ava">' + c.icon("chip") + '</span><div><b>' + c.esc(m.model) + '</b><small class="m-cw-status">' + c.esc(m.unsteered) + "</small></div></div>" +
        '<div class="m-cw-body"><div class="m-cw-msg you">' + c.esc(m.ask) + '</div><div class="m-cw-msg ai">' + c.esc(m.base) + "</div></div>" +
        '<div class="m-cw-input"><span>' + c.esc(m.ask) + "</span><i>" + c.icon("arrow") + "</i></div></div></div>" +
        '<div id="m-after"></div>';
      el.querySelectorAll(".m-vec").forEach(drag);
    }
    function scroll() { var body = el.querySelector(".m-cw-body"); body.scrollTop = body.scrollHeight; }
    function pill(id) {
      var v = m.vectors.filter(function (x) { return x.id === id; })[0];
      el.querySelector(".m-cw-body").insertAdjacentHTML("beforeend", '<div class="m-cw-msg you">' + c.esc(m.ask) + '</div><div class="m-cw-msg ai typing" style="--cc:' + colorOf(id) + '"><span class="dots"><i></i><i></i><i></i></span></div>');
      el.querySelector(".m-cw-status").textContent = m.steeredBy + " " + m.vectors.filter(function (x) { return lvl[x.id]; }).map(function (x) { return x.label + " ×" + lvl[x.id]; }).join(", ");
      scroll();
      return el.querySelectorAll(".m-cw-msg.typing");
    }
    function type(bubble, text) {
      var i = 0;
      bubble.classList.remove("typing"); bubble.textContent = "";
      (function step() {
        bubble.textContent = text.slice(0, i); scroll();
        if (i++ < text.length) later(step, 20);
      })();
    }
    function wave(color) {
      var box = el.querySelector(".m-net");
      box.style.setProperty("--wc", color);
      NET.forEach(function (_, L) {
        later(function () {
          box.querySelectorAll('circle[data-l="' + L + '"], g.ln[data-l="' + L + '"]').forEach(function (n) {
            n.classList.remove("hot"); void n.getBoundingClientRect(); n.classList.add("hot");
          });
        }, L * 140);
      });
      return NET.length * 140;
    }
    function tint() {
      el.querySelectorAll(".m-net circle").forEach(function (n) { n.removeAttribute("style"); });
      m.vectors.forEach(function (v, vi) {
        if (!lvl[v.id]) return;
        el.querySelectorAll(".m-net circle").forEach(function (n) {
          var L = +n.getAttribute("data-l"), j = +n.getAttribute("data-j");
          if (L > 0 && L < NET.length - 1 && (j * 3 + L + vi * 2) % 5 < lvl[v.id]) n.style.fill = c.color(vi);
        });
      });
    }
    function apply(id) {
      if ((lvl[id] || 0) >= 3) return;
      lvl[id] = (lvl[id] || 0) + 1; last = id; total++;
      el.querySelectorAll(".m-vec").forEach(function (b) {
        var n = lvl[b.getAttribute("data-v")] || 0;
        b.querySelectorAll(".m-dots i").forEach(function (d, i) { d.classList.toggle("on", i < n); });
      });
      var best = null;
      m.vectors.forEach(function (v) { if ((lvl[v.id] || 0) > 0 && (!best || lvl[v.id] > lvl[best] || (lvl[v.id] === lvl[best] && v.id === last))) best = v.id; });
      var t = wave(colorOf(id));
      later(tint, t / 2);
      var reply = m.replies[best][lvl[best] - 1], bubbles = pill(id), bubble = bubbles[bubbles.length - 1];
      later(function () { type(bubble, reply); }, t + 300);
      var after = el.querySelector("#m-after");
      if (total >= 2 && !after.innerHTML) later(function () {
        after.innerHTML = outcome(c, m.outcome);
        after.querySelector("[data-again]").addEventListener("click", function () { play(); window.scrollTo(0, 0); });
      }, t + 1200);
    }
    function drag(b) {
      var id = b.getAttribute("data-v"), ghost = null, sx = 0, sy = 0, moved = false, box = el.querySelector(".m-net");
      function over(e) { var r = box.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; }
      b.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; moved = false; b.setPointerCapture(e.pointerId); });
      b.addEventListener("pointermove", function (e) {
        if (!b.hasPointerCapture(e.pointerId)) return;
        if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 6) {
          moved = true;
          ghost = b.querySelector(".ch-orb").cloneNode(true); ghost.className += " m-ghost"; ghost.style.setProperty("--cc", colorOf(id));
          document.body.appendChild(ghost); box.classList.add("dragging");
        }
        if (ghost) { ghost.style.left = e.clientX + "px"; ghost.style.top = e.clientY + "px"; box.classList.toggle("over", over(e)); }
      });
      function end(e) {
        if (ghost) { ghost.remove(); ghost = null; box.classList.remove("dragging", "over"); }
        if (e.type === "pointerup" && (!moved || over(e))) apply(id);
      }
      b.addEventListener("pointerup", end); b.addEventListener("pointercancel", end);
      b.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); apply(id); } });
    }
    landing();
  }

  // ======================= Control: pick monitoring or access =======================
  function controlMenu(el, c) {
    var m = c.t.control;
    el.innerHTML = head(c, m) + '<p class="choose-label rise" style="--i:1">' + c.esc(m.pick) + "</p>" +
      '<div class="choices">' + c.choice("#/m/monitor", c.t.monitor.title, c.t.monitor.intro.split(". ")[0] + ".", c.t.monitor.icon, 0) +
      c.choice("#/m/access", c.t.access.title, c.t.access.heading + ".", c.t.access.icon, 1) + "</div>";
  }

  // ======================= Control 1: watch the logs =======================
  function monitor(el, c) {
    var m = c.t.monitor, marked = {}, done = false;
    var total = m.lines.filter(function (l) { return l.bad; }).length;
    el.innerHTML = head(c, m) +
      '<div class="d-app d-term m-log"><div class="win-bar dark"><span class="dots"><i></i><i></i><i></i></span><span class="win-title">' + c.esc(m.log) + "</span></div>" +
      '<ol class="m-lines">' + m.lines.map(function (l, i) {
        var mm = 2 + i * 5 + (i % 3), ts = "09:0" + Math.floor(mm / 60) + ":" + ("0" + (mm % 60)).slice(-2);
        return '<li><button type="button" data-i="' + i + '"><span class="ts">' + ts + '</span><span class="m-t">' + c.esc(l.t) + '</span><span class="m-flag">' + c.icon("alert") + "</span></button>" +
          (l.bad ? '<p class="m-explain">' + c.esc(l.bad) + "</p>" : "") + "</li>";
      }).join("") + '</ol><p class="m-wait">' + c.esc(m.waiting) + "</p></div>" +
      '<div class="m-go"><button class="explore" type="button" data-check disabled><span>' + c.esc(m.check) + "</span>" + c.icon("check") + "</button></div>" +
      '<div id="m-after"></div>';
    var items = el.querySelectorAll(".m-lines li"), btn = el.querySelector("[data-check]");
    items.forEach(function (li, i) {
      later(function () {
        li.classList.add("in");
        if (i === items.length - 1) { btn.disabled = false; el.querySelector(".m-wait").style.visibility = "hidden"; }
      }, 300 + i * 700);
      li.querySelector("button").addEventListener("click", function () {
        if (done) return;
        if (marked[i]) delete marked[i]; else marked[i] = 1;
        li.classList.toggle("marked", !!marked[i]);
      });
    });
    btn.addEventListener("click", function () {
      done = true; var hit = 0, fa = 0;
      items.forEach(function (li, i) {
        var bad = !!m.lines[i].bad;
        li.classList.add(bad ? (marked[i] ? "caught" : "missed") : (marked[i] ? "false" : "ok"));
        if (bad && marked[i]) hit++; if (!bad && marked[i]) fa++;
        var tag = bad ? (marked[i] ? m.caught : m.missed) : (marked[i] ? m.wrong : "");
        if (tag) li.querySelector("button").insertAdjacentHTML("beforeend", '<span class="m-tag">' + c.esc(tag) + "</span>");
      });
      el.querySelector(".m-go").style.display = "none";
      var after = el.querySelector("#m-after");
      after.innerHTML = '<div class="m-report"><p class="m-score">' + c.esc(m.score.replace("{f}", hit).replace("{t}", total)) + "</p>" +
        (fa ? '<p class="m-hit">' + c.icon("alert") + c.esc(m.falseAlarms.replace("{n}", fa)) + "</p>" : "") +
        '<p class="m-left">' + c.icon("pulse") + c.esc(m.scale) + "</p></div>" + outcome(c, m.outcome);
      after.querySelector("[data-again]").addEventListener("click", function () { monitor(el, c); window.scrollTo(0, 0); });
    });
  }

  function render(el, id, c) {
    stop();
    var f = { align: align, interp: interpMenu, brain: brain, steer: steer, control: controlMenu, access: access, monitor: monitor }[id];
    if (!f) return false;
    f(el, c);
    return true;
  }
  return { render: render, stop: stop };
})();
