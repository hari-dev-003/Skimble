<div align="center">

<img src="frontend/public/android-chrome-192x192.png" alt="Skimble" width="88" height="88" />

# Skimble

**A real-time collaborative whiteboard & notes workspace.**

Sketch, brainstorm, and capture ideas together — instantly synced across everyone in a session.

[![License: MIT](https://img.shields.io/badge/License-MIT-2563EB.svg)](LICENSE)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Amplify_·_Lambda_·_DynamoDB-FF9900?logo=amazonaws&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?logo=socket.io&logoColor=white)

</div>

---

## Overview

Skimble is a full-stack collaborative canvas. Users create a **session**, share a 6-character code, and everyone who joins can draw, add sticky notes, and edit shapes on a shared board — with changes and live cursors broadcast in real time over WebSockets. Alongside the whiteboard, Skimble provides a lightweight **notes** workspace with search.

The app is deployed on AWS: the React frontend on **AWS Amplify**, the Express/Socket.IO backend on **AWS Lambda**, and data in **Amazon DynamoDB**, with authentication handled by **Amazon Cognito**.

> 📐 A full architecture walkthrough is available in [`docs/Skimble-Deployment-Diagram.pdf`](docs/Skimble-Deployment-Diagram.pdf).

---

## Features

- 🎨 **Real-time collaborative whiteboard** — a Konva-powered canvas with pen, shapes (rectangle, circle, line, arrow), text, and sticky notes.
- 👥 **Session-based collaboration** — create a session, invite others with a 6-character code, and see live participant presence and cursors.
- ⚡ **Instant sync** — element create/update/delete and cursor moves are broadcast to all participants via Socket.IO.
- 📝 **Notes workspace** — create, edit, search, and delete notes, persisted to DynamoDB.
- 🧩 **Templates** — start boards from ready-made templates.
- 🔐 **Secure authentication** — Amazon Cognito (OAuth2 / OIDC); the backend verifies JWTs on every request.
- 🌗 **Light & dark themes** with a responsive, sidebar-driven layout.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, React Router v7, react-oidc-context, Konva / react-konva, socket.io-client, Framer Motion, GSAP, Axios |
| **Backend** | Node.js, Express 5, Socket.IO, AWS SDK v3, `jsonwebtoken` + `jwk-to-pem` (Cognito JWT verification) |
| **Database** | Amazon DynamoDB (`boardDetails`, `sessionDetails`) — tables auto-created on boot |
| **Auth** | Amazon Cognito (OIDC / OAuth2, JWT Bearer tokens) |
| **Realtime** | Socket.IO (WebSocket) |
| **Deployment** | AWS Amplify (frontend) · AWS Lambda (backend) · Amazon DynamoDB |

---

## Project Structure

```
Notespace/
├── frontend/              # React + Vite single-page app
│   ├── src/
│   │   ├── pages/         # Landing, Home, Whiteboard, Brainstorm, Join, Team, …
│   │   ├── components/    # Sidebar, Logo, whiteboard canvas & toolbar, …
│   │   ├── context/       # Session + Theme providers
│   │   ├── hooks/         # useWhiteboardSocket
│   │   └── assets/        # Logo source (see below)
│   ├── scripts/           # generate-icons.mjs (favicon/OG generation)
│   └── public/            # favicons, manifest, OG image
├── backend/               # Node.js + Express + Socket.IO API
│   ├── routes/            # details.route, session.route
│   ├── controllers/       # notes + session logic
│   ├── sockets/           # whiteboard.socket.js (realtime handlers)
│   ├── middleware/        # auth.js (Cognito JWT verification)
│   ├── db/                # ensureTables.js (auto-provisions DynamoDB)
│   └── index.js           # server entry (HTTP + Socket.IO)
├── docs/                  # architecture diagram (PDF + SVG)
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- An **AWS account** with:
  - A **Cognito** User Pool + App Client (for auth)
  - IAM credentials with **DynamoDB** access (tables are created automatically on first run)

### 1. Clone

```bash
git clone https://github.com/hari-dev-003/Notespace.git
cd Notespace
```

### 2. Backend

```bash
cd backend
npm install
# create backend/.env (see Environment Variables below)
npm run dev          # starts on http://localhost:3000 (nodemon)
```

On startup the backend verifies Cognito keys and calls `ensureAllTables()`, which creates the DynamoDB tables if they don't already exist.

### 3. Frontend

```bash
cd frontend
npm install
# create frontend/.env (see Environment Variables below)
npm run dev          # starts on http://localhost:5173
```

Open **http://localhost:5173** and sign in through the Cognito hosted UI.

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `FRONTEND_URL` | Allowed origin for Socket.IO CORS (e.g. `http://localhost:5173`) |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID (for JWT verification) |
| `COGNITO_REGION` | Region of the Cognito User Pool |
| `SERVICE_REGION` | AWS region for DynamoDB |
| `SERVICE_ACCESS_KEY_ID` | AWS access key ID |
| `SERVICE_SECRET_ACCESS_KEY` | AWS secret access key |
| `TABLE_NAME` | DynamoDB table name for notes (e.g. `boardDetails`) |
| `SESSION_TABLE_NAME` | DynamoDB table name for sessions (e.g. `sessionDetails`) |

### `frontend/.env`

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend base URL (e.g. `http://localhost:3000`) |
| `VITE_COGNITO_AUTHORITY` | Cognito OIDC issuer URL |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID |
| `VITE_COGNITO_CLIENT_SECRET` | Cognito App Client secret |
| `VITE_COGNITO_REDIRECT_URI` | Post-login redirect (e.g. `http://localhost:5173`) |
| `VITE_COGNITO_DOMAIN` | Cognito hosted-UI domain |

> ⚠️ Never commit `.env` files or AWS credentials. They are git-ignored by default.

---

## Available Scripts

**Frontend** (`frontend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the Vitest suite |
| `npm run icons` | Regenerate favicons / OG image from the logo |

**Backend** (`backend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start with Node |

---

## API Reference

All routes are prefixed with `/api`. Authenticated routes require an `Authorization: Bearer <JWT>` header.

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/details` | List the current user's notes |
| `POST` | `/api/details` | Create a note |
| `PUT` | `/api/details/:boardId` | Update a note |
| `DELETE` | `/api/details/:boardId` | Delete a note |

### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | List the current user's sessions |
| `POST` | `/api/sessions` | Create a session (returns a join code) |
| `POST` | `/api/sessions/:code/join` | Join a session by code |
| `GET` | `/api/sessions/:code` | Fetch a session |
| `DELETE` | `/api/sessions/:code` | Delete a session |

### Realtime (Socket.IO)

| Direction | Event | Purpose |
|-----------|-------|---------|
| Client → Server | `join-session`, `leave-session` | Presence in a board room |
| Client → Server | `element-upsert`, `element-delete` | Create/update/remove canvas elements |
| Client → Server | `cursor-move` | Broadcast cursor position |
| Server → Client | `session-synced` | Initial board state on join |
| Server → Client | `element-upserted`, `element-deleted` | Element changes from others |
| Server → Client | `cursor-moved`, `participant-joined`, `participant-left` | Presence updates |

---

## Deployment

- **Frontend → AWS Amplify** — connect the repo; Amplify builds the `frontend/` app and serves it over HTTPS/CDN.
- **Backend → AWS Lambda** — the Express + Socket.IO server runs behind Lambda.
- **Database → Amazon DynamoDB** — `boardDetails` and `sessionDetails` tables.

See the annotated flow in [`docs/Skimble-Deployment-Diagram.pdf`](docs/Skimble-Deployment-Diagram.pdf).

---

## Roadmap

- Persistent, functional team management & email invites
- Board export to image / PDF
- Version history and rollback
- Offline mode with sync-on-reconnect
- Additional templates (flowcharts, diagrams, storyboards)

---

## Contributing

Contributions are welcome! Please read the **[Contributing Guide](CONTRIBUTING.md)** before you start — it covers how to fork the repo, set up your branch, and what to check **before opening an issue**.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

Created by **Hari Dev M V** · © 2025
