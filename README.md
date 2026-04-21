# TrackPulse with MongoDB

This project now stores authentication and orders via a MongoDB-backed API.

## 1) Configure environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

Required values:

- `MONGODB_URI`
- `ADMIN_USER`
- `ADMIN_PASS`
- `JWT_SECRET`
- `API_PORT` (default is `4000`)

## 2) Install dependencies

```bash
npm install
```

## 3) Run app + API locally

```bash
npm run dev:full
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`

## 4) Login

Use the credentials you configured in `.env` (`ADMIN_USER` / `ADMIN_PASS`).

No demo credentials are displayed in the UI anymore.
