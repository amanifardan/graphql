function svg(tag, attrs = {}) {
  const SVGel = document.createElementNS("http://www.w3.org/2000/svg", tag);
  //  loops through each attribute and sets it
  Object.entries(attrs).forEach(([key, val]) => {
    SVGel.setAttribute(key, val);
  });
  return SVGel;
}

function formatXpLabel(amount) {
  const numericAmount = Number(amount || 0);
  if (!Number.isFinite(numericAmount)) return "0 B";
  if (numericAmount < 1000) return numericAmount.toLocaleString() + " B";

  const kbAmount = numericAmount / 1000;
  const formattedKb = kbAmount >= 100
    ? Math.round(kbAmount).toLocaleString()
    : kbAmount.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
  return formattedKb + " KB";
}

function formatProjectLabel(name) {
  return name;
}

function formatProjectLabelByPrefix(name, allProjectNames) {
  if (typeof name !== "string" || !name) return name;

  const matchingPrefixes = allProjectNames
    .filter(prefix => prefix !== name && name.startsWith(prefix + "-"))
    .sort((a, b) => b.length - a.length);

  if (matchingPrefixes.length === 0) {
    return formatProjectLabel(name);
  }

  const longestPrefix = matchingPrefixes[0];
  return name.slice(longestPrefix.length + 1);
}

function getXpProjectsForChart(transactions) {
  const isPhone = window.matchMedia("(max-width: 767px)").matches;
  const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)").matches;
  const maxBars = isPhone ? 3 : (isTablet ? 4 : 6);

  const projectNames = {};
  const projectTypes = {};
  transactions.forEach(transaction => {
    if (transaction.object && transaction.object.name) {
      projectNames[transaction.objectId] = transaction.object.name;
      projectTypes[transaction.objectId] = transaction.object.type;
    }
  });

  const projectStats = {};
  const allProjectNamesMap = {};
  transactions.forEach(transaction => {
    const id = transaction.objectId;
    const txAmount = Number(transaction.amount || 0);
    const txTime = Date.parse(transaction.createdAt || "") || 0;

    if (transaction.object && transaction.object.name) {
      allProjectNamesMap[id] = transaction.object.name;
    }

    if (!projectStats[id]) {
      projectStats[id] = {
        amount: 0,
        latestCreatedAt: 0,
      };
    }

    projectStats[id].amount += txAmount;
    projectStats[id].latestCreatedAt = Math.max(projectStats[id].latestCreatedAt, txTime);
  });

  const projectsXps = Object.entries(projectStats)
    .map(([id, stats]) => ({
      id,
      amount: stats.amount,
      latestCreatedAt: stats.latestCreatedAt,
      name: projectNames[id] || `Obj ${id}`,
      type: String(projectTypes[id] || "").toLowerCase(),
    }))
    .filter(project => project.type === "project" || project.type === "piscine")
    .sort((a, b) => b.latestCreatedAt - a.latestCreatedAt)
    .slice(0, maxBars);

  const allProjectNames = Object.values(allProjectNamesMap).map(name => String(name || ""));

  return { projectsXps, allProjectNames, isPhone };
}

function XpBar(transactions) {
  const svgEl = document.getElementById("xp-by-project-graph");
  svgEl.innerHTML = "";
  const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)").matches;
  const isLaptopUp = window.matchMedia("(min-width: 1024px)").matches;
  const { projectsXps, allProjectNames, isPhone } = getXpProjectsForChart(transactions);

  if (projectsXps.length === 0) {
    svgEl.appendChild(svg("text", { x: "20", y: "32", fill: "#d8c9bf" })).textContent = "No XP data";
    return;
  }

  const width = isPhone ? 620 : 900;
  const left = isPhone ? 30 : 34;
  const right = isPhone ? 30 : 34;
  const top = isPhone ? 20 : 30;
  const baseY = isPhone ? 390 : 340;
  const chartHeight = baseY - top;
  const chartWidth = width - left - right;
  const maxAmount = Math.max(...projectsXps.map(i => i.amount));

  svgEl.setAttribute("viewBox", `0 0 ${width} ${isPhone ? 470 : 400}`);

  const depth = 12;
  const slot = chartWidth / projectsXps.length;
  const barWidth = Math.min(52, slot * 0.48);

  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i += 1) {
    const y = top + (chartHeight * i) / gridSteps;
    svgEl.appendChild(svg("line", {
      x1: String(left),
      y1: String(y),
      x2: String(width - right),
      y2: String(y),
      stroke: "rgba(216, 201, 191, 0.18)",
      "stroke-width": "1",
      "stroke-dasharray": "4 6",
    }));
  }

  svgEl.appendChild(svg("line", {
    x1: String(left),
    y1: String(top),
    x2: String(left),
    y2: String(baseY),
    stroke: "rgba(216, 201, 191, 0.45)",
    "stroke-width": "1.5",
  }));

  svgEl.appendChild(svg("line", {
    x1: String(left),
    y1: String(baseY),
    x2: String(width - right + depth),
    y2: String(baseY),
    stroke: "rgba(216, 201, 191, 0.45)",
    "stroke-width": "1.5",
  }));

  projectsXps.forEach((pXps, i) => {
    const height = (pXps.amount / maxAmount) * (chartHeight - 12);
    const x = left + i * slot + (slot - barWidth) / 2;
    const y = baseY - height;

    const barGroup = svg("g", { class: "bar" });

    barGroup.appendChild(svg("polygon", {
      points: [
        `${x + barWidth},${y}`,
        `${x + barWidth + depth},${y - depth}`,
        `${x + barWidth + depth},${baseY - depth}`,
        `${x + barWidth},${baseY}`,
      ].join(" "),
      fill: "#8f2a22",
    }));

    barGroup.appendChild(svg("polygon", {
      points: [
        `${x},${y}`,
        `${x + depth},${y - depth}`,
        `${x + barWidth + depth},${y - depth}`,
        `${x + barWidth},${y}`,
      ].join(" "),
      fill: "#db6157",
    }));

    barGroup.appendChild(svg("rect", {
      x: String(x),
      y: String(y),
      width: String(barWidth),
      height: String(height),
      fill: "#c9463c",
    }));

    const label = svg("text", {
      x: String(x + barWidth / 2 + depth / 2),
      y: String(baseY + (isPhone ? 24 : 20)),
      "text-anchor": "middle",
      fill: "#d8c9bf",
      "font-size": isPhone ? "19" : (isTablet ? "10" : (isLaptopUp ? "11" : "13")),
    });
    label.textContent = formatProjectLabelByPrefix(pXps.name, allProjectNames);
    barGroup.appendChild(label);

    const xpValue = svg("text", {
      x: String(x + barWidth / 2 + depth / 2),
      y: String(y - (isPhone ? 20 : 18)),
      "text-anchor": "middle",
      fill: "#ecd9b0",
      "font-size": isPhone ? "16" : (isTablet ? "9" : (isLaptopUp ? "10" : "11")),
      "font-weight": "600",
      class: "bar-xp-value",
    });
    xpValue.textContent = formatXpLabel(pXps.amount);
    barGroup.appendChild(xpValue);

    svgEl.appendChild(barGroup);
  });
}

