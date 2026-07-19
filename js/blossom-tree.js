const COLORS = {
  EMBER: "#c9463c",
  CRIMSON: "#a3202a",
  GOLD: "#c9a86a",
  NIGHT: "#0c0708",
};

class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

function createBlossomTree(svgElement, width = 1000, height = 800) {
  const rng = new SeededRandom(20240607);
  const branches = [];
  const blossoms = [];

  // Anchors for the tree structure
  const anchors = [
    // Top canopy
    { x: 60, y: 10, angle: Math.PI / 2 + 0.7, length: 120, maxDepth: 4 },
    { x: 250, y: -20, angle: Math.PI / 2 + 0.4, length: 110, maxDepth: 4 },
    { x: width - 250, y: -20, angle: Math.PI / 2 - 0.4, length: 110, maxDepth: 4 },
    { x: width - 60, y: 10, angle: Math.PI / 2 - 0.7, length: 120, maxDepth: 4 },
    // Arc over the center
    { x: width / 2 - 120, y: -30, angle: Math.PI / 2 + 0.9, length: 90, maxDepth: 3 },
    { x: width / 2 + 120, y: -30, angle: Math.PI / 2 - 0.9, length: 90, maxDepth: 3 },
    // Ground sprigs
    { x: 40, y: height - 80, angle: -Math.PI / 2 + 0.5, length: 100, maxDepth: 3 },
    { x: width - 40, y: height - 80, angle: -Math.PI / 2 - 0.5, length: 100, maxDepth: 3 },
  ];

  function growBranch(x, y, angle, length, strokeWidth, depth, maxDepth) {
    if (depth > maxDepth || length < 24) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    // Graceful bend
    const bend = (rng.next() - 0.5) * length * 0.9;
    const midX = x + Math.cos(angle) * length * 0.5 + Math.cos(angle + Math.PI / 2) * bend;
    const midY = y + Math.sin(angle) * length * 0.5 + Math.sin(angle + Math.PI / 2) * bend;

    branches.push({
      x1: x,
      y1: y,
      midX,
      midY,
      x2: endX,
      y2: endY,
      strokeWidth,
    });

    // Scatter blossoms
    const flowerCount = depth >= 2 ? Math.floor(rng.next() * 3) + 1 : 0;
    for (let i = 0; i < flowerCount; i++) {
      const t = 0.45 + rng.next() * 0.55;
      const fx = x + (endX - x) * t + (rng.next() - 0.5) * 14;
      const fy = y + (endY - y) * t + (rng.next() - 0.5) * 14;
      blossoms.push({
        x: fx,
        y: fy,
        scale: 0.55 + rng.next() * 0.7,
        rotation: rng.next() * 360,
        open: rng.next() > 0.22,
      });
    }

    // Child branches
    const childCount = depth < 2 ? 2 : rng.next() > 0.45 ? 2 : 1;
    for (let i = 0; i < childCount; i++) {
      const spread = (rng.next() - 0.5) * 1.0 + (i === 0 ? -0.4 : 0.4);
      growBranch(
        endX,
        endY,
        angle + spread,
        length * (0.6 + rng.next() * 0.2),
        Math.max(1, strokeWidth * 0.6),
        depth + 1,
        maxDepth
      );
    }
  }

  anchors.forEach((a) => {
    growBranch(
      a.x,
      a.y,
      a.angle,
      a.length + rng.next() * 40,
      8,
      0,
      a.maxDepth
    );
  });

  // Extra blossoms for density
  for (let i = 0; i < 20; i++) {
    blossoms.push({
      x: rng.next() * width,
      y: rng.next() * (height * 0.25),
      scale: 0.4 + rng.next() * 0.55,
      rotation: rng.next() * 360,
      open: rng.next() > 0.3,
    });
  }

  // Create SVG
  svgElement.innerHTML = "";
  svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svgElement.setAttribute("preserveAspectRatio", "xMidYMid slice");

  // Shadow branches
  const shadowGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  shadowGroup.setAttribute("stroke", "#1a0f0e");
  shadowGroup.setAttribute("fill", "none");
  shadowGroup.setAttribute("stroke-linecap", "round");

  branches.forEach((b) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${b.x1} ${b.y1} Q ${b.midX} ${b.midY} ${b.x2} ${b.y2}`
    );
    path.setAttribute("stroke-width", b.strokeWidth + 2);
    path.setAttribute("opacity", "0.9");
    shadowGroup.appendChild(path);
  });
  svgElement.appendChild(shadowGroup);

  // Main branches
  const branchGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  branchGroup.setAttribute("stroke", "#3a201c");
  branchGroup.setAttribute("fill", "none");
  branchGroup.setAttribute("stroke-linecap", "round");

  branches.forEach((b) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${b.x1} ${b.y1} Q ${b.midX} ${b.midY} ${b.x2} ${b.y2}`
    );
    path.setAttribute("stroke-width", b.strokeWidth);
    branchGroup.appendChild(path);
  });
  svgElement.appendChild(branchGroup);

  // Highlight branches
  const hlGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  hlGroup.setAttribute("stroke", COLORS.GOLD);
  hlGroup.setAttribute("fill", "none");
  hlGroup.setAttribute("stroke-linecap", "round");
  hlGroup.setAttribute("opacity", "0.28");

  branches.forEach((b) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      `M ${b.x1} ${b.y1} Q ${b.midX} ${b.midY} ${b.x2} ${b.y2}`
    );
    path.setAttribute("stroke-width", Math.max(0.5, b.strokeWidth * 0.25));
    hlGroup.appendChild(path);
  });
  svgElement.appendChild(hlGroup);

  // Blossoms
  const flowerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  blossoms.forEach((blossom) => {
    addFlower(flowerGroup, blossom);
  });
  svgElement.appendChild(flowerGroup);
}

