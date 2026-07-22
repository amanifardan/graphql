function renderUser(user) {
  el.welcomeTitle.textContent = "Welcome, " + user.login;
  el.basicId.innerHTML = "";
  el.basicAudit.innerHTML = "";

  el.basicId.appendChild(createListItem("ID", user.id));
  el.basicId.appendChild(createListItem("Login", user.login));

  renderAudit(user);
}
