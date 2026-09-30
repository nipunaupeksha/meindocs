# MeinDocs

MeinDocs is a local-first document-management app built with TypeScript, Bun workspaces, Expo, Fastify, SQLite, and Drizzle. Documents and document files remain on the user's device. The API is a supporting analysis service, while encrypted Google Drive backup is optional and user-controlled.

## Repository structure

```text
meindocs/
├── apps/mobile/        # Expo Router mobile app and local workflows
├── apps/api/           # Fastify API running directly on Bun
├── packages/domain/    # domain types, repository contracts, use cases, errors
├── packages/schemas/   # Zod runtime validation
├── packages/config/    # shared configuration constants
├── packages/database/  # Bun SQLite + Drizzle schema, migrations, repositories
├── packages/ui/        # design tokens
├── docs/architecture.md
├── package.json
├── tsconfig.base.json
├── biome.json
└── bun.lock
```

## Prerequisites

- Bun 1.3.14 or newer
- Xcode and an iOS simulator, or an Android emulator, for native mobile testing
- Expo Go for basic flows, or an Expo development build for biometrics, OCR, SecureStore, and sharing

Install dependencies from the repository root:

```sh
bun install
```

## Development commands

```sh
bun run dev:mobile   # Expo Metro
bun run dev:ios      # Metro plus iOS simulator on localhost
bun run dev:api      # Fastify with bun --watch
bun run dev:welcome  # Expo Metro with onboarding shown again
bun run dev:welcome:ios # Expo plus iOS simulator with onboarding shown again
```

Use `bun run dev:welcome` whenever you want to review the welcome pages again. Use
`bun run dev:welcome:ios` to start them directly in the iOS simulator. This mode
clears the Metro cache and uses a session-only preview flag; it does not delete
your saved onboarding, biometric, backup, or local data settings.

The API listens on `http://127.0.0.1:3000` by default. Set `PORT`, `HOST`, or `EXPO_PUBLIC_API_URL` when needed.

## Validation commands

```sh
bun run typecheck
bun test
bun run format:check
bun run check:code
bunx expo-doctor
```

`bun test` covers API contracts, database repositories/search, domain services, export helpers, dashboard prioritisation, security state, and failure paths. `bun run check:code` runs Fallow dead-code and duplication checks. Biome is the formatter; no separate ESLint configuration is present.

Expo Doctor passes SDK compatibility and package-directory checks. With Bun's isolated workspace linker, Expo Doctor may still report duplicate physical links for Expo peer packages even though all resolved versions match the SDK; keep the isolated linker for Bun test/workspace resolution and verify native builds with a clean development build.

## Current V1 capabilities

- Five-tab Expo Router shell: Home, Documents, Tasks, Tax, and More.
- Local PDF/image import, camera capture, SHA-256 duplicate detection, thumbnails, and OCR processing.
- Repository contracts for documents, reminders, actions, cases, people, and organisations, with Bun SQLite/Drizzle implementations.
- SQLite FTS5 document search with metadata, OCR, tags, tax, relationship, and deadline filters.
- Local reminders and notifications, case management, tax metadata, deterministic letter generation, tax export, ZIP sharing, and encrypted Google Drive backup.
- Onboarding, optional biometrics, app lock, SecureStore-backed keys, safe error messages, redacted development logging, and navigation error boundaries.

The mobile preview provider still uses an in-memory adapter for the Expo UI because the current SQLite implementation depends on Bun's native SQLite runtime. Wiring the repository interface to a native SQLite driver is the next storage milestone; this does not move files or OCR content to the backend.

## Database and migrations

```sh
bun run db:generate
bun run db:migrate
bun run db:push
```

SQLite stores structured metadata and relationships only. Document binaries stay in the local vault. Migrations are append-only and should be reviewed before applying them to an existing database.

## API

The API validates all request/response contracts through `@meindocs/schemas`.

- `GET /health`
- `POST /v1/ai/analyze-document`
- `GET /v1/ai/analyses/:documentId`
- `GET /v1/documents/:documentId/tax`
- `PUT /v1/documents/:documentId/tax`
- `GET /v1/tax/summary?year=2026`

The analysis endpoint receives OCR text transiently and returns structured metadata. The API does not persist document files, OCR text, or full document contents.
