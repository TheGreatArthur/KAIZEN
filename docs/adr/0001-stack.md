# 0001. Next.js + TypeScript + Tailwind CSS, no backend for v1
Date: 2026-10-26
Status: Accepted

## Context
Kaizen is a Japanese writing trainer. The first version covers the home page and the hiragana
section (reading quiz and calligraphy). Content is static, and the app must later grow into
katakana, kanji, lessons, user accounts and server-side progress.

## Decision
- Next.js (App Router) with TypeScript in strict mode and Tailwind CSS v4.
- Every page is statically prerendered and the exercises are client components.
- No backend for v1. Progress lives in `localStorage` behind repository interfaces (see ADR 0002).
- Vitest for unit tests of the domain, services and repositories.

## Alternatives considered
- **Vite + React SPA**: simpler, but no routing conventions, no SSR/SSG, and an API layer would have to be added later anyway.
- **Remix / React Router 7**: a good fit for forms and data loading, but Next.js has a larger ecosystem and simpler Vercel deployment.
- **Backend from day one (Supabase)**: premature for static content, and it would slow down iteration on the exercises.

## Consequences
- Pros: static hosting, fast pages, and a smooth path to Route Handlers / Server Actions once a database exists.
- Cons: progress is device-local until accounts exist.
- Trade-off: a few client components (`"use client"`) are needed because the exercises are highly interactive.
