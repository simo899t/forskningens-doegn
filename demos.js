// Realistic examples shown under "But". Each option in content.js has `demo: { type, ... }`.
// Every type can also take `note`: a short footnote shown under the example (what really happened).
// Types:
//   chat     a chat app                 { app, lines: [[who, text]] }  who: you | human | ai | think | monitor | sys | note
//   email    an email                   { from, to, subject, body: [paragraphs] }
//   code     a terminal or code review  { file, lines: [[mark, text]] }  mark: + - $ > or " "
//   log      a monitoring log           { title, items: [{ text, result }] }  result: blocked | passed | wrong
//   filter   alias of log
//   stats    a monitoring dashboard     { title, items: [{ label, to, text, tone }] }
//   counter  alias of stats
//   bars     dashboard with bars        { title, bars: [{ label, value, from, tone, show }] }
//   split    two screenshots side by side { left: { title, lines, tone }, right: {...} }
//   weights  raw numbers in a terminal  { label }
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
  function stagger(wrap, sel, gap, start) {
    var items = wrap.querySelectorAll(sel);
    items.forEach(function (n, i) { later(function () { n.classList.add("in"); }, (start || 0) + i * gap); });
    return (start || 0) + items.length * gap;
  }
  function chrome(title, cls) {
    return '<div class="win-bar ' + (cls || "") + '"><span class="dots"><i></i><i></i><i></i></span><span class="win-title">' + esc(title) + "</span></div>";
  }
  function note(d) { return d.note ? '<p class="d-note">' + esc(d.note) + "</p>" : ""; }
  function showNote(el, at) { var n = el.querySelector(".d-note"); if (n) later(function () { n.classList.add("in"); }, at); }
  function clock(i) { var m = 41 + i; return "14:" + (m < 10 ? "0" : "") + m; }

  var R = {};

  // ---------- chat app ----------
  R.chat = function (el, d) {
    var label = { you: "You", human: "Hired worker", ai: d.ai || "AI assistant", think: "Private reasoning (not shown to the user)", monitor: d.monitor || "Grader AI" };
    var notes = [], lines = [];
    d.lines.forEach(function (l) { if (l[0] === "note") notes.push(l[1]); else lines.push(l); });
    var body = lines.map(function (l, i) {
      var who = l[0];
      if (who === "sys") return '<div class="msg sys"><span>' + esc(l[1]) + "</span></div>";
      var mine = who === "you" || who === "human";
      return '<div class="msg ' + who + (mine ? " mine" : "") + '">' +
        (mine ? "" : '<span class="av">' + (who === "think" ? "…" : who === "monitor" ? "G" : "AI") + "</span>") +
        '<div class="bubble">' + (who === "think" || who === "monitor" || who === "human" ? '<span class="who">' + label[who] + "</span>" : "") +
        "<p>" + esc(l[1]) + '</p><span class="time">' + clock(i) + "</span></div></div>";
    }).join("");
    el.innerHTML = '<div class="d-app d-chat">' +
      '<div class="chat-head"><span class="av big">AI</span><div><b>' + esc(d.app || "AI assistant") + '</b><span class="status">online</span></div></div>' +
      '<div class="chat-body">' + body + '<div class="typing"><i></i><i></i><i></i></div></div>' +
      '<div class="chat-input"><span>Message…</span><i></i></div></div>' +
      (notes.length ? '<p class="d-note">' + notes.map(esc).join(" ") + "</p>" : "");
    var msgs = el.querySelectorAll(".msg"), typing = el.querySelector(".typing"), t = 150;
    msgs.forEach(function (m) {
      var bot = !m.classList.contains("mine") && !m.classList.contains("sys");
      if (bot && !reduce) {
        later(function () { m.parentNode.insertBefore(typing, m); typing.classList.add("on"); }, t);
        t += 650;
        later(function () { typing.classList.remove("on"); }, t - 20);
      }
      later(function () { m.classList.add("in"); }, t);
      t += 650;
    });
    showNote(el, t + 200);
  };

  // ---------- email ----------
  R.email = function (el, d) {
    el.innerHTML = '<div class="d-app d-email">' + chrome("Mail") +
      '<div class="mail-head"><p><span>From</span><b>' + esc(d.from) + '</b></p><p><span>To</span>' + esc(d.to) + '</p><p class="subj">' + esc(d.subject) + "</p></div>" +
      '<div class="mail-body">' + d.body.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></div>" + note(d);
    var end = stagger(el, ".mail-body p", 700, 300);
    showNote(el, end + 300);
  };

  // ---------- terminal / code review ----------
  R.code = function (el, d) {
    el.innerHTML = '<div class="d-app d-term">' + chrome(d.file || "terminal", "dark") + "<pre>" + d.lines.map(function (l) {
      var m = l[0], cls = m === "+" ? "add" : m === "-" ? "del" : m === "$" ? "cmd" : m === ">" ? "out" : "";
      return '<div class="ln ' + cls + '"><span class="m">' + esc(m === " " ? "" : m) + "</span>" + esc(l[1]) + "</div>";
    }).join("") + "</pre></div>" + note(d);
    var end = stagger(el, ".ln", 520, 150);
    showNote(el, end + 200);
  };

  // ---------- monitoring log ----------
  R.log = function (el, d) {
    var label = { blocked: "BLOCKED", passed: "ALLOWED", wrong: "BLOCKED" };
    el.innerHTML = '<div class="d-app d-term d-log">' + chrome(d.title || "safety-filter.log", "dark") + "<pre>" + d.items.map(function (it, i) {
      return '<div class="ln ' + it.result + '"><span class="ts">14:0' + (2 + i) + ":1" + i + '</span><span class="lvl">' + label[it.result] + '</span><span class="msg-t">' + esc(it.text) + "</span></div>";
    }).join("") + "</pre></div>" + note(d);
    var end = stagger(el, ".ln", 800, 150);
    showNote(el, end + 200);
  };
  R.filter = R.log;

  // ---------- dashboard ----------
  R.stats = function (el, d) {
    el.innerHTML = '<div class="d-app d-dash">' + chrome(d.title || "Monitoring") + '<div class="panels">' + d.items.map(function (it) {
      return '<div class="panel ' + (it.tone || "") + '"><span class="p-label">' + esc(it.label) + '</span><b data-to="' + (it.to || 0) + '">' + (it.text ? esc(it.text) : "0") + "</b></div>";
    }).join("") + "</div></div>" + note(d);
    el.querySelectorAll("b[data-to]").forEach(function (b) { if (+b.getAttribute("data-to")) countUp(b, +b.getAttribute("data-to"), 2400); });
    stagger(el, ".panel", 150, 50);
    showNote(el, 2600);
  };
  R.counter = R.stats;

  R.bars = function (el, d) {
    el.innerHTML = '<div class="d-app d-dash">' + chrome(d.title || "Training dashboard") + '<div class="bars">' + d.bars.map(function (b) {
      var from = b.from == null ? 0 : b.from;
      return '<div class="bar ' + (b.tone || "") + '"><div class="bar-top"><span>' + esc(b.label) + "</span><b>" + (b.show || b.value + "%") + '</b></div><div class="track"><i style="width:' + from + '%" data-w="' + b.value + '"></i></div></div>';
    }).join("") + "</div></div>" + note(d);
    el.querySelectorAll(".track i").forEach(function (i, k) { later(function () { i.style.width = i.getAttribute("data-w") + "%"; }, 500 + k * 300); });
    var end = stagger(el, ".bar", 300, 100);
    showNote(el, end + 1200);
  };

  // ---------- two screenshots ----------
  R.split = function (el, d) {
    function side(s) {
      return '<div class="d-app shot ' + (s.tone || "") + '">' + chrome(s.title) + '<div class="shot-body">' + s.lines.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") + "</div></div>";
    }
    el.innerHTML = '<div class="d-split">' + side(d.left) + side(d.right) + "</div>" + note(d);
    var end = stagger(el, ".shot", 800, 100);
    showNote(el, end + 200);
  };

  // ---------- raw weights ----------
  R.weights = function (el, d) {
    el.innerHTML = '<div class="d-app d-term">' + chrome("python", "dark") +
      '<pre class="w-cmd"><div class="ln cmd"><span class="m">$</span>print(model.layers[12].weight)</div></pre>' +
      '<div class="d-weights"><canvas></canvas></div>' +
      '<pre class="w-cmd"><div class="ln out"><span class="m"></span>' + esc(d.label || "tensor of 1,000,000,000+ numbers. No labels. No rules.") + "</div></pre></div>" + note(d);
    var cv = el.querySelector("canvas"), ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = el.clientWidth || 600, H = 170;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
    ctx.scale(dpr, dpr);
    var cw = 64, ch = 17, cols = Math.ceil(W / cw) + 1, rows = Math.ceil(H / ch) + 2, cells = [];
    function rnd() { var v = (Math.random() * 2 - 1) * Math.random() * 1.6; return (v < 0 ? "-" : " ") + Math.abs(v).toFixed(4); }
    for (var i = 0; i < cols * rows; i++) cells.push({ t: rnd(), h: 0 });
    var off = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var cell = cells[r * cols + c];
        ctx.fillStyle = cell.h > 0.05 ? "rgba(255,255,255," + (0.35 + cell.h * 0.6) + ")" : "rgba(190,200,190,0.45)";
        ctx.fillText(cell.t, c * cw + 14, r * ch - (off % ch) + 12);
        cell.h *= 0.88;
      }
    }
    draw();
    showNote(el, 600);
    if (reduce) return;
    every(function () {
      off += 0.7;
      if (off % ch < 0.7) { cells.splice(0, cols); for (var i = 0; i < cols; i++) cells.push({ t: rnd(), h: 0 }); }
      for (var k = 0; k < 5; k++) { var cell = cells[(Math.random() * cells.length) | 0]; cell.t = rnd(); cell.h = 1; }
      draw();
    }, 50);
  };

  function render(el, demo) {
    if (!el || !demo || !R[demo.type]) return false;
    el.className = "demo demo-" + demo.type;
    R[demo.type](el, demo);
    return true;
  }
  return { render: render, stop: stop };
})();
