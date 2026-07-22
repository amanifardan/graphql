// Reusable DOM creator: builds a labeled metric <li> for any info list.
function createListItem(label, value) {
  const li = document.createElement("li");
  li.className = "metric-item";

  const labelEl = document.createElement("p");
  labelEl.className = "metric-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("p");
  valueEl.className = "metric-value";
  valueEl.textContent = String(value);

  li.appendChild(labelEl);
  li.appendChild(valueEl);
  return li;
}

// Formats raw byte counts (audit up/down) into a human-readable size.
function formatDataSize(amount) {
  const value = Number(amount || 0);
  if (!Number.isFinite(value)) return "0 B";

  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + " MB";
  }
  if (value >= 1_000) {
    return Math.round(value / 1_000).toLocaleString() + " KB";
  }

  return Math.round(value).toLocaleString() + " B";
}

// Formats raw XP amounts into a human-readable size (B / KB).
function formatXp(amount) {
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

// Exposed for graphs.js, which labels bars with the same XP formatting.
window.formatXp = formatXp;
