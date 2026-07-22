const state = {
  token: localStorage.getItem(window.APP_CONFIG.TOKEN_STORAGE_KEY) || "",
  userId: null,
  profileData: null,
  selectedGradeEventKey: "all",
};

const el = {
  loginView: document.getElementById("login-view"),
  profileView: document.getElementById("profile-view"),
  loginForm: document.getElementById("login-form"),
  identifier: document.getElementById("identifier"),
  password: document.getElementById("password"),
  loginError: document.getElementById("login-error"),
  logoutButton: document.getElementById("logout-button"),
  welcomeTitle: document.getElementById("welcome-title"),
  basicId: document.getElementById("basic-id"),
  basicAudit: document.getElementById("basic-audit"),
  xpInfo: document.getElementById("xp-info"),
  progressInfo: document.getElementById("progress-info"),
  progressEventSelect: document.getElementById("progress-event-select"),
};

// toggle between login and profile views
function toggle(isLoggedIn) {
  el.loginView.style.display = isLoggedIn ? "none" : "flex";
  el.profileView.style.display = isLoggedIn ? "grid" : "none";
}

function err(message) {
  el.loginError.textContent = message;
}

async function signIn(event) {
  event.preventDefault();
  err("");

  const identifier = el.identifier.value.trim();
  const password = el.password.value;

  // validate input
  if (!identifier || !password) {
    err("Please fill in both fields.");
    return;
  }

  // send POST request to sign in endpoint
  try {
    const res = await fetch(window.APP_CONFIG.SIGNIN_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(identifier + ":" + password),
      },
    });

    if (!res.ok) throw new Error("Username/email or password incorrect, try again.");

    // get token from response (may be JSON string or plain text)
    let token = (await res.text()).trim();
    
    // remove quotes if the token is wrapped in JSON string
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
    
    console.log("Token length:", token.length, "First 50 chars:", token.substring(0, 50));
    
    if (!token) throw new Error("No token in response");    
    state.token = token;
    state.userId = getUserIdFromToken(token);
    localStorage.setItem(window.APP_CONFIG.TOKEN_STORAGE_KEY, token);
    toggle(true);
    await loadProfile();
  } catch (e) {
    err(e.message);
  }
}

function logout() {
  state.token = "";
  state.userId = null;
  state.profileData = null;
  localStorage.removeItem(window.APP_CONFIG.TOKEN_STORAGE_KEY);
  toggle(false);
}  

// attach event listeners to buttons
el.loginForm.addEventListener("submit", signIn);
el.logoutButton.addEventListener("click", logout);
state.userId = state.token ? getUserIdFromToken(state.token) : null;
toggle(Boolean(state.token));

function getUserIdFromToken(token) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "==".slice((normalized.length + 3) % 4);
    const payload = JSON.parse(atob(padded));

    return payload["https://hasura.io/jwt/claims"]?.["x-hasura-user-id"]
      ?? payload.userId
      ?? payload.id
      ?? payload.sub
      ?? null;
  } catch {
    return null;
  }
}

// fetch and display profile data
async function graphql(query, variables = {}) {
  // send POST request to GraphQL endpoint with query and variables
  const res = await fetch(window.APP_CONFIG.GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + state.token,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error("GraphQL request failed: " + res.status);
  }

  const data = await res.json();

  if (data.errors) {
    console.log("GraphQL Error details:", data.errors);
    throw new Error(data.errors[0].message);
  }

  return data.data;
}

