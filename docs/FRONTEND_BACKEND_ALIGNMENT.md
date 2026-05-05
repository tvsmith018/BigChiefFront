# Frontend/Backend Alignment

Last reviewed: 2026-05-05

## Current Screen to Backend Map

### Home page
- Frontend: `src/app/page.tsx`
- Backend: GraphQL `articles(...)`
- Status: wired and operational

### Category articles
- Frontend: `src/app/articles/[category]/page.tsx`
- Backend: GraphQL `articles(category: ...)`
- Status: wired and operational

### Article detail
- Frontend: `src/app/articles/details/[id]/page.tsx`
- Backend:
  - GraphQL `articles(id: ...)`
  - GraphQL `comments(article: ...)`
  - GraphQL `categoryArticles(category:, excludeId:)`
- Status: wired and operational

### Ratings
- Frontend:
  - `src/_utilities/hooks/article/useArticleRating.ts`
  - `src/_views/details/ArticleRatingView.tsx`
- Backend:
  - `GET /articles/rating/<article_id>/`
  - `POST /articles/rating/<article_id>/set/`
- Status: wired and operational

### Live comments
- Frontend: `src/_utilities/hooks/article/useArticleComments.ts`
- Backend: websocket `ws/articles/<article_id>/`
- Status: wired and operational

### Login
- Frontend:
  - `src/app/auth/@login/page.tsx`
  - `src/_services/auth/authservices.ts`
- Backend:
  - `POST /authorized/login/`
  - `GET /authorized/me/`
  - `POST /authorized/token/refresh/`
  - `GET /authorized/logout/`
- Status: wired and aligned

### Signup
- Frontend:
  - `src/app/auth/@signup/page.tsx`
  - `src/_services/auth/authservices.ts`
- Backend:
  - `POST /authorized/signup/`
  - `POST /authorized/otp/`
- Status: wired and operational

### Password reset
- Frontend:
  - `src/_views/authorization/passwordreset/resetview.tsx`
  - `src/_services/auth/authservices.ts`
- Backend:
  - `POST /authorized/otp/`
  - `POST /authorized/reset-password/`
- Status: wired and operational

### Information pages
- Frontend: `src/app/information/[info]/page.tsx`
- Backend: none, local JSON content
- Status: frontend-only by design

## Missing Frontend States and Flows

### Payments
- Backend already supports:
  - `POST /payments/one-time/checkout/`
  - `POST /payments/recurring/checkout/`
  - `GET /payments/checkout/status/`
  - `POST /payments/webhooks/stripe/`
- Frontend currently has no checkout, checkout-status, or billing UI.

### Article analytics
- Backend article models already track:
  - `views_count`
  - `unique_views_count`
  - `counted_views_count`
- Frontend currently renders placeholder values like `0 views` and `N/A`.

### Author detail panel
- Frontend author tab expects optional `bio` and `dob`.
- Current GraphQL queries do not request those fields.
- Current backend `UserNode` does not expose them.
- Result: tab works, but author details are thin.

## Alignment Notes

### Auth/session
- Frontend now uses the real refresh endpoint path: `/authorized/token/refresh/`.
- Session bootstrap, refresh, and logout behavior are aligned with backend auth routes.

### Websockets
- Frontend websocket host now derives from configured API origin instead of a hardcoded production host.
- This keeps local, staging, and production behavior aligned.

### Known backend route mismatch
- Frontend endpoint config still contains `checkExistence`.
- Backend does not currently expose `/authorized/check-email/`.
- It is unused in the frontend and should stay unused unless the backend adds that route.

## Recommended Next Integration Work

1. Build billing screens against the existing payments API.
2. Expose article analytics data in GraphQL if article detail should show real stats.
3. Decide whether author bio/dob should be exposed to the frontend.
4. Add integration tests once payments and richer article stats are connected.
