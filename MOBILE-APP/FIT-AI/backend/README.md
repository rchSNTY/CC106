# FIT-AI Backend (JSON First, MongoDB Ready)

This backend is built with Node.js + Express + TypeScript.

Current storage is a JSON file at `data/db.json`, with a repository/service structure so it can be migrated to MongoDB later with minimal route/controller changes.

## Features

- JWT authentication
- User profile create/update/get
- Avatar upload to local `uploads/avatars`
- Workouts listing and filtering
- Favorites add/remove/list
- Workout history add/list
- Health endpoint

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Run dev server:

```bash
npm run dev
```

Server runs on `http://localhost:4000` by default.

## API Endpoints

Base: `/api`

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout` (auth required)
- `GET /auth/me` (auth required)
- `GET /profile` (auth required)
- `PUT /profile` (auth required)
- `POST /profile/avatar` (auth required, multipart key: `avatar`)
- `GET /workouts`
- `GET /workouts/:id`
- `GET /favorites` (auth required)
- `POST /favorites/:workoutId` (auth required)
- `DELETE /favorites/:workoutId` (auth required)
- `GET /history` (auth required)
- `POST /history` (auth required)

## Frontend Integration Notes

- Use `Authorization: Bearer <jwt>` for protected routes.
- Avatar upload returns `avatarUrl` pointing to static `/uploads` path.
- Workouts support query params:
  - `intensity=All|Light|Moderate|Intense`
  - `search=<text>`

## MongoDB Migration Plan

When ready, replace JSON repository implementation in `src/repositories/json-db.ts` with MongoDB repository functions while keeping services/controllers/routes unchanged.
