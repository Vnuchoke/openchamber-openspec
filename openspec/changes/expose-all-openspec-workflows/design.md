# Design

## Context

See [proposal.md](proposal.md) for motivation and the user-approved interaction changes.
The existing controller owns context and workflow dispatch; board and detail share
`mountPrimaryAction`, but duplicate their Explore/Verify controls. `actionPrompt` currently chooses
Planning/Ready/Progress behavior before checking Verify. Merely exposing more intents or removing
stage guards would therefore misroute named workflows.

`deriveChange` computes stages from the transitive `applyRequires` set and task counts, not from
all planning artifacts or verification results. Keep that model unchanged. Its four presentation
stages cannot determine whether Continue, Update, Sync or Verify is useful.

The repository pins SDK 1.24.2. Its local `node_modules/@openchamber/sdk/API.md` was read and the
menu implementation was also checked through the sibling OpenChamber repository's matching
release commit `614d7f76e`. The sibling's current SDK 2.6.0 is not used as version-matching evidence.
SDK 1.24.2 provides `mountMenu`, retained update/dispose handles, keyboard-operated menus and
`compose({ text, mode: "replace" })`. No new SDK contract is needed. No dependencies were installed
by this planning task.

The existing `test/panel.test.mjs` fake host records compose, service and session requests and
controls context changes. Its browser launch is hard-coded to Chromium. The user approved this
single test seam and a browser selector within the same file, without a new helper or test file.

## Goals / Non-Goals

**Goals:**
- Keep workflow identity separate from stage and execution destination.
- Share workflow definitions, prompt construction and menu mounting across the board and detail.
- Preserve current unsent replacement, initial/context/explicit-refresh read scheduling, direct
  scaffold creation and the two explicitly chosen automatic-launch paths.
- Make an opened menu's original context verifiable before dispatch.

**Non-Goals:**
- No execution engine, workflow availability scanner, automatic skill installation, slash-command
  interpreter, SDK upgrade, new dependency, permission or service route.
- No new workflow stages, verification artifact support, persisted UI settings or metadata migration.
- No bulk-selection UI in the extension: the Bulk archive agent workflow owns selection and checks.
- No custom menu system, nested workflow menus, draft backup, cancellation protocol or retries.
- Do not edit or archive the separate `add-update-button-to-ready-change` or `add-verification-stage`
  scaffolds. The former overlaps this change's Update access; the latter's verification-stage idea
  is explicitly outside this change.

## Decisions

### 1. Centralize workflow identity and prompts in the existing workflow module

Extend `src/panel/workflow.ts` with explicit named workflow identities, their labels/skill names,
global-versus-change targeting and prompt construction. Use a small typed target distinction so
new-change workflows cannot accidentally accept an existing change. Reuse the same definitions for
menus on both surfaces; do not introduce a plugin registry or configuration schema.

Move stage selection to the quick-action dispatch: Planning selects Continue, Ready/Progress select
Apply, Complete selects Archive. Named menu dispatch selects its workflow first and never falls
through to a stage-dependent Apply or default Archive. Both normal Apply and `runInWorktree` must
use the same Apply prompt, preserving progress wording, verification guidance and blocker reporting.

Global prompts name a skill and ask it to establish missing input; they do not embed a selected
change, user goal invented by the extension, or filesystem path. Change prompts explicitly name the
change. Continue and Explore include the recorded goal verbatim when present, preserve current
decisions and ask for clarification when needed; composing never writes missing goals. Continue
requests at most one next artifact and no implementation. Verify is diagnostic, Update is planning
revision, and Sync is spec synchronization, without implicit Apply or Archive follow-ups.

Alternative rejected: extending `primary | verify | explore` and retaining the stage-first prompt
switch. That cannot express all twelve identities safely and repeats the current ambiguity.

### 2. Reuse native menus without changing the existing launch paths

Extend the existing `primary-action.ts` module with a small shared workflow-menu mount, using the
already-used SDK `mountMenu`. Keep view ownership and handle disposal unchanged; no new source file
or general menu framework is required.

Use a secondary, small `Workflows` trigger. On the board, place it between Refresh and archive all,
keeping archive all immediately before `Create scaffold…`. Global entries are ordered Propose
change, Explore ideas, New change, Fast-forward, Bulk archive, Onboard. Cards and detail append their
Workflows trigger after the existing quick-action group; their entries are Continue change, Apply
tasks, Update change, Sync specs, Archive change, Verify change, Explore ideas.

Keep the Planning quick Explore and Complete quick Verify. Replace Planning's primary label and
behavior with `Continue artifacts`; use sentence-case Apply/Archive/Verify/Explore quick labels. Rename
the direct board creation trigger to `Create scaffold…`, keeping its dialog behavior. Extend
`panel/index.html` layout only as needed for wrapping and reachable native popups at 320px; preserve
existing footer spacing, search/detail shells, tab identity, focus and scroll.

