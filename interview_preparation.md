# CodeSphere - Interview Preparation Guide

This document outlines potential interview questions you might face regarding the CodeSphere project, focusing on design decisions, technical trade-offs, and architecture.

---

## 1. Authentication & Security

**Q: Why did you implement custom JWT rotation alongside Google OAuth instead of just using Google's tokens or a managed service like Auth0/Clerk?**
* **Suggested Answer:** Using a managed service is faster, but building custom JWT rotation demonstrates a deep understanding of session management and security. I used Google OAuth strictly for identity verification. Once verified, issuing my own JWTs gave me complete control over the payload size, expiration times, and the database architecture. The access token is kept short-lived (15 minutes) for security, while a long-lived refresh token (stored in the database) allows for a seamless UX via silent background refreshing using Axios interceptors.

**Q: How do you handle security in your application?**
* **Suggested Answer:** Security is handled at multiple layers. 
  1. **Authentication:** Strict JWT validation with separate secrets for access and refresh tokens.
  2. **Data Privacy:** Backend controller logic explicitly verifies the `isPublic` flag or ownership before returning profile data.
  3. **Infrastructure:** Used `helmet.js` to enforce strict HTTP headers (preventing XSS and clickjacking), and `express-rate-limit` to prevent brute-force attacks on the auth endpoints and abuse of external API syncs.

---

## 2. API Integration & Backend Architecture

**Q: GitHub restricts unauthenticated API calls to 60 per hour. How did you handle this, and what were the trade-offs?**
* **Suggested Answer:** I decided to maintain the unauthenticated approach for the MVP to lower the barrier to entry, as requiring users to generate a Personal Access Token (PAT) causes massive drop-off. The trade-off is that heavy usage can trigger rate limits. To mitigate this, I implemented our own rate limiter (`express-rate-limit`) on the `/sync` endpoints. For a production scale-up, I would either implement Redis caching to serve stale data during rate limits, or require an OAuth GitHub App installation to get a much higher server-to-server quota.

**Q: Why do you store the external data (GitHub/Codeforces) in your MongoDB instead of just fetching it on the fly when a user visits a profile?**
* **Suggested Answer:** Fetching on the fly creates a brittle architecture. If GitHub's API goes down or rate-limits the server, the portfolio page would break. By fetching the data via an explicit "Sync" action and saving the aggregated results in MongoDB, the public profile page becomes highly available and extremely fast, effectively decoupling the read-path from the external API dependencies.

---

## 3. Frontend & State Management

**Q: You used TanStack React Query instead of Redux or raw `useEffect`. Why?**
* **Suggested Answer:** CodeSphere deals heavily with "server state"—data that lives on the server and needs to be fetched, cached, and synchronized. Redux is better suited for complex *client* state, while `useEffect` requires manually managing `isLoading` and `isError` boilerplate. React Query handles caching, background refetching, and loading states out of the box, which perfectly fit the Dashboard's need to poll and update synchronized external stats efficiently.

**Q: How do you handle frontend errors to prevent the app from crashing?**
* **Suggested Answer:** I implemented a global React Error Boundary at the root of the application (wrapping the main `<App />` component). If any component throws a runtime JavaScript error (like accessing a property of undefined data), the Error Boundary catches it and displays a professional, user-friendly fallback UI with a "Reload" button, rather than rendering a blank white screen.

---

## 4. Challenges & Future Improvements

**Q: What was the biggest technical challenge you faced while building CodeSphere?**
* **Suggested Answer:** The biggest challenge was orchestrating the GitHub synchronization, specifically calculating the language distribution. GitHub's API paginates repository lists, so I had to implement an async loop to traverse `page=1`, `page=2`, etc., until all repositories were fetched. Then, I had to aggregate the byte count of every language used across all repositories, calculate the percentage, and normalize it into a clean array for the frontend `recharts` library to consume. Ensuring this heavy computation didn't block the Node.js event loop required careful async/await structuring.

**Q: If you had another month to work on this, what would you add?**
* **Suggested Answer:** 
  1. **Redis Caching:** To heavily cache public profiles and protect the database from read spikes.
  2. **Background Queues:** Using a tool like BullMQ or Celery to offload the synchronization process to a background worker, rather than keeping the HTTP request open while fetching 5 pages of GitHub repos.
  3. **More Integrations:** Adding LeetCode and HackerRank support.
  4. **Advanced Testing:** Adding Jest for backend unit tests and Cypress for end-to-end frontend testing.
