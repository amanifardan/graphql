function isCheckpointResult(result) {
  const path = String(result?.path || "").toLowerCase();
  return path.includes("checkpoint");
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

// Re-filters grades by the selected event, re-renders the metrics,
// and redraws the pass/fail donut chart.
function refreshGradesSection() {
  const results = (state.profileData?.result || []).filter(isCheckpointResult);
  const filteredResults = filterResultsBySelectedEvent(results);
  const gradeMetrics = renderResults(filteredResults);
  window.passDonut(gradeMetrics.solved, gradeMetrics.toSolve, gradeMetrics.scorePercentage);
}