function addFlower(group, { x, y, scale, rotation, open }) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute(
    "transform",
    `translate(${Math.round(x * 1000) / 1000} ${Math.round(y * 1000) / 1000}) rotate(${Math.round(rotation * 1000) / 1000}) scale(${Math.round(scale * 1000) / 1000})`
  );

  if (open) {
    // Open flower petals
    const petals = [0, 72, 144, 216, 288];
    petals.forEach((angle) => {
      const petal = document.createElementNS("http://www.w3.org/2000/svg", "g");
      petal.setAttribute("transform", `rotate(${angle})`);

      const outer = document.createElementNS("http://www.w3.org/2000/svg", "path");
      outer.setAttribute("d", "M0 0 C -7 -9 -6 -22 0 -27 C 6 -22 7 -9 0 0 Z");
      outer.setAttribute("fill", COLORS.EMBER);

      const inner = document.createElementNS("http://www.w3.org/2000/svg", "path");
      inner.setAttribute("d", "M0 -4 C -3 -10 -3 -19 0 -24 C 3 -19 3 -10 0 -4 Z");
      inner.setAttribute("fill", COLORS.CRIMSON);
      inner.setAttribute("opacity", "0.75");

      petal.appendChild(outer);
      petal.appendChild(inner);
      g.appendChild(petal);
    });

    // Center
    const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    center.setAttribute("r", "4");
    center.setAttribute("fill", COLORS.NIGHT);
    g.appendChild(center);

    // Gold stamens
    petals.forEach((angle) => {
      const stamen = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      stamen.setAttribute(
        "cx",
        Math.round(Math.sin((angle * Math.PI) / 180) * 6 * 1000) / 1000
      );
      stamen.setAttribute(
        "cy",
        Math.round(-Math.cos((angle * Math.PI) / 180) * 6 * 1000) / 1000
      );
      stamen.setAttribute("r", "1.1");
      stamen.setAttribute("fill", COLORS.GOLD);
      g.appendChild(stamen);
    });
  } else {
    // Closed bud
    const outer = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outer.setAttribute("r", "4.5");
    outer.setAttribute("fill", COLORS.CRIMSON);

    const inner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    inner.setAttribute("r", "2.6");
    inner.setAttribute("cy", "-1");
    inner.setAttribute("fill", COLORS.EMBER);
    inner.setAttribute("opacity", "0.6");

    g.appendChild(outer);
    g.appendChild(inner);
  }

  group.appendChild(g);
}

// Auto-initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const treeSvgs = document.querySelectorAll(".blossom-tree-svg");
  treeSvgs.forEach((svg) => {
    const width = svg.getAttribute("data-width") || 1000;
    const height = svg.getAttribute("data-height") || 800;
    createBlossomTree(svg, parseInt(width), parseInt(height));
  });
});
