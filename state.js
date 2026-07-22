const state = {
  token: localStorage.getItem(window.APP_CONFIG.TOKEN_STORAGE_KEY) || "",
  userId: null,
  profileData: null,
  selectedGradeEventKey: "all",
};
