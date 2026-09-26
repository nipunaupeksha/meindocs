# MeinDocs architecture

MeinDocs is a local-first document-management app. Documents stay on the user's
phone, and the mobile app owns document storage and access. The backend is a
supporting service and must not become the primary document store.

Future local storage will use SQLite + Drizzle for structured metadata. Actual
document files will live in an encrypted local file vault. Neither storage layer
is implemented in this bootstrap.

The API will later handle AI analysis, OAuth integrations, accounts,
subscriptions, and optional backup/sync support. Backup and sync must preserve
the phone's role as the primary document store; they are optional capabilities.

## Workspace responsibilities

- `apps/mobile`: Expo / React Native application with five tabs and six root stack routes.
- `apps/api`: Fastify supporting service running directly on Bun; only `/health` exists.
- `packages/domain`: framework-independent document, case, payment, and tax vocabulary.
- `packages/schemas`: shared Zod contracts for document metadata and workflow payloads.
- `packages/database`: SQLite + Drizzle schema for local structured metadata. It
  uses Bun's native SQLite client and exposes repositories for documents,
  reminders, and actions.
- `packages/config`: reserved for shared app configuration; currently empty.
- `packages/ui`: design tokens only, including Manrope typography aliases.

Shared packages expose TypeScript source through package exports. Consumers use
workspace dependencies and their own runtime or bundler, without a separate
package build step. Only dependencies currently used are wired into the apps.
The mobile app must not import API server code.

The mobile app loads Manrope and uses NativeWind to consume the shared tokens.
React Native Reusables source lives in `src/components/ui`; MeinDocs compositions
live in `src/components/app`. Components accept presentation props and callbacks,
without owning storage or navigation.

Authentication, OCR, AI, Google Drive, and product workflows remain deferred.
The navigation preview still uses sample IDs and does not import or store
documents. SQLite stores metadata only; actual files remain reserved for the
encrypted local file vault. Repository contracts live in `packages/domain`, so
the preview's in-memory adapter and the Bun SQLite adapter can be swapped without
changing screens. SQLite is a local file database and does not require Docker or
Colima.
