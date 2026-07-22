// Login form / logout button
el.loginForm.addEventListener("submit", signIn);
el.logoutButton.addEventListener("click", logout);

// Grade event dropdown
if (el.progressEventSelect) {
  el.progressEventSelect.addEventListener("change", event => {
    state.selectedGradeEventKey = event.target.value || "all";
    refreshGradesSection();
  });
}

// Window resize: redraw XP info + chart, throttled to one frame
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

// Bootstrap: restore session (if any) and show the right view
state.userId = state.token ? getUserIdFromToken(state.token) : null;
toggle(Boolean(state.token));
