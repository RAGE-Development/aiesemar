# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIESEMAR is an ASMR video player web application built with Next.js 15 and React 19. It supports local video files and YouTube playlists with features like bass boost (using Web Audio API), video queue management, cinema mode, and theme switching.

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors

# Testing
pnpm test             # Run tests once
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage report
pnpm test:ui          # Open Vitest UI

# Dependencies
pnpm ii               # Install dependencies (ignore workspace)
pnpm reinstall        # Clean reinstall all dependencies
```

## Architecture

### App Structure (Next.js App Router)

- `app/` - Next.js app router pages and components
  - `_components/` - Page-specific components (underscore prefix = not routes)
  - `api/` - API route handlers
- `components/ui/` - Shared UI components (shadcn/ui, new-york style)
- `lib/` - Shared utilities, types, and hooks

### Core Components

**ASMRVideoPlayer** (`app/_components/ASMRVideoPlayer/`)
- `ASMRVideoPlayer.tsx` - Main video player UI component
- `ASMRVideoPlayer.module.ts` - Custom hook containing all player logic (audio context, queue management, fullscreen handling)
- Uses discriminated union pattern for queue items (LocalQueueItem | YouTubeQueueItem)

### API Routes

- `/api/youtube/playlist` - Fetches YouTube playlist items via YouTube Data API v3 (requires `YOUTUBE_API_KEY` env var)
- `/api/yt-stream` - Gets direct stream URLs for YouTube videos
- `/api/yt-playlist` - Legacy playlist import endpoint

### Key Libraries

- **shadcn/ui** - UI components (Button, Card, Slider, etc.) configured via `components.json`
- **Radix UI** - Headless primitives underlying shadcn components
- **Tailwind CSS** - Styling with CSS variables for theming
- **next-themes** - Dark/light mode theming
- **Framer Motion** - Animations
- **Vitest + Testing Library** - Testing framework

## TypeScript Configuration

- Strict mode enabled with `noUncheckedIndexedAccess` - always check array/object access can be undefined
- Path alias: `@/*` maps to project root

## Testing

Tests are located in `__tests__/` directories alongside components. The test setup (`vitest.setup.ts`) mocks:
- HTMLMediaElement methods (play, pause, load)
- AudioContext for bass boost
- Fullscreen API
- URL.createObjectURL/revokeObjectURL
- fetch, ResizeObserver, IntersectionObserver

## Environment Variables

Required for YouTube integration:
- `YOUTUBE_API_KEY` - YouTube Data API v3 key
