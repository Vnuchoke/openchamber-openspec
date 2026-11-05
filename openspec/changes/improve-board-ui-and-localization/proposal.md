# Proposal

## Why

At intermediate sidebar widths the search input escapes its shrinking container and overlaps
toolbar actions. Unclear Planning wording, an undifferentiated Workflows trigger and English-only
controls also make the extension harder to use; Russian text must fit rather than amplify that bug.

## What Changes

- Give search a usable minimum size and let the toolbar wrap before controls collide; keep the
  input, search icon and clear control within their container without hiding overflow.
- Rename the Planning primary action to **Continue planning / Продолжить планирование** on cards
  and detail. Preserve the existing Continue workflow and at most one next planning artifact.
- Give all Workflows triggers a shared information-colour treatment, using the SDK theme's
  blue/cyan information accent instead of primary or muted styling.
- Add a persistent **Like OpenChamber / Как в OpenChamber**, **English**, **Русский** choice.
  Automatic mode follows host locale; unsupported locales fall back to English. Translate owned
  controls, accessible names, descriptions, dialog validation, counters and feedback in place.
- Preserve IDs, user content, documents, CLI arguments and workflow prompt payloads. Raw upstream
  diagnostics and host-owned toast buttons retain their original language. Existing displayed
  host toasts are not rewritten retroactively.

## Capabilities

### New Capabilities

- `viewer-localization`: language selection and persistence, owned EN/RU presentation, fallback,
  failure handling and language updates without loss of retained interface state.

### Modified Capabilities

- `change-presentation`: non-overlapping responsive search, information-accent Workflows controls
  and locale-aware progress/copy feedback without changing counts or actions.
- `change-workflows`: Continue planning wording and localized workflow presentation, with all
  existing skill mappings, prompt content, guards and launch semantics unchanged.
- `viewer-help`: localized quickstart control and description, retaining its URL and behaviour.

## Impact

More than eight source files are involved: controller, board/detail/document/tasks views,
primary-action, workflow presentation, help and dialogs, plus local error sources where needed.
One small typed translation module, scoped panel CSS, README and the generated panel bundle are
expected. New tests belong only in the existing `test/panel.test.mjs` fake-host seam. Existing
integration assertions may need label-only updates; no new seam or test helper is planned.

SDK **1.24.2** already supplies locale, storage and information theme tokens. No SDK, dependency,
manifest, permission, CLI invocation or private-protocol changes are needed. CLI verification uses
OpenSpec **1.16.0**. The completed, unarchived `expose-all-openspec-workflows` change is the current
behavioural baseline; do not extend or rewrite it. Its delta must precede this delta during any
future spec synchronization, so obsolete Propose/Continue artifacts wording cannot win.

Consumer-visible changes are labels, colour and the saved language preference, not workflow
semantics. SDK-owned Clear search needs a narrowly scoped accessible-label decoration; host-owned
Copy/OK cannot independently follow the extension override. Document both boundaries. No immediate
cross-window synchronization, polling, new sessions/worktrees for tests, commits, push or archival
is included without separate authorization. Implementation waits for the owner's plan approval.
