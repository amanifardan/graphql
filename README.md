# GraphQL Profile Dashboard

Frontend dashboard for the Reboot GraphQL project.
It authenticates users with Basic auth, stores JWT, fetches profile data from GraphQL, and renders SVG charts with responsive behavior.

## Features

- Login with username/email + password using the signin endpoint.
- JWT storage in localStorage and Bearer authentication for GraphQL calls.
- Profile sections:
  - Profile (program/cohort and audit ratio)
  - XP Amount (total XP + XP by project chart)
  - Grades (score/solved/to solve + donut chart)
- Logout support.
- Responsive UI for phone, tablet, and laptop.

## XP Logic

- XP by project includes only project and piscine transactions.
- Bar count by viewport:
  - Phone (<= 767px): 3 bars
  - Tablet (768px to 1023px): 4 bars
  - Laptop/Desktop (>= 1024px): 6 bars
- Total XP is the sum of all project and piscine XP grouped by project (not only visible bars).

### XP number formatting

- Under 100 KB: keep 1 decimal (example: 51.8 KB)
- 100 KB or higher: round to integer (example: 103.5 KB -> 104 KB)

## Project Structure

```text
graphql-/
├── js/
│   ├── app.js
│   ├── blossom-tree.js
│   ├── config.js
│   ├── graphs.js
│   ├── petal-canvas.js
│   ├── query.js
│   └── sidebar.js
├── static/
│   ├── index.html
│   └── style.css
└── README.md
```

## Configuration

Update the API domain in js/config.js.

- Signin: https://<DOMAIN>/api/auth/signin
- GraphQL: https://<DOMAIN>/api/graphql-engine/v1/graphql

## Run Locally

Open static/index.html directly, or run a static server from project root:

```bash
npx serve .
```

Then open the local URL shown in terminal.

## Notes

- This is a static frontend app (no backend server in this repository).
- Do not commit tokens or credentials.
