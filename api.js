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
