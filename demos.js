// Small visual examples shown in each "But" card.
// Each node in content.js can have `demo: { type: "...", ... }`. Types:
//   weights  a wall of flickering numbers               { label }
//   chat     messages that appear one by one           { lines: [[who, text]] }  who: you | human | ai | think | monitor | note
//   bars     animated bars                             { title, bars: [{ label, value, from, tone, show }] }
//   cloud    concepts popping up while a counter runs  { words: [], count, countLabel }
//   counter  numbers that count up side by side        { items: [{ label, to, text, tone }] }
//   split    two panels side by side                   { left: { title, lines, tone }, right: {...} }
//   code     a file or terminal being edited           { file, lines: [[mark, text]] }  mark: + - $ > or " "
//   filter   attempts hitting a filter                 { title, items: [{ text, result }] }  result: blocked | passed | wrong
window.Demo = (function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timers = [], frames = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }
  function later(fn, ms) { var t = setTimeout(fn, reduce ? 0 : ms); timers.push(t); return t; }
  function every(fn, ms) { var t = setInterval(fn, ms); timers.push(t); return t; }
  function stop() {
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    frames.forEach(cancelAnimationFrame);
    timers = []; frames = [];
  }
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }
  function countUp(el, to, ms) {
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = performance.now();
    (function tick(now) {
      var k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(to * e);
      if (k < 1) frames.push(requestAnimationFrame(tick));
    })(t0);
  }
  // reveal children of `wrap` one by one
  function stagger(wrap, sel, gap, start) {
    wrap.querySelectorAll(sel).forEach(function (n, i) { later(function () { n.classList.add("in"); }, (start || 0) + i * gap); });
  }

  var R = {};

  R.weights = function (el, d) {
    el.innerHTML = '<div class="d-weights"><canvas></canvas><div class="d-overlay">' + esc(d.label || "Billions of numbers. No labels.") + "</div></div>";
    var cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = el.clientWidth || 600, H = 190;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
    ctx.scale(dpr, dpr);
    var cw = 58, ch = 17, cols = Math.ceil(W / cw) + 1, rows = Math.ceil(H / ch) + 2;
    var cells = [];
    function rnd() { var v = (Math.random() * 2 - 1) * Math.random() * 1.6; return (v < 0 ? "−" : " ") + Math.abs(v).toFixed(3); }
    for (var i = 0; i < cols * rows; i++) cells.push({ t: rnd(), h: 0 });
    var off = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var cell = cells[r * cols + c], y = r * ch - (off % ch) + 12;
        var a = 0.22 + cell.h * 0.75;
        ctx.fillStyle = cell.h > 0.05 ? "rgba(34,211,238," + a + ")" : "rgba(200,205,230,0.28)";
        ctx.fillText(cell.t, c * cw + 6, y);
        cell.h *= 0.9;
      }
    }
    draw();
    if (reduce) return;
    every(function () {
      off += 0.6;
      if (off % ch < 0.6) { cells.splice(0, cols); for (var i = 0; i < cols; i++) cells.push({ t: rnd(), h: 0 }); }
      for (var k = 0; k < 6; k++) { var cell = cells[(Math.random() * cells.length) | 0]; cell.t = rnd(); cell.h = 1; }
      draw();
    }, 50);
  };

  R.chat = function (el, d) {
    var who = { you: "You", human: "Hired human", ai: "AI", think: "AI's private thoughts", monitor: "Watcher AI", note: "" };
    el.innerHTML = '<div class="d-chat">' + d.lines.map(function (l) {
      return '<div class="msg ' + l[0] + '">' + (who[l[0]] ? '<span class="who">' + who[l[0]] + "</span>" : "") + "<p>" + esc(l[1]) + "</p></div>";
    }).join("") + "</div>";
    stagger(el, ".msg", 800, 100);
  };

  R.bars = function (el, d) {
    el.innerHTML = '<div class="d-bars">' + (d.title ? '<div class="d-title">' + esc(d.title) + "</div>" : "") + d.bars.map(function (b) {
      var from = b.from == null ? 0 : b.from;
      return '<div class="bar ' + (b.tone || "") + '"><div class="bar-top"><span>' + esc(b.label) + '</span><b>' + (b.show || b.value + "%") + '</b></div><div class="track"><i style="width:' + from + '%" data-w="' + b.value + '"></i></div></div>';
    }).join("") + "</div>";
    var bars = el.querySelectorAll(".track i");
    bars.forEach(function (i, k) { later(function () { i.style.width = i.getAttribute("data-w") + "%"; }, 500 + k * 250); });
    stagger(el, ".bar", 250, 100);
  };

  R.cloud = function (el, d) {
    el.innerHTML = '<div class="d-cloud"><div class="field"></div><div class="d-count"><b>0</b><span>' + esc(d.countLabel) + "</span></div></div>";
    var field = el.querySelector(".field"), n = 0;
    countUp(el.querySelector(".d-count b"), d.count, 3200);
    function spawn() {
      var w = document.createElement("span");
      w.textContent = d.words[n++ % d.words.length];
      w.style.left = 4 + Math.random() * 74 + "%";
      w.style.top = 6 + Math.random() * 78 + "%";
      field.appendChild(w);
      later(function () { w.classList.add("in"); }, 20);
      later(function () { w.classList.remove("in"); }, 2200);
      later(function () { w.remove(); }, 2800);
    }
    if (reduce) { for (var i = 0; i < 10; i++) { spawn(); } field.querySelectorAll("span").forEach(function (s) { s.classList.add("in"); }); return; }
    spawn(); every(spawn, 260);
  };

  R.counter = function (el, d) {
    el.innerHTML = '<div class="d-counter">' + d.items.map(function (it) {
      return '<div class="cnt ' + (it.tone || "") + '"><b data-to="' + (it.to || 0) + '">' + (it.text ? esc(it.text) : "0") + "</b><span>" + esc(it.label) + "</span></div>";
    }).join("") + "</div>";
    el.querySelectorAll("b[data-to]").forEach(function (b) { if (+b.getAttribute("data-to")) countUp(b, +b.getAttribute("data-to"), 2600); });
    stagger(el, ".cnt", 200, 50);
  };

  R.split = function (el, d) {
    function side(s) {
      return '<div class="side ' + (s.tone || "") + '"><div class="d-title">' + esc(s.title) + "</div>" + s.lines.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") + "</div>";
    }
    el.innerHTML = '<div class="d-split">' + side(d.left) + '<div class="vs">vs</div>' + side(d.right) + "</div>";
    stagger(el, ".side", 700, 100);
  };

  R.code = function (el, d) {
    el.innerHTML = '<div class="d-code"><div class="bar-dots"><i></i><i></i><i></i><span>' + esc(d.file || "terminal") + "</span></div><pre>" + d.lines.map(function (l) {
      var m = l[0], cls = m === "+" ? "add" : m === "-" ? "del" : m === "$" ? "cmd" : m === ">" ? "out" : "";
      return '<div class="ln ' + cls + '"><span class="m">' + esc(m === " " ? "" : m) + "</span>" + esc(l[1]) + "</div>";
    }).join("") + "</pre></div>";
    stagger(el, ".ln", 550, 150);
  };

  R.filter = function (el, d) {
    var label = { blocked: "Blocked", passed: "Got through", wrong: "Blocked (harmless!)" };
    el.innerHTML = '<div class="d-filter"><div class="d-title">' + esc(d.title || "Safety filter") + "</div>" + d.items.map(function (it) {
      return '<div class="try ' + it.result + '"><span class="t">' + esc(it.text) + '</span><span class="res">' + label[it.result] + "</span></div>";
    }).join("") + "</div>";
    var rows = el.querySelectorAll(".try");
    rows.forEach(function (r, i) {
      later(function () { r.classList.add("in"); }, 100 + i * 900);
      later(function () { r.classList.add("done"); }, 600 + i * 900);
    });
  };

  function render(el, demo) {
    if (!el || !demo || !R[demo.type]) return false;
    el.className = "demo demo-" + demo.type;
    R[demo.type](el, demo);
    return true;
  }
  return { render: render, stop: stop };
})();
