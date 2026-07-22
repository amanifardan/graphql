// login list has been rendered.
function renderAudit(user) {
  const auditRatioNumber = Number(user.auditRatio);
  const auditRatioDisplay = Number.isFinite(auditRatioNumber)
    ? auditRatioNumber.toFixed(1)
    : "N/A";
  const doneDisplay = formatDataSize(user.totalUp);
  const receivedDisplay = formatDataSize(user.totalDown);

  el.basicAudit.appendChild(createAuditRatioWidget({
    doneAmount: user.totalUp,
    doneLabel: doneDisplay,
    receivedAmount: user.totalDown,
    receivedLabel: receivedDisplay,
    ratioLabel: auditRatioDisplay,
  }));
}

function createAuditRatioWidget({ doneAmount, doneLabel, receivedAmount, receivedLabel, ratioLabel }) {
  const doneValue = Math.max(0, Number(doneAmount || 0));
  const receivedValue = Math.max(0, Number(receivedAmount || 0));
  const maxValue = Math.max(doneValue, receivedValue, 1);

  const wrap = document.createElement("div");
  wrap.className = "audit-ratio-widget";

  const title = document.createElement("h3");
  title.className = "audit-ratio-title";
  title.textContent = "Audit Ratio";

  const doneRow = createAuditBarRow("Done", doneLabel, (doneValue / maxValue) * 100, true);
  const receivedRow = createAuditBarRow("Received", receivedLabel, (receivedValue / maxValue) * 100, false);

  const ratioValue = document.createElement("p");
  ratioValue.className = "audit-ratio-number";
  ratioValue.textContent = ratioLabel;

  wrap.appendChild(title);
  wrap.appendChild(doneRow);
  wrap.appendChild(receivedRow);
  wrap.appendChild(ratioValue);

  return wrap;
}

function createAuditBarRow(label, valueText, percent, isDone) {
  const row = document.createElement("div");
  row.className = "audit-bar-row";

  const top = document.createElement("div");
  top.className = "audit-bar-top";

  const labelEl = document.createElement("p");
  labelEl.className = "audit-bar-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("p");
  valueEl.className = "audit-bar-value";
  valueEl.textContent = valueText;

  const track = document.createElement("div");
  track.className = "audit-bar-track";

  const fill = document.createElement("div");
  fill.className = isDone ? "audit-bar-fill audit-bar-fill-done" : "audit-bar-fill audit-bar-fill-received";
  fill.style.width = `${Math.max(0, Math.min(100, percent)).toFixed(2)}%`;

  top.appendChild(labelEl);
  top.appendChild(valueEl);
  track.appendChild(fill);
  row.appendChild(top);
  row.appendChild(track);

  return row;
}
