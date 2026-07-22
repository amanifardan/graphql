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
