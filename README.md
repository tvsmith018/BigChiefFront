# Big Chief Ent Frontend

Next.js 16 frontend for Big Chief Ent with server-rendered article pages, auth flows, navigation overlays, and paginated article/comment experiences.

## Requirements

- Node.js 22
- npm

## Environment

Create an `.env` file in the app root with one of these:

```env
NEXT_PUBLIC_API_URL="https://bigchiefnewz-a2e8434d1e6d.herokuapp.com"
```

Legacy support still works with:

```env
NEXT_PUBLIC_ARTICLEURL="https://bigchiefnewz-a2e8434d1e6d.herokuapp.com/graphql/"
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run validate
npm run build
npm run ci
```

## Quality Gate

`npm run ci` is the local release check. It runs:

1. ESLint
2. TypeScript type checking
3. Native Node tests
4. Production build

## CI

GitHub Actions is configured in `.github/workflows/ci.yml` to run the same checks on pushes and pull requests.

## Notes

- Auth and session bootstrapping are handled server-side.
- API base URL resolution is centralized in `src/_network/config/endpoints.ts`.
- Network request behavior is centralized in `src/_network/core/HttpClient.ts`.