window.getXpProjectsForChart = getXpProjectsForChart;

function passDonut(solvedCount, toSolveCount, scorePercentage = 0) {
  const svgEl = document.getElementById("pass-fail-ratio-graph");
  svgEl.innerHTML = "";

  const total = solvedCount + toSolveCount;
  if (total <= 0) {
    svgEl.appendChild(svg("text", { x: "20", y: "32", fill: "#d8c9bf" })).textContent = "No grade data";
    return;
  }

  const cx = 210;
  const cy = 124;
  const rx = 124;
  const ry = 72;
  const depth = 28;
  const pop = 14;
  const TAU = Math.PI * 2;

  const slices = [
    { key: "solved", label: "Solved", count: solvedCount, top: "#c9463c", side: "#9e3229" },
    { key: "toSolve", label: "To Solve", count: toSolveCount, top: "#a3202a", side: "#74131b" },
  ];

  let start = -Math.PI / 2;
  const built = slices.map(slice => {
    const sweep = (slice.count / total) * TAU;
    const segment = { ...slice, a0: start, a1: start + sweep };
    start += sweep;
    return segment;
  });

  const frontAngle = Math.PI / 2;
  const containsFront = segment => {
    let angle = frontAngle;
    while (angle < segment.a0) angle += TAU;
    return angle <= segment.a1;
  };

  built.sort((a, b) => (containsFront(a) ? 1 : 0) - (containsFront(b) ? 1 : 0));

  built.forEach(segment => {
    if (segment.count <= 0) return;

    const mid = (segment.a0 + segment.a1) / 2;
    const tx = (Math.cos(mid) * pop).toFixed(1);
    const ty = (Math.sin(mid) * (ry / rx) * pop).toFixed(1);

    const group = svg("g", { class: "slice" });
    group.style.setProperty("--tx", `${tx}px`);
    group.style.setProperty("--ty", `${ty}px`);

    group.appendChild(svg("path", {
      d: ellipseSectorPath(cx, cy + depth, rx, ry, segment.a0, segment.a1),
      fill: segment.side,
    }));

    group.appendChild(svg("path", {
      d: ellipseSectorPath(cx, cy, rx, ry, segment.a0, segment.a1),
      fill: segment.top,
      stroke: "rgba(12, 7, 8, 0.45)",
      "stroke-width": "1",
    }));

    svgEl.appendChild(group);
  });

  svgEl.appendChild(svg("rect", {
    x: "95",
    y: "285",
    width: "10",
    height: "10",
    rx: "1.5",
    fill: "#c9463c",
  }));

  const passLabel = svg("text", {
    x: "112",
    y: "294",
    fill: "#d8c9bf",
    "font-size": "12",
  });
  passLabel.textContent = `Solved: ${solvedCount}`;
  svgEl.appendChild(passLabel);

  svgEl.appendChild(svg("rect", {
    x: "176",
    y: "285",
    width: "10",
    height: "10",
    rx: "1.5",
    fill: "#a3202a",
  }));

  const failLabel = svg("text", {
    x: "193",
    y: "294",
    fill: "#d8c9bf",
    "font-size": "12",
  });
  failLabel.textContent = `To solve: ${toSolveCount}`;
  svgEl.appendChild(failLabel);

  const pctLabel = svg("text", {
    x: "312",
    y: "294",
    fill: "#ecd9b0",
    "font-size": "12",
    "font-weight": "600",
  });
  pctLabel.textContent = `${Math.round(scorePercentage)}% score`;
  svgEl.appendChild(pctLabel);
}

function ellipseSectorPath(cx, cy, rx, ry, startAngle, endAngle) {
  const startX = cx + rx * Math.cos(startAngle);
  const startY = cy + ry * Math.sin(startAngle);
  const endX = cx + rx * Math.cos(endAngle);
  const endY = cy + ry * Math.sin(endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${cx} ${cy}`,
    `L ${startX} ${startY}`,
    `A ${rx} ${ry} 0 ${largeArc} 1 ${endX} ${endY}`,
    "Z",
  ].join(" ");
}

// Export chart functions so app.js can call them
window.xpBar = XpBar;
window.passDonut = passDonut;