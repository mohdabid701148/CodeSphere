# CodeSphere - Resume Descriptions

## One-Line Description
A full-stack web application that automatically aggregates and visualizes developer statistics from GitHub and Codeforces into a shareable, unified portfolio.

---

## 3-Bullet Version
- Designed and built a full-stack RESTful application using the MERN stack (MongoDB, Express, React, Node.js) to aggregate external developer statistics.
- Engineered a robust backend synchronization service integrating with GitHub and Codeforces APIs, handling dynamic pagination and data normalization.
- Developed a responsive, modern frontend utilizing React Query for state management and Recharts for interactive data visualization, secured by a custom JWT OAuth 2.0 implementation.

---

## 5-Bullet ATS-Friendly Version
- Architected a highly scalable full-stack web application using **React**, **Node.js**, **Express**, and **MongoDB**, serving as an automated portfolio generator for software engineers.
- Implemented secure authentication flows integrating **Google OAuth 2.0** and custom **JSON Web Tokens (JWT)** with strict access and refresh token rotation policies.
- Engineered robust data ingestion pipelines to consume external REST APIs (GitHub, Codeforces), successfully implementing advanced pagination handling, rate-limit awareness, and data normalization.
- Built a modern, responsive Single Page Application (SPA) using **Tailwind CSS** and **TanStack React Query**, drastically improving client-side performance and caching efficiency.
- Hardened the production environment by integrating **Helmet.js** for security headers, **express-rate-limit** for DDoS protection, payload compression, and React Error Boundaries.

---

## Technologies Used
**Languages:** JavaScript (ES6+), HTML5, CSS3
**Frontend:** React 19, Vite, Tailwind CSS, TanStack React Query, Recharts, Axios, React Router
**Backend:** Node.js, Express.js, Mongoose, JWT (JSON Web Tokens)
**Database:** MongoDB
**Security/Perf:** Helmet, Express Rate Limit, Compression

---

## Key Engineering Highlights
- **Seamless Authentication:** Designed a frictionless login experience utilizing Google OAuth combined with a robust custom JWT rotation mechanism via Axios interceptors, ensuring sessions remain secure and active without user interruption.
- **Complex API Orchestration:** The backend acts as a highly efficient proxy, navigating GitHub's paginated REST endpoints to parse repository language bytes and Codeforces contest histories, converting thousands of data points into clean, frontend-ready JSON.
- **Optimistic UI & Caching:** Leveraged `@tanstack/react-query` to provide a highly responsive dashboard. Synchronizations feel instantaneous due to intelligent cache invalidation and loading state management.
