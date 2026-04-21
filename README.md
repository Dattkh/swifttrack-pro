# TrackPulse with Simple MongoDB CRUD

This project uses a simple MongoDB backend for CRUD operations.

## 1) Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set values:

- `MONGODB_URI`
- `ADMIN_USER`
- `ADMIN_PASS`
- `API_PORT` (default `4000`)

## 2) Install dependencies

```bash
npm install
```

## 3) Run frontend + API

```bash
npm run dev:full
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`

## Admin login for dashboard

Admin login uses the values in your `.env` file:

- Username = `ADMIN_USER`
- Password = `ADMIN_PASS`

Default example values are:

- `admin`
- `admin123`

## What is stored in MongoDB

- Admin credential record
- Orders (create, read, update, delete)
