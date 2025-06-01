# System Patterns: AIESEMAR

## System Architecture

- **Frontend Framework:** Next.js (app directory structure detected)
- **Component Structure:** Components organized under `components/` and `components/ui/`
- **Styling:** Tailwind CSS (tailwind.config.mjs, postcss.config.js present)
- **API Layer:** Custom API routes under `app/(payload)/api/`
- **Admin/Backend:** Payload CMS integration (payload.config.ts, collections/ directory)
- **Public Assets:** Static files in `public/`

## Key Technical Decisions

- Use of Next.js app directory for routing and layouts.
- Modular UI components for reusability.
- Payload CMS for content management and admin features.
- Tailwind CSS for utility-first styling.
- TypeScript for type safety (tsconfig.json present).

## Design Patterns

- Separation of concerns: UI, logic, and API routes are organized in dedicated directories.
- Custom hooks and modules for logic (expected based on project conventions).
- Use of environment and config files for project-wide settings.

## Component Relationships

- UI components in `components/ui/` are likely used by higher-level components in `components/` and pages in `app/(app)/`.
- Admin and API logic separated under `app/(payload)/admin/` and `app/(payload)/api/`.

## Critical Implementation Paths

- Video player and bass boost logic will be implemented as custom React components and hooks.
- File loading and offline playback handled in the frontend, possibly using browser APIs.
- Audio processing (bass boost) to be handled client-side, likely via Web Audio API.
