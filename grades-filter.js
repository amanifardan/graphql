function getGradeEventKey(result) {
  if (result?.eventId !== null && result?.eventId !== undefined) {
    return `event:${result.eventId}`;
  }
  return `path:${result?.path || "unknown"}`;
}

function buildGradeEventOptions(results) {
  const byKey = new Map();

  results.forEach(result => {
    const key = getGradeEventKey(result);
    const current = byKey.get(key);
    const ts = Date.parse(result?.createdAt || "") || 0;

    if (!current || ts > current.latestTs) {
      const path = String(result?.path || "");
      const prettyPath = path ? path.replace(/^\/+/, "") : "unknown";
      const label = result?.eventId !== null && result?.eventId !== undefined
        ? `#${result.eventId} /${prettyPath}`
        : `/${prettyPath}`;
      byKey.set(key, { key, label, latestTs: ts });
    }
  });

  return Array.from(byKey.values()).sort((a, b) => b.latestTs - a.latestTs);
}

function renderGradeEventSelect(options) {
  if (!el.progressEventSelect) return;

  el.progressEventSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All events";
  el.progressEventSelect.appendChild(allOption);

  options.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option.key;
    opt.textContent = option.label;
    el.progressEventSelect.appendChild(opt);
  });

  const valid = state.selectedGradeEventKey === "all"
    || options.some(option => option.key === state.selectedGradeEventKey);
  if (!valid) {
    state.selectedGradeEventKey = options[0]?.key || "all";
  }
  el.progressEventSelect.value = state.selectedGradeEventKey;
}

function filterResultsBySelectedEvent(results) {
  if (state.selectedGradeEventKey === "all") return results;
  return results.filter(result => getGradeEventKey(result) === state.selectedGradeEventKey);
}