The follow-up UI request supersedes earlier lowercase-label decisions. All extension-owned buttons
use sentence case (Refresh, Archive all, Cancel, Create, Delete, Start archiving), preserving names,
acronyms and change IDs. SDK tabs and menu items retain their existing semantics.
SDK 1.24.2 exports no tooltip primitive and ButtonProps has no description field. A small helper
in existing `help-button.ts` attaches `role="tooltip"` and `aria-describedby` to existing buttons;
it does not wrap mounting or change callbacks. Descriptions explain outcomes, not labels. Show only
on owner-button hover, dismiss on Escape/activation/pointer exit, update with stage, and dispose
with the owning control. Use theme tokens and fixed placement clamped/flipped within the iframe.
Prefer placement above the control. Descriptions are pointer-transparent so wrapped neighboring
buttons remain clickable. The latest user request supersedes hoverable/focus-triggered ordinary
descriptions: leaving the owner button immediately dismisses its description, even when the pointer
enters that description's rectangle. Focus alone neither shows nor retains an ordinary description.
Remove obsolete description-hover geometry and focus listeners rather than introducing a mode flag.
Unchanged owner updates retain an already-hovered description across ordinary session repaints.
Escape does not consume the native dialog/menu dismissal: preserve existing overlay closing and
focus restoration, rather than adding a second-keypress requirement just for descriptions.
Describe Workflows as choosing an unsent prompt; Apply as choosing current-chat draft or explicit
worktree launch; Archive all as opening confirmation for a completed-only session launch.
Cover navigation, Help/Copy, retries and dialog buttons as well as workflow/menu triggers.
The follow-up Workflows request supersedes the earlier menuitem exclusion. Keep native SDK keyboard
navigation and focus, but decorate each workflow entry with a short outcome description from its
existing registry. Reveal only the active row's description in normal flow, not as a floating layer
over the list; preserve the item's accessible name and connect its description with aria-describedby.
Observe the mounted menu's child replacement and aria-activedescendant because SDK 1.24.2 exposes
neither description props nor open/close callbacks. Keep decoration idempotent through SDK repaints
and dispose the observer with the menu. Bound popup width before SDK placement, keep its expanded
content within the viewport, and ensure the active description remains reachable by native scrolling.
The ordinary tooltip helper must refuse display whenever a visible Workflows list exists, including
the invoking trigger or unrelated buttons. Its visible-description observer removes an existing
description on opening; dismissal restores ordinary button-hover behavior. No new tooltip manager,
SDK patch, polling, reads or workflow dispatch path is introduced.

The named Apply tasks entry always composes in the current chat. The existing Apply destination
menu alone offers Run in new worktree. Canonical Bulk archive composes its own skill prompt and
does not call `archiveAllPrompt`, auto-select completed cards, or start a session. Existing archive
all keeps its completed-only prompt, modal confirmation, session submission and uncertain-outcome
handling untouched. Onboard's prompt is not described as read-only: its agent workflow may later
perform a full change cycle after its own user questions.

Alternative rejected: twelve standalone buttons or replacing archive all with canonical Bulk
archive. The former crowds the sidebar; the latter changes an explicitly preserved user shortcut.

### 3. Bind menu selections to opening context, not mutable view state

The controller remains the only dispatcher. Capture a global opening token containing directory,
session identity and epoch, plus the resolved scope identity when present. Global actions require
a directory, not a successful list or an existing change. Thus Onboard and other global prompts
can be prepared after an uninitialized-root listing failure; the workflow, not the extension,
obtains permission for setup. A different directory, session, epoch or resolved planning identity
invalidates the old opening. With no directory, disable menu entries/trigger using the kit's existing
pattern; do not guess a context.

Change menus additionally capture their scope and change ID, and detail menus bind to the displayed
change. At selection, require that the original context and target are still current and available.
A change-stage update alone does not invalidate an explicit named workflow. Quick actions and
Apply destinations retain stage-specific applicability checks. Use the existing synchronous trigger
activation capture pattern, covering pointer clicks and native button activation by Enter/Space;
the SDK version has no menu-open callback. Store callbacks/context from the opening, not the most
recent view update, and reject stale selections rather than retargeting them.

Call `host.compose` once with replace mode and retain current success/error toast handling. Check
context before dispatch and again before feedback; do not replay on error or context changes.
Upstream SDK 1.24.2 does not provide a destination-session compare-and-set or cancellation contract
for compose. Post-await guards suppress stale feedback, not already accepted host effects. Do not
claim atomic protection across host navigation, add another round-trip, or change the host in this
task.

Alternative rejected: checking only current mutable `selectedChange` on selection or hiding actions
according to stage. Those respectively retarget an old menu and incorrectly gate named workflows.

### 4. Document skill prerequisites instead of adding discovery or fallback machinery

Use the twelve exact skill names generated by OpenSpec 1.16.0, as mapped in the delta spec. Update
README's old core-plus-Verify setup guidance to explain selecting all twelve workflows through
`openspec config profile`, choosing skills delivery and initializing/updating the target project's
OpenCode integration with the CLI's documented commands. No CLI invocation is added to the panel or
service. Installing/updating skills is not performed by the extension or by this planning task.

README must say that the active agent must expose/permit the requested skill. A prepared prompt is
not proof of availability or successful execution. Preserve skill-level questions, including root
setup, Update revisions, batch selection and archive confirmations. Do not substitute a different
workflow or invoke raw slash commands when a skill cannot be used.

Alternative rejected: adding a server-side file scan or fallback prompt. Local files cannot prove
availability in an agent's skill allowlist, and that workaround would introduce new reads and false
assurance. No new CLI fields, routes, permissions, credentials or accounts are needed.

### 5. Verify behavior at the approved panel/host seam

Extend `test/panel.test.mjs`, including updating assertions that currently pin the old four-button
header and Planning Propose semantics. Add test names beginning `workflow menu` for the new menu
scenarios so focused commands have a concrete selection. Assert exact workflow identity/target and
observable host requests rather than only prompt substrings. Check all twelve workflows, global
versus selected-change input, named stage-independent routing, skipped/custom artifacts and the
one-artifact Continue boundary. Verify unchanged drafts until selection, replace-on-selection,
fresh-chat drafts, no send/session/file mutations, no additional reads, error feedback and no retry.

Exercise stale openings after directory, planning target, session, target removal and detail-change
replacement; separately show that a stage-only update leaves named actions usable. Use the fake
host's existing deterministic pending-reply/context controls for in-flight failures. Cover keyboard
selection/dismissal, both themes and 320px/1076px widths, then rerun the existing worktree and
archive-all suites rather than adding another test seam.

Within the existing fixture only, select Chromium/Firefox/WebKit from `OPENSPEC_TEST_BROWSER`,
defaulting to Chromium and failing before launch on an unsupported value. This is a test-only
selector, not a user/runtime setting. Add no package script or helper file. Use the same panel suite
for all three engines. Other test files remain unchanged; report their actual browser coverage.

## Risks / Trade-offs

- [Existing Planning users expect a complete plan] → The user explicitly chose one-artifact Continue;
  name the interaction change in README. Global Propose/FF remain available for new changes.
- [Expanded UI scope] → The user's follow-up authorizes existing panel button owners, dialogs,
  help/document/tasks views, stylesheet, README, generated panel bundle and existing test selectors.
  New behavioral tests remain solely in `test/panel.test.mjs`; `test/integration.test.mjs` only adapts
  existing selectors/prompt expectations. No new files, test seam, dependency, service or protocol.
  Previously approved document refresh retention and planning-scope invalidation remain unchanged.
- [Menu state can repaint while open] → Capture its original context and distinguish named actions
  from stage-specific quick actions; use fake-host tests, not new data fetches, to pin this behavior.
- [A skill exists on disk but is unavailable to the active agent] → Document delivery/allowlist
  prerequisites and the absence of an availability guarantee; add no detection or fallback layer.
- [An already accepted compose request races navigation] → Retain pre-dispatch checks and suppress
  late feedback; explicitly retain the SDK's non-atomic limitation rather than claiming cancellation.
- [Dependencies/browser binaries or live host are unavailable] → Report the precise verification
  blocker and request installation/setup approval; do not install or reconfigure them automatically.

## Migration Plan

Ship one coherent UI change, without data migration or persisted state. Keep each implementation
slice usable on its own, but do not claim the full twelve-workflow goal until every slice passes.

1. Implement the TDD slices in tasks.md, preserving the private protocol and manifest permissions.
2. Run `npm run build`, then `node --test --test-name-pattern='workflow menu' test/panel.test.mjs`.
   Run `npm run check`, `OPENSPEC_TEST_BROWSER=firefox node --test test/panel.test.mjs` and
   `OPENSPEC_TEST_BROWSER=webkit node --test test/panel.test.mjs`. Unsupported engines must fail,
   not fall back to Chromium. Required installs need separate permission if not already present.
3. Follow AGENTS.md's live-host disable/enable procedure and check both extension surfaces. During
   implementation the user approved the authenticated Chrome/browser MCP as an exception to the
   original isolated-Playwright method: the latter reaches the password-protected host's unlock
   screen and this environment has no GUI for manual login. Do not read passwords/cookies. Use only
   the task's browser tab, verify iframe access, and do not replace an existing nonempty draft.
   Preparing a draft only when empty, keyboard dismissal and cancelling confirmation dialogs suffice
   for the no-write paths. Real session/worktree creation or scaffold creation needs explicit
   authorization before the live check; simulated paths remain covered by the fake host.
4. Report each engine, exit status, live-host result and available crapper/dryer/mutator checks
   separately. Rebuild installable bundles via the existing build command; do not commit, publish,
   reinstall or change external settings without the authorization required for that operation.

Rollback restores the previous extension files/bundles and reloads the extension with approval.
No change artifacts, main specs, existing sessions or worktrees are deleted as rollback. Prompts
already sent by a user or an explicitly launched workflow cannot be undone by reverting the UI.
