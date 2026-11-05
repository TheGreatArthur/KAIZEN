# 0002. Repository layer and container for future persistence
Date: 2026-10-26
Status: Accepted

## Context
We plan to add a database (characters, lessons, progress, accounts). We don't want the UI to know
where data comes from, so that switching from static files + localStorage to an API or a database
does not touch the UI.

## Decision
- Domain types (`src/domain`) have no framework dependency.
- The `CharacterRepository`, `ProgressRepository` and `PreferencesRepository` interfaces are **async** (they return `Promise`s), even though the current implementations are synchronous.
- `src/lib/container.ts` is the only place that instantiates implementations.
- UI components access data only through hooks (`useCharacters`, `useProgress`, `useSelection`). These hooks resolve the container lazily on the client, so nothing touches storage during SSR.
- Local data is scoped by an anonymous UUID (`kaizen:v1:<userId>:…`), ready to be attached to an account.
- Characters have stable ids (`hira-ka`), which will be used as primary keys.

## Alternatives considered
- **Direct `localStorage` access in components**: faster to write, but makes the migration costly and the code hard to test.
- **A state library (Zustand/Redux) with persistence**: solves UI state, not the swap of the data source.

## Consequences
- Pros: the storage is easy to swap, and repositories are tested with an in-memory store.
- Cons: some boilerplate (interfaces and hooks) for a v1 without a backend.
