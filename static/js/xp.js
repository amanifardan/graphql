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

// Re-draws the XP bar chart from the currently loaded profile data.
function refreshXpChart() {
  const user = state.profileData?.user?.[0];
  if (!user) return;
  window.xpBar(user.TransactionsFiltered1 || []);
}
