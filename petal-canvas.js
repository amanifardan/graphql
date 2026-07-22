(function () {
  const COLORS = ["#c9463c", "#a3202a", "#c9a86a"];

  function spawn(width, height, initial) {
    return {
      x: Math.random() * width,
      y: initial ? Math.random() * height : -20,
      size: 6 + Math.random() * 9,
      speedY: 0.4 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.6,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.03,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      hue: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.45 + Math.random() * 0.5,
    };
  }

  function drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.hue;
    ctx.beginPath();
    // A soft teardrop petal
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 0.6, -p.size * 0.5, p.size * 0.5, p.size * 0.5, 0, p.size);
    ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.5, -p.size * 0.6, -p.size * 0.5, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  function initPetals() {
    const canvas = document.getElementById("petal-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let raf = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const count = Math.min(70, Math.floor(width / 18));
    const petals = Array.from({ length: count }, () => spawn(width, height, true));

    function frame() {
      ctx.clearRect(0, 0, width, height);
      for (const p of petals) {
        p.sway += p.swaySpeed;
        p.y += p.speedY;
        p.x += p.drift + Math.sin(p.sway) * 0.7;
        p.rotation += p.rotSpeed;
        drawPetal(ctx, p);
        if (p.y > height + 20 || p.x < -30 || p.x > width + 30) {
          Object.assign(p, spawn(width, height, false));
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    if (reduced) {
      // Draw a single static field, no animation
      for (const p of petals) drawPetal(ctx, p);
    } else {
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", handleResize);
  }

  document.addEventListener("DOMContentLoaded", initPetals);
})();