// rendering
function renderUser(user) {
  el.welcomeTitle.textContent = "Welcome, " + user.login;
  el.basicId.innerHTML = "";
  el.basicAudit.innerHTML = "";
  const auditRatioNumber = Number(user.auditRatio);
  const auditRatioDisplay = Number.isFinite(auditRatioNumber)
    ? auditRatioNumber.toFixed(1)
    : "N/A";
  const doneDisplay = formatDataSize(user.totalUp);
  const receivedDisplay = formatDataSize(user.totalDown);

  el.basicId.appendChild(createListItem("ID", user.id));
  el.basicId.appendChild(createListItem("Login", user.login));
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

window.formatXp = formatXp;

function shouldIncludeXpTransaction(tx) {
  const type = String(tx?.object?.type || "").toLowerCase();
  return type === "project" || type === "piscine";
}

function renderXp(transactions, currentLevel) {
  const filteredTransactions = transactions.filter(shouldIncludeXpTransaction);

  // Sum XP by project for all project/piscine entries, independent of chart bar limits.
  const projectTotals = new Map();
  filteredTransactions.forEach(tx => {
    const key = String(tx?.objectId ?? "");
    const amount = Number(tx?.amount || 0);
    if (!Number.isFinite(amount)) return;
    projectTotals.set(key, (projectTotals.get(key) || 0) + amount);
  });

  const total = Array.from(projectTotals.values()).reduce((sum, amount) => sum + amount, 0);
  el.xpInfo.innerHTML = "";
  el.xpInfo.appendChild(createListItem("Total XP", formatXp(total)));
  if (currentLevel !== null) {
     el.xpInfo.appendChild(createListItem("Current Level", Number(currentLevel).toFixed(0)));
  }
}

function renderResults(results) {
  const solved = results.filter(r => Number(r.grade) >= 1).length;
  const toSolve = Math.max(0, results.length - solved);
  const gradeSum = results.reduce((sum, r) => sum + Math.max(0, Number(r.grade || 0)), 0);
  const scorePercentage = results.length > 0
    ? Math.min(100, (gradeSum / results.length) * 100)
    : 0;

  el.progressInfo.innerHTML = "";
  el.progressInfo.appendChild(createListItem("Score", `${Math.round(scorePercentage)}%`));
  el.progressInfo.appendChild(createListItem("Solved", solved));
  el.progressInfo.appendChild(createListItem("To Solve", toSolve));

  return { solved, toSolve, scorePercentage };
}

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

function isCheckpointResult(result) {
  const path = String(result?.path || "").toLowerCase();
  return path.includes("checkpoint");
}

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

function refreshGradesSection() {
  const results = (state.profileData?.result || []).filter(isCheckpointResult);
  const filteredResults = filterResultsBySelectedEvent(results);
  const gradeMetrics = renderResults(filteredResults);
  window.passDonut(gradeMetrics.solved, gradeMetrics.toSolve, gradeMetrics.scorePercentage);
}

function refreshXpChart() {
  const user = state.profileData?.user?.[0];
  if (!user) return;
  window.xpBar(user.TransactionsFiltered1 || []);
}

if (el.progressEventSelect) {
  el.progressEventSelect.addEventListener("change", event => {
    state.selectedGradeEventKey = event.target.value || "all";
    refreshGradesSection();
  });
}

let xpResizeRaf = null;
window.addEventListener("resize", () => {
  if (!state.profileData) return;
  if (xpResizeRaf !== null) {
    cancelAnimationFrame(xpResizeRaf);
  }
  xpResizeRaf = requestAnimationFrame(() => {
    const user = state.profileData?.user?.[0];
    const currentLevel = state.profileData?.level?.[0]?.amount ?? null;
    if (user) {
      renderXp(user.TransactionsFiltered1 || [], currentLevel);
    }
    refreshXpChart();
    xpResizeRaf = null;
  });
});

// loading
async function loadProfile() {
  try {
    if (!state.userId) {
      throw new Error("Missing authenticated user id.");
    }

    const profileData = await graphql(window.PROFILE_QUERY, { userId: Number(state.userId) });
    state.profileData = profileData;

    const user = profileData.user[0];
    const currentLevel = profileData.level?.[0]?.amount ?? null;
    const results = (profileData.result || []).filter(isCheckpointResult);

    console.log("Profile data:", profileData);

    renderUser(user);
    renderXp(user.TransactionsFiltered1 || [], currentLevel);
    const gradeEventOptions = buildGradeEventOptions(results);
    renderGradeEventSelect(gradeEventOptions);
    refreshGradesSection();

    // prep data for graphs
    refreshXpChart();

  } catch (e) {
    console.error("Profile loading error:", e);
    err("Failed to load profile: " + e.message);
    toggle(false);
  }
}