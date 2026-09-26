# MeinDocs

MeinDocs is a local-first document-management app built with TypeScript and Bun
workspaces. Documents stay on the user's phone; the Fastify API is a supporting
service. This repository contains an interactive static prototype with Manrope, NativeWind,
React Native Reusables primitives, and a health endpoint. See [the architecture](docs/architecture.md) for the
storage boundaries and planned responsibilities.

## Repository structure

```text
meindocs/
├── apps/
│   ├── mobile/          # @meindocs/mobile — Expo, React Native, Expo Router
│   │   ├── src/         # UI primitives, app components, styling helpers
│   │   └── app/         # Five tabs and six root stack routes
│   └── api/             # @meindocs/api — Fastify on Bun
│       └── src/         # app.ts, server.ts, app.test.ts
├── packages/
│   ├── database/src/  # @meindocs/database — SQLite + Drizzle schema, client, repositories
│   ├── domain/src/      # @meindocs/domain — basic enums
│   ├── schemas/src/     # @meindocs/schemas — Zod contracts
│   ├── config/src/      # @meindocs/config — reserved configuration module
│   └── ui/src/          # @meindocs/ui — colors, spacing, radius, typography
├── docs/
│   └── architecture.md
├── .fallowrc.json
├── .gitignore
├── biome.json
├── bun.lock
├── package.json
├── tsconfig.base.json
└── README.md
```

## Prerequisites

- Bun 1.3.14 or newer (1.3.14 is the pinned bootstrap version).
- Node.js 24.3+ on the 24.x LTS line for Expo's ecosystem tooling (tested with
  24.11.1). The API runs
  on Bun, and the mobile development command also launches Expo using Bun.
- A compatible Expo Go client on a phone, or an iOS simulator / Android emulator
  with the corresponding native development tools installed.

Bun is the only package manager used here. Run commands from the repository root.

## Install and develop

```sh
bun install
bun run dev:mobile
```

Expo starts Metro with interactive terminal controls. Press `i` to open the iOS
simulator, or scan the QR code with your iPhone camera to open Expo Go. To start
Metro and launch the iOS simulator together, run `bun run dev:ios` (requires
Xcode and an installed iOS simulator). This command uses localhost to avoid LAN
routing issues with VPNs or managed network profiles. For physical devices, use
`bun run dev:mobile` instead, with your phone and Mac on the same network.
If outbound Expo requests are blocked and Expo Go is already installed in the
simulator, use `EXPO_OFFLINE=1 bun run dev:ios`. Expo treats `--offline` and the script’s
`--localhost` flag as mutually exclusive, so use the environment variable here.

The iOS command sets `REACT_NATIVE_PACKAGER_HOSTNAME=localhost` so Expo advertises
`localhost` instead of forcing `127.0.0.1`. This lets the simulator resolve the
IPv6 loopback address when Bun binds Metro to `::1` on this Mac.

The root command runs directly in the mobile workspace so Expo retains access
to the terminal. The app has Home, Documents, Tasks, Tax, and More tabs, with stack routes for
Add Document, Processing, Document Detail, Create Reminder, Receipt Detail, and
Settings. Screens use preview data; document workflows are not implemented.

In a separate terminal:

```sh
bun run dev:api
```

The API uses `bun --watch` and listens on `http://127.0.0.1:3000` by default.
Set `PORT` and/or `HOST` in the shell to override these values.

```sh
curl http://127.0.0.1:3000/health
# {"status":"ok"}
```

## Local database

`@meindocs/database` defines the local SQLite metadata layer with Drizzle ORM.
The application client uses Bun's native `bun:sqlite`; Drizzle Kit is used only
for schema generation and migrations.

```sh
bun run db:generate # Generate a migration from the TypeScript schema
bun run db:migrate  # Apply migrations to packages/database/data/meindocs.sqlite
bun run db:push     # Push the schema directly during local prototyping
```

The database stores document metadata and relationships. Actual document files
remain outside SQLite and will later live in the encrypted local file vault.

Repository contracts live in `packages/domain/src/repositories.ts`. The Bun
implementation is in `packages/database/src/repositories.ts`, with separate
repositories for documents, reminders, and document actions. The mobile preview
uses an in-memory adapter with the same repository-shaped boundary because Expo
cannot import Bun's `bun:sqlite` module; screens do not depend on either adapter.

SQLite is file-based, so Colima or Docker is not required for this local database.
If a server database is introduced later for API-only concerns, it can be added
without changing the screen or repository contracts.

## Checks

```sh
bun run format     # Format supported source/config files with Biome
bun run format:check # Check formatting without changing files
bun run typecheck  # All seven workspaces; no emitted JavaScript
bun test           # API health contract test using Bun's test runner
bun run test       # Equivalent root test script
bun run check:code # Fallow code analysis
```

Fallow treats the shared packages as intentional public APIs so tokens and
domain enums can be defined before feature code consumes them. API server entry
points and the Babel config are declared explicitly; Expo Router entries are
detected by Fallow. Reanimated, Worklets, CSS Interop, and the JSX Babel plugin are excluded from
unused-dependency findings because NativeWind and Expo consume them through
native peers, generated imports, and Babel tooling. They must remain installed.

Shared packages expose `src/index.ts` directly and use `workspace:*` for local
dependencies. There is no separate build system or package compilation step.

## Formatting and styling conventions

Biome is pinned at the repository root. It formats JavaScript, TypeScript, JSX,
TSX, JSON, and CSS with two-space indentation and single-quoted JavaScript
strings. It respects `.gitignore` and understands Tailwind directives. Markdown
is edited manually. Biome linting and import assists are disabled; use TypeScript
and Fallow for the existing code checks.

For format-on-save, install your editor's Biome extension and choose Biome as
its formatter for supported file types. The repository configuration supplies
the formatting rules; no editor-specific files are required.

`packages/ui` owns the tokens. The Tailwind configuration maps them to semantic
utilities; `src/lib/utils.ts` also registers named spacing tokens with
`tailwind-merge` so overrides such as `p-md` followed by `p-lg` work correctly.
The app currently uses a light palette. Reusables components use semantic token
classes, not generated literal OKLCH color utilities. Review future generated
components before accepting their colors or font defaults.

The Tailwind configuration is typechecked. A narrow local declaration supplies
the missing NativeWind 4.2.7 preset type; remove it if a later release fixes the
upstream declaration.

Bun uses isolated workspace dependencies. The mobile app therefore declares
`react-native-css-interop` (NativeWind-generated JSX runtime imports) and the
Babel 7 `@babel/plugin-transform-react-jsx` plugin (referenced by NativeWind's
preset) directly. Keep the CSS Interop version aligned with NativeWind and the
plugin on Babel 7 while Expo uses Babel 7.

## Navigation

`app/_layout.tsx` owns the root stack, fonts, and native headers. The `(tabs)`
route group owns the five-tab navigator; its `index.tsx` is the only `/` route.
Tab screens use `AppHeader` and top/side safe areas. Stack screens use native
headers and side/bottom safe areas, so headers and insets are not duplicated.

Document and receipt detail routes use `[id]` segments. Reminder creation accepts
an optional `documentId` query parameter. `src/lib/route-params.ts` validates IDs
before use, and `RouteError` presents malformed-link messages.

Add Document replaces itself with Processing, which replaces itself with
Document Detail. Back therefore returns to the originating tab. Opening an
existing document, receipt, reminder, or Settings pushes a stack screen. The
root initial-route setting supplies the tabs beneath directly opened detail links.

Manual navigation checks:

- Launch Home and switch through all five tabs.
- Documents → Document Detail → Create Reminder → Back twice.
- Tasks → Create Reminder → Save reminder returns to Tasks.
- Tax → Receipt Detail → Back returns to Tax.
- More → Settings → Back returns to More.
- Home → Add Document → Processing → Document Detail → Back returns to Home.

Processing buttons are explicit previews, not actual file import or AI work.

## Static screen preview

The ten main screens share mock documents and tasks through
`apps/mobile/src/features/preview/provider.tsx`. Mock content and date/currency
helpers live in `data.ts`; reusable preview elements live in `ui.tsx`.

- Documents supports search, category filters, favorites, and review status.
- Add Document and Processing simulate an import with explicit next-step controls.
- Reminders validate a title and an ISO date, and tasks can be marked complete.
- Tax shows sample receipt totals and links to individual receipt details.
- Settings switches the interface between English and German immediately,
  including tab labels, stack titles, dates, and currency.
- Top confirmation toasts can be dismissed or disabled in Settings.
- Local, iCloud, Google Drive, and OneDrive cards offer simulated connection,
  default destination, and sample folder selection. Disconnecting the selected
  cloud provider resets the destination to local storage.

All changes are in memory and reset on reload. Connection buttons do not perform
OAuth; folder pickers do not access real directories. PDF previews are illustrative,
not actual files. Reminder alerts, Wi-Fi-only transfers, and biometric locking are
settings previews only. No notifications are scheduled, files uploaded, security
features enabled, or AI processing performed.

To review the prototype, change language in More → Settings, disable and re-enable
confirmation popups, try the cloud connection/folder controls, then favorite a
document, complete a task, create a reminder, and step through a simulated import.
