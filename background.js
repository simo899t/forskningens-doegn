// Animated "neural network" background: drifting nodes joined by faint lines.
// window.bgPulse(kind) flashes the network: "danger" (red) or "good" (green).
(function () {
  "use strict";
  var canvas = document.getElementById("bg");
  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, nodes = [], mouse = { x: -9999, y: -9999 };
  var pulse = { t: 0, rgb: [255, 92, 92] };
  var calm = false; // dims the network on reading screens

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.round(Math.min(90, Math.max(34, (W * H) / 16000)));
    nodes = [];
    for (var i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.8, hue: Math.random(),
      });
    }
    if (reduce) draw();
  }

  function mix(a, b, t) { return Math.round(a + (b - a) * t); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var p = pulse.t;
    var base = calm ? 0.7 : 1;
    var link = Math.min(170, Math.max(110, W / 9));
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      if (!reduce) {
        // gentle pull towards the pointer
        var dxm = mouse.x - a.x, dym = mouse.y - a.y, dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < 180 && dm > 1) { a.vx += (dxm / dm) * 0.006; a.vy += (dym / dm) * 0.006; }
        a.vx *= 0.995; a.vy *= 0.995;
        var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (sp < 0.08) { a.vx += (Math.random() - 0.5) * 0.04; a.vy += (Math.random() - 0.5) * 0.04; }
        a.x += a.vx * (1 + p * 4); a.y += a.vy * (1 + p * 4);
        if (a.x < -20) a.x = W + 20; if (a.x > W + 20) a.x = -20;
        if (a.y < -20) a.y = H + 20; if (a.y > H + 20) a.y = -20;
      }
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < link) {
          var o = (1 - d / link) * 0.32 * base;
          var r = mix(mix(139, 34, a.hue), pulse.rgb[0], p);
          var g = mix(mix(92, 211, a.hue), pulse.rgb[1], p);
          var bl = mix(mix(246, 238, a.hue), pulse.rgb[2], p);
          ctx.strokeStyle = "rgba(" + r + "," + g + "," + bl + "," + (o + p * 0.25 * (1 - d / link)) + ")";
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      var cr = mix(mix(167, 103, n.hue), pulse.rgb[0], p);
      var cg = mix(mix(139, 232, n.hue), pulse.rgb[1], p);
      var cb = mix(mix(250, 249, n.hue), pulse.rgb[2], p);
      ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + "," + (0.75 * base + p * 0.25) + ")";
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + p * 1.2, 0, Math.PI * 2); ctx.fill();
    }
    if (pulse.t > 0) pulse.t = Math.max(0, pulse.t - 0.012);
  }

  function loop() { draw(); requestAnimationFrame(loop); }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });

  window.bgPulse = function (kind) {
    pulse.rgb = kind === "good" ? [52, 211, 153] : [255, 92, 92];
    pulse.t = 1;
    if (reduce) { draw(); pulse.t = 0; setTimeout(draw, 600); }
  };
  window.bgCalm = function (on) { calm = !!on; if (reduce) draw(); };

  resize();
  if (!reduce) loop();
})();
