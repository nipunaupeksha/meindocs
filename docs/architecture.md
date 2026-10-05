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

Recurring documents are represented locally as document series. Matching uses issuer, organisation, document type, title or identifier continuity, and expected date intervals. Only safe defaults such as tags and tax classification are suggested for inheritance; amounts, invoice numbers, due dates, and reference numbers remain document-specific. Missing expected members are exposed by the local service layer without sending notifications.

Smart Views are saved filter and sort definitions evaluated against the local document search engine. They never create folders or duplicate document records. Built-in views and user-created views therefore remain current as local metadata changes.

Email and cloud import are separate from encrypted backup. Both require explicit user selection, download attachments or files into the local vault, use checksum duplicate detection, and then pass the selected files through OCR, classification, extraction, and review. Only source identifiers and timestamps are retained locally; email bodies are never imported or sent to the AI service.

Custom document metadata is represented by typed field definitions and per-document values. Definitions can be global, domain-scoped, or document-type-scoped; values are JSON-encoded in the local SQLite metadata layer and validated against their definition before saving. Common German identifiers are predefined without expanding the core `documents` table.

Document titles are generated deterministically from structured metadata. The original filename remains separate, and `titleSource` records whether a title is automatic, AI-supplied, or user-edited. Automatic regeneration is skipped once a user override exists.

## Security and reliability

Backup keys are generated/stored through SecureStore/Keychain-backed platform storage. They are never written to SQLite, AsyncStorage, source code, environment variables, or Drive. User-facing failures use the shared categorized error model; development logs redact OCR text, document contents, credentials, keys, tokens, and identity values. Retryable AI, OCR, and backup operations have bounded retry behavior, and navigation is protected by error boundaries.

## Database safety

Migrations are generated from `packages/database/src/schema.ts` and applied in order. They add indexes without destructive table rewrites. The schema includes indexes for document recency/status/type, actions, reminder/payment due dates, tax years, tags, people, organisations, cases, and relationship lookup columns. Run `bun run db:generate` when changing the schema and review the generated SQL before applying it.
