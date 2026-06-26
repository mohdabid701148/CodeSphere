# CodeSphere - Project Documentation

## 1. Architecture Overview
CodeSphere is a full-stack web application designed to automatically aggregate, analyze, and present developer statistics from GitHub and Codeforces into a unified, shareable portfolio.

The application follows a standard MERN-like stack (MongoDB, Express, React, Node.js), but utilizes Vite for modern frontend tooling.
- **Frontend:** React SPA built with Vite, styled with Tailwind CSS, utilizing `@tanstack/react-query` for server-state management and `recharts` for data visualization.
- **Backend:** Node.js/Express REST API serving JSON.
- **Database:** MongoDB via Mongoose ORM.
- **Authentication:** Custom JWT-based authentication with access and refresh tokens, integrating Google OAuth 2.0.

## 2. Folder Structure

```text
CodeSphere/
├── backend/
│   ├── config/          # Database connection
│   ├── controllers/     # Route logic (auth, integrations, sync, profile)
│   ├── middleware/      # Auth, Error handling, Security
│   ├── models/          # Mongoose Schemas (User, ConnectedAccount, GitHubStats, etc.)
│   ├── routes/          # Express Routers
│   ├── utils/           # Helpers (ApiError, ApiResponse, asyncHandler)
│   └── server.js        # Entry point
└── frontend/
    ├── public/          # Static assets
    ├── src/
    │   ├── assets/      # Images, SVGs
    │   ├── components/  # Reusable UI components (Navbar, ProtectedRoute, ErrorBoundary)
    │   ├── context/     # React Context (AuthContext)
    │   ├── hooks/       # Custom React Hooks (useDashboard, useIntegrations)
    │   ├── pages/       # Page components (Dashboard, Integrations, PublicProfile, Login, etc.)
    │   ├── services/    # API abstraction (api.js, syncService.js)
    │   ├── App.jsx      # Router configuration
    │   └── main.jsx     # React entry point
    └── package.json
```

## 3. Database Schema Overview

- **User**: Stores primary authentication and profile data (`name`, `email`, `googleId`, `avatar`, `slug`, `headline`, `bio`, `isPublic`). Includes methods for generating JWTs.
- **ConnectedAccount**: Tracks external integrations. Fields: `userId`, `platform` ('github' or 'codeforces'), `username`, `connected`, `lastSync`, `syncStatus`. Unique compound index on `[userId, platform]`.
- **GitHubStats**: Stores aggregated GitHub metrics. Fields: `userId`, `repos`, `stars`, `followers`, `following`, `languages` (Array of objects with name/percentage).
- **CodeforcesStats**: Stores Codeforces metrics. Fields: `userId`, `rating`, `maxRating`, `rank`, `maxRank`, `contestHistory` (Array of past contests).
- **SyncLog**: Audit trail for synchronizations. Fields: `userId`, `platform`, `status` (success/error), `errorMessage`, `duration`.

## 4. Authentication Flow
1. User clicks "Login with Google".
2. Backend initiates OAuth 2.0 flow (`/auth/google`).
3. Google redirects to `/auth/google/callback` with a code.
4. Backend exchanges code for Google tokens, fetches user info, and upserts the `User` document.
5. Backend generates an `accessToken` (short-lived, e.g. 15m) and `refreshToken` (long-lived, e.g. 7d), saves the refresh token to the DB.
6. Backend redirects to Frontend `/login?accessToken=...&refreshToken=...`.
7. Frontend extracts tokens, saves to `localStorage`, and updates `AuthContext`.
8. Axios interceptor (`api.js`) automatically attaches `accessToken` to requests and seamlessly requests a new one via `/auth/refresh-token` if a 401 is encountered.

## 5. GitHub Synchronization Flow
1. Client requests POST `/sync/github`.
2. Backend verifies `ConnectedAccount` exists for GitHub.
3. Backend fetches `api.github.com/users/:username`. Extracts followers, following, public_repos.
4. Backend fetches `api.github.com/users/:username/repos`, handling pagination up to 100 per page to fetch all repos.
5. Backend calculates total stars across all repos and aggregates language usage bytes.
6. Language bytes are converted to percentages.
7. `GitHubStats` document is upserted. `ConnectedAccount` lastSync is updated. `SyncLog` is created.
8. Client receives success and invalidates React Query cache to re-render UI.

## 6. Codeforces Synchronization Flow
1. Client requests POST `/sync/codeforces`.
2. Backend verifies `ConnectedAccount` exists for Codeforces.
3. Backend fetches `codeforces.com/api/user.info` to get rating, maxRating, rank, maxRank.
4. Backend fetches `codeforces.com/api/user.rating` to get contest history.
5. `CodeforcesStats` document is upserted. `ConnectedAccount` lastSync is updated. `SyncLog` is created.

## 7. Environment Variables

**Backend (`.env`)**
- `PORT`: 5000
- `MONGODB_URI`: MongoDB connection string
- `ACCESS_TOKEN_SECRET`: Secret for signing JWT access tokens
- `ACCESS_TOKEN_EXPIRY`: e.g., '15m'
- `REFRESH_TOKEN_SECRET`: Secret for signing JWT refresh tokens
- `REFRESH_TOKEN_EXPIRY`: e.g., '7d'
- `GOOGLE_CLIENT_ID`: OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: OAuth Client Secret
- `FRONTEND_URL`: URL of the frontend (e.g., http://localhost:5173)
- `MOCK_AUTH`: 'true' or 'false' (bypass Google OAuth for local dev)
- `NODE_ENV`: 'development' or 'production'

**Frontend (`.env`)**
- `VITE_API_URL`: Backend URL (e.g., http://localhost:5000)

## 8. Local Setup Instructions

1. Clone the repository.
2. Setup Backend:
   ```bash
   cd backend
   npm install
   cp .env.example .env # fill in variables
   npm run dev
   ```
3. Setup Frontend:
   ```bash
   cd frontend
   npm install
   cp .env.example .env # fill in VITE_API_URL
   npm run dev
   ```

## 9. Deployment Guide

- **Database**: Host MongoDB on MongoDB Atlas. Ensure network access is configured for the backend's IP.
- **Backend**: Deploy the Node.js app to a service like Render, Heroku, or AWS EC2. Set all required environment variables, specifically `NODE_ENV=production`.
- **Frontend**: Build the React app (`npm run build`) and deploy the `dist` folder to an edge CDN like Vercel, Netlify, or AWS CloudFront. Set `VITE_API_URL` to the production backend URL during build.

## 10. Troubleshooting
- **OAuth Login Fails**: Ensure the Google Cloud Console redirect URI precisely matches the backend route (e.g. `http://localhost:5000/auth/google/callback`).
- **Token Refresh Loops**: Check `api.js` if the refresh token endpoint is returning 401 due to DB mismatch (e.g. wiped database but old localStorage). Clearing local storage resolves this.
- **GitHub Sync Fails**: GitHub limits unauthenticated requests to 60/hr. If exceeded, wait an hour or provide a GitHub PAT in the backend.
