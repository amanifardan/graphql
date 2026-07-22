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
