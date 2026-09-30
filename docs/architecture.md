# MeinDocs architecture

MeinDocs is local-first. The mobile app is the system of record for document files and user workflows. SQLite/Drizzle stores structured metadata locally; the encrypted file vault stores document binaries. The Fastify API is a supporting service for analysis and tax contracts, never the primary document store.

## Workspace boundaries

- `apps/mobile` owns Expo Router screens, local file handling, OCR orchestration, repositories/adapters, security, backups, exports, and user-facing error handling.
- `apps/api` runs on Bun with Fastify. It validates requests with shared schemas and returns analysis metadata. OCR text is request-scoped and is not retained in the API analysis store.
- `packages/domain` owns framework-independent enums, interfaces, repository contracts, use-case services, export helpers, backup contracts, and the shared error model.
- `packages/schemas` owns runtime Zod validation for API and workflow payloads.
- `packages/config` is the home for shared configuration constants; it is intentionally minimal until more runtime configuration is needed.
- `packages/ui` owns design tokens only: colors, spacing, radius, and Manrope typography.
- `packages/database` owns the local Bun SQLite/Drizzle schema, migrations, indexes, and repository implementations. It is not imported by the Expo runtime because Bun's SQLite client is not available there.

## Data ownership

Document binaries never belong in SQLite or the API. Mobile imports copy files into an app-controlled directory, hash them with SHA-256, create thumbnails where possible, and keep file references in metadata. SQLite may store OCR text and summaries as local searchable metadata; those values remain on the device. The API receives OCR text for analysis and returns structured data, but does not store OCR text or document content in its in-memory analysis map.

The mobile preview adapter currently supplies sample data for the screens while the repository contracts and Bun SQLite implementations are exercised independently. Connecting the Expo runtime to a native SQLite adapter is the next storage integration milestone; until then, local file handling is already real and local-only.

## Local workflows

The processing pipeline is import → save locally → OCR on device where supported → optional API analysis → draft review. Reminders, cases, people, organisations, tax metadata, local FTS5 search, deterministic document generation, encrypted Google Drive backup, export, sharing, onboarding, biometrics, and app locking are implemented as local-first features. Google Drive is an optional encrypted backup target and does not participate in real-time sync.

## Security and reliability

Backup keys are generated/stored through SecureStore/Keychain-backed platform storage. They are never written to SQLite, AsyncStorage, source code, environment variables, or Drive. User-facing failures use the shared categorized error model; development logs redact OCR text, document contents, credentials, keys, tokens, and identity values. Retryable AI, OCR, and backup operations have bounded retry behavior, and navigation is protected by error boundaries.

## Database safety

Migrations are generated from `packages/database/src/schema.ts` and applied in order. They add indexes without destructive table rewrites. The schema includes indexes for document recency/status/type, actions, reminder/payment due dates, tax years, tags, people, organisations, cases, and relationship lookup columns. Run `bun run db:generate` when changing the schema and review the generated SQL before applying it.
