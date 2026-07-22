// toggle between login and profile views
function toggle(isLoggedIn) {
  el.loginView.style.display = isLoggedIn ? "none" : "flex";
  el.profileView.style.display = isLoggedIn ? "grid" : "none";
}

function err(message) {
  el.loginError.textContent = message;
}
