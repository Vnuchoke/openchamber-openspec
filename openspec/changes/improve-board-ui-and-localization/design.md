# Design

## Context

See [proposal.md](proposal.md) for scope. Inspection used Node 22.23.4, OpenSpec 1.16.0 and installed
SDK 1.24.2. `AGENTS.md`, `openspec/config.yaml` and the relevant main specs were read. The previous
workflow change is complete but not synchronized into main specs; current code and its delta are
the baseline for this change, not the obsolete existing-scaffold Propose behaviour in main specs.

Evidence checked directly:

- `panel/index.html`: `.board-search` uses `flex: 1; min-width: 0`, while actions are non-shrinking
  and search moves to a full row only at 560px. SDK `dist/ui/style.js` gives the input 34px padding
  on each side. `border-box` is already active. The existing Chromium panel seam reproduced:
  561px => container 22.5px/input 68px/overlap; 580px => 41.5px/68px/overlap;
  600px => 61.5px/68px/overflow. At 320, 560, 620 and 1076px no overflow was observed.
- The new clear/Escape regression also exposed a board-owned synchronization error: onChange
  assigned `searchValue` before the controller rendered, so the value-equality guard skipped
  updating SDK search props. Remove that premature assignment; controller-driven update then
  keeps SDK value and clear-control state consistent without replacing the input.
- SDK `API.md` documents full `onReady` snapshots containing `locale`, and extension-scoped
  `host.storage` without another capability. Server writes are atomic and serialize. There is no
  documented storage-change subscription to use for live synchronization between frames.
- SDK `dist/ui/theme.js` maps `--oc-info`, `--oc-info-text` and `--oc-focus`. Button variants do
  not include info. `dist/ui/search.js` supports label/placeholder updates but hardcodes Clear
  search on every paint; it exposes no clear-label property.
- SDK `dist/ui/menu.js` retains the active workflow ID when updating rows and keeps focus on its
  popup. Tabs may replace row DOM; detail currently restores focus to the selected tab, not
  necessarily the previously focused tab. Language updates must preserve the actual focused ID.
- `board-view.ts` caches notices using a signature without locale; dialogs/controller retain
  already-formatted English messages. Updating only mount-time strings would leave stale text.

## Goals / Non-Goals

The design adds presentation state only. It must not invalidate the context, change request
generations, clear resources, call loadBoard/startContent, reparse unchanged documents or treat a
language change as authorization to repeat a write. Existing mutation/reconciliation states and
workflow capture guards remain authoritative.

No i18n framework, translation service, new permission, SDK patch, polling, cross-frame event bus,
service rewrite or additional test file/helper. No translation of rendered Markdown, task text,
change goals, affected-area names, custom artifact IDs, paths, skill IDs or generated prompts.
New host session titles owned by this extension may be localized; IDs and submitted text may not.

## Decisions

### 1. One typed local catalogue, one language owner

Add `src/panel/localization.ts`: English/Russian catalogues sharing a checked key/parameter shape,
language preference validation, host-language resolution and presentation of owned messages. A
missing Russian key is a build/type error, not a silent mixed-language fallback. Use built-in
`Intl.PluralRules` for Russian count forms; do not introduce a dependency.

`mountController` owns preference, latest host locale, storage-read/write state and resolved
catalogue. Pass the current presentation through existing view/action update methods. Do not use
a process-global mutable locale or translate strings by matching their English contents.

```
host ready.locale ------> controller language state <------ host.storage
                                  |
                          resolved EN/RU catalogue
                          /        |            \
                       board     detail       dialogs
                         \         |            /
                      shared actions / descriptions

workflow IDs and prompt builders --------> existing host workflow calls (unchanged)
```

Owned durable notices/validation keep a message key and parameters until presentation, so an
existing notice changes language without rerunning its operation. Keep raw diagnostics distinct
and verbatim. Locally generated errors in client/resources/worktree retain their error class,
codes and outcome semantics while carrying a local message descriptor for display. This avoids
misclassifying a raw CLI/SDK message merely because it resembles an English catalogue entry.
Transient toasts use the resolved language when sent; already displayed host toasts have no
extension update API and remain unchanged.

Alternative rejected: updating only common buttons or remounting the controller on language
changes. Both are shorter initially, but leave mixed-language errors or destroy retained state.

### 2. Explicit storage state, no automatic write retry

The extension-wide key is `ui.language`, storing exactly `auto`, `en` or `ru`; it is not project
specific. Missing storage means auto. `null`, unknown strings and non-string values are invalid:
show a localized preference warning, use auto for this mount and do not silently repair storage.
Read failure does the same with an accurate read-failure warning; the board stays usable.

Mount one SDK non-searchable select in a compact persistent language row above the board/detail
shells, not inside the board shell that is hidden in detail. Caption: Language / Язык. Options:
Like OpenChamber / Как в OpenChamber, English, Русский. It remains available without a project or
after board failure. Its root and trigger stay mounted. No redundant picker inside modal dialogs.

Read storage once per controller mount. Until the read settles only the picker is unavailable;
render the rest using auto and the latest host locale. The picker cannot race a late initial get.
Afterwards permit one set at a time. Keep its trigger focusable, mark it aria-disabled/busy and
guard further selections while saving rather than blurring the focused trigger with native
disabled. Apply a new preference only after set succeeds; on rejection keep the old preference
and language, restore the visible option and show a localized warning. No automatic retries or
queued writes. Selecting the current committed option does not write. Ignore late results after
dispose and dispose the select and listeners normally.

Auto resolves a case-insensitive `ru` language subtag, including `ru-RU`, to Russian; English tags
and all unsupported/malformed tags resolve to English. Explicit en/ru ignores subsequent host
locale changes. Update `document.documentElement.lang` to en/ru. A new mount reads the latest saved
preference; already-open frames do not synchronize. Concurrent frames use the server's write
order, not a promise of global single-writer behaviour.

Alternative rejected: optimistic apply plus rollback and last-selection-wins queuing. It adds
ordering machinery without a requirement for simultaneous preference writes.

### 3. Update presentation, not view identity or domain state

Use SDK handle updates for labels, placeholders, badges, progress and menus. Preserve search input
node/value/selection, dialog inputs/validation/uncertain-write attempt, selected change/artifact,
expanded documents, board/detail/document scroll and text selection. Avoid document rendering when
only locale changes. Replace English-text selectors in controller focus restoration with stable
owned elements/selectors; changing aria labels must not break Back or post-delete focus.

Include locale in presentation cache signatures where necessary, but update existing notice
controls instead of disposing a focused retry button. For SDK tab repaints remember and restore
the actual focused artifact ID, including a focused nonselected tab. Open menus keep their active
workflow ID, popup focus and originally captured routing context through language/theme updates.
Refresh inline descriptions against current localized registry text rather than stale closures.
An external host-locale update while a modal is open must update its existing fields and messages
without closing it, losing draft values, changing validation state or dispatching requests.

Own strings include stages, standard artifact display names, readiness, loading/empty/error
messages, all dialogs and validation, retry/help/copy/delete controls, tooltips, inline workflow
descriptions, action destinations, counters, toasts and locally generated diagnostics. Raw service
and CLI diagnostic payloads, upstream SDK errors and document source remain verbatim. Standard
artifact display names translate; their IDs and all custom names remain untouched. English
progress stays X of Y; Russian progress uses X из Y with correct noun forms. Prepared Apply
progress stays English and byte-for-byte unchanged along with all other workflow prompt text.

The ordinary tooltip helper still shows only on owner hover and hides immediately on exit,
including movement onto its rectangle. Focus alone never shows it. A translated visible tooltip
may dismiss on update as it does today; subsequent hover shows current text. Inline descriptions
retain mouse/keyboard activation, and open Workflows still suppress ordinary tooltips.

### 4. Narrow, named SDK workarounds

Search clear-label workaround: after every owned search handle update, set the existing clear
button's accessible label to Clear search / Очистить поиск. Centralize this in the board's search
update path so value/locale/theme/clear repaints cannot restore English. The inspected SDK has no
independent search repaint; do not add a MutationObserver unless a regression proves it necessary.
Do not patch node_modules or replace the SDK search field.

Workflows uses existing `.workflow-menu` roots and a scoped trigger selector; exclude popup rows
and Apply destination triggers. Use an info-tinted background/border and `--oc-info-text`, with a
stronger tint on hover, an opaque `--oc-info-text` keyboard outline and distinct disabled styling.
The SDK's usual focus shadow remains; do not use its possibly translucent `--oc-focus` token as
the additional high-contrast outline (the live light theme supplies `#b3501755`).
Keep SDK button size, native menu operation and callback capture. Check text contrast >=4.5:1 and
focus/control boundaries >=3:1 in the two supported theme fixtures and live active theme. Colours
follow host tokens: arbitrary themes can remap info and primary to similar hues, so do not promise
an immutable blue or universal distinctness across every user-supplied token set.

Host toast Copy/OK, extension-manager strings and other host UI stay on the host language. This
is an upstream ownership boundary, not a reason to modify SDK/host permissions.

### 5. Fix flexible sizing rather than mask the symptom

Give the search flex item a usable basis/minimum (approximately 12rem, capped by available width)
and let toolbar/actions wrap before shrinking below it. Keep descendants constrained to the
available width and preserve space for both icons, editable text and keyboard focus outline.
Do not hardcode the measured 68px as a useful input width or just move the breakpoint. The new
language row wraps independently so it cannot steal the search's remaining width. No clipping,
overflow hidden, fixed toolbar height, new layout library or hidden actions.

Check real bounding boxes at 320, 560, 561, 580, 600 and 1076 CSS pixels in en/ru and light/dark,
with empty/nonempty search; test clear and Escape preserve existing filtering semantics. Include
long Russian action labels, long change IDs and an open workflow menu in the narrow check.

## Files and verification contract

Expected owned source files (more than eight): `localization.ts` (new), `controller.ts`,
`board-view.ts`, `detail-view.ts`, `primary-action.ts`, presentation parts of `workflow.ts`,
`help-button.ts`, `document-view.ts`, `tasks-view.ts`, `create-dialog.ts`, `delete-dialog.ts`,
`archive-dialog.ts`, and local error sources in `client.ts`, `resources.ts`, `worktree.ts`.
Also `panel/index.html`, generated `panel/main.js`, README and existing tests. Do not change
prompt builders, `archive-prompt.ts`, area names, service logic, package files or generated skills.

The owner already specified the `test/panel.test.mjs` fake-host seam. Extend that fixture with
SDK storage replies, held/rejected reads/writes, shared preference across iframe remounts and full
ready snapshots with controllable locale. Exercise counts 0/1/2/5/11/21/22 through rendered UI.
No new test helper/file. Existing English integration selectors may change only for the renamed
Planning action; prompt/request payload expectations must not be relaxed.

Every implementation task uses red -> minimal green -> cleanup -> focused recheck before its
checkbox is marked. Baseline root-cause reproduction already exists; save new failing test output
before runtime edits. Final commands from the repository root, using Node 22.13+:

1. `mise exec -- npm run check`
2. `OPENSPEC_TEST_BROWSER=firefox mise exec -- node --test test/panel.test.mjs`
3. `OPENSPEC_TEST_BROWSER=webkit mise exec -- node --test test/panel.test.mjs`
4. `openspec validate improve-board-ui-and-localization --strict` and `git diff --check`

The full check includes Chromium panel tests plus lint/format/typecheck/model/resource/service/
integration/build checks. Inspect actual exit status, not just a log tail. Final browser suites
must run after the final source/bundle edits. Any discovered required test outside the agreed seam
needs approval before adding it. `simple`, `tdd`, `writing-for-agents` and
`agent-memory-workflow` are not available in this session's skill list; follow their relevant
project constraints directly without claiming those skills ran. crapper/dryer/mutator were
unavailable previously; recheck availability, report omissions and do not install tooling.

## Risks / Trade-offs

- Existing long-lived English errors or SDK repaints can leave mixed language -> typed owned
  message descriptors, boundary inventory and explicit failure-path UI assertions, not snapshots
  of a few labels. This is the largest integration risk.
- Localizing aria labels can break controller focus selectors -> stable owned references/selectors
  plus keyboard Back/delete regressions in both languages.
- SDK row replacement can disturb focus/scroll -> retain actual focused/active IDs and verify open
  menus, nonselected tabs and document selection separately.
- Broad file coverage increases review cost -> bounded vertical tasks; no unrelated abstractions
  or refactors. The runtime work is one release, not several independently complete localizations.
- No guaranteed host availability for live checks -> test fixture is deterministic; separately
  report the exact live-host blocker rather than claim the UI was verified.

## Migration Plan

No data migration. Existing installs default to auto and can select English to retain prior
presentation. Publish neither a release nor a push as part of this work. After build, follow
AGENTS.md: Disable/Enable the folder extension, confirm Enabled and inspect the running board,
detail and non-submitted dialogs. Verify language round-trip, resize, both themes, search/clear,
tooltip behaviour, menu keyboard navigation and retained state. Do not create real sessions,
changes or worktrees, overwrite drafts, or read credentials. The previously authorized authenticated
Chrome route was an exception for prior checks, not fresh permission; if the prescribed isolated
browser is locked, report it and ask before changing the check method.

Owner-approved live-check exception (2026-11-03): the isolated browser showed Unlock OpenChamber
at the reachable `http://localhost:5096`; the documented 57123 endpoint timed out. The owner
explicitly authorized the already authenticated Chrome tab through Browser MCP for this change,
without credential/cookie access or changes/session/worktree creation. Use that route for the
final live acceptance, not repeated unauthenticated attempts.

Rollback restores prior bundles/source; the inert `ui.language` value can remain without affecting
old code or planning data. Do not uninstall merely to clear storage. Future sync/archive must apply
`expose-all-openspec-workflows` before this change and retain this change's localized presentation
contract. Neither sync nor archive is authorized by this implementation request.
