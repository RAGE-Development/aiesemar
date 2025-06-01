# Tech Context: AIESEMAR

## Technologies Used

- **Framework:** Next.js (React, app directory)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, PostCSS
- **State/Data:** React Query (preferred), custom hooks
- **HTTP Client:** ky (preferred)
- **CMS:** Payload CMS (Node.js, MongoDB)
- **Package Manager:** pnpm (preferred)
- **Linting/Formatting:** ESLint, Prettier
- **Containerization:** Docker (Dockerfile, docker-compose.yml)
- **Other:** Custom utility libraries in `lib/`

## Development Setup

- Install dependencies with `pnpm install`.
- Run development server with Next.js scripts.
- Payload CMS configured via `payload.config.ts`.
- Tailwind and PostCSS configured for styling.
- TypeScript enforced via `tsconfig.json`.
- Environment variables managed via `environment.d.ts` and config files.

## Technical Constraints

- Must work offline (no reliance on external APIs for core features).
- Audio processing (bass boost) must be handled client-side.
- Should support cross-platform usage (web-first, desktop possible via Electron if needed).

## Dependencies

- next
- react, react-dom
- tailwindcss, postcss
- payload
- ky (to be used for HTTP requests)
- react-query (to be used for data management)
- typescript
- eslint, prettier

## Tool Usage Patterns

- Use pnpm for all package management tasks.
- Use ky for all HTTP requests.
- Use react-query for data fetching and caching.
- Organize logic into custom hooks and modules.
- Use Tailwind CSS utility classes for styling.
