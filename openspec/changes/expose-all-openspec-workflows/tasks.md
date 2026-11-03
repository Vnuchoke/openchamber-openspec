# Tasks

Only implementation work is tracked below; generating these artifacts completes none of it.
The user approved `test/panel.test.mjs`'s fake SDK host as the sole new-test seam, and an
`OPENSPEC_TEST_BROWSER` selector in that same fixture. Do not add another test file/helper, service
route, CLI call, dependency or manifest permission. Preserve the existing goal and unrelated changes.
For each behavior change, first run its test and observe the expected failure, implement the minimum
fix, rerun it, then tidy without changing behavior. Name new menu tests with the `workflow menu`
prefix. Rebuild before browser tests; do not pass test flags through `npm test`.

## 1. Global workflow access

- [x] 1.1 At the existing panel/fake-host seam, add failing `workflow menu global` cases for the six
  exact global label/skill mappings in the delta spec, opening/dismissal without side effects,
  fresh-chat and existing-draft replacement, known directory without a resolved OpenSpec scope,
  no-directory disabling, empty/filtered boards, and stale directory/session/planning-context menu
  openings. Implement the shared workflow identities/prompts in `src/panel/workflow.ts`, native
  menu mounting in `primary-action.ts`, board integration and controller composition with opening
  context guards. Propose/New/FF must not target an existing card; Bulk archive must invoke its own
  skill rather than `archiveAllPrompt`. Assert one compose request, no send/session/mutation or
  additional read requests, no automatic init, and no retry/fallback on compose rejection or late
  replies. Document the six global actions, all-twelve skill delivery and agent-allowlist limitation
  in README in this slice. Verify with `npm run build` and
  `node --test --test-name-pattern='workflow menu global' test/panel.test.mjs`.

## 2. Named change workflow access

- [x] 2.1 At the same panel/fake-host seam, add failing `workflow menu change` cases covering all
  seven change-menu mappings on both card and detail; each must name the displayed change and use
  its exact skill in Planning, Ready, In Progress and Complete. Include Ready with an unfinished
  non-apply-required artifact, custom/skipped artifacts, target removal, detail-change replacement,
  stale session/planning-target openings, and a stage-only update that must remain valid. Wire the
  shared native menu through `board-view.ts` and `detail-view.ts`, and route named workflows before
  stage selection in the controller. Preserve the original opening target instead of retargeting
  through mutable selected state; disable unavailable changes. Continue requests at most one
  artifact, Update does not implement, Sync does not archive, Verify remains diagnostic and named
  Apply only composes in the current chat. Pin the absence of extra reads, sends, mutations and
  retries, including pending-compose success/failure after context replacement. Document contextual
  actions and their workflow-owned prerequisites in README. Verify with `npm run build` and
  `node --test --test-name-pattern='workflow menu change' test/panel.test.mjs`.

## 3. Canonical quick actions and retained shortcuts

- [x] 3.1 At the same panel/fake-host seam, replace the obsolete Propose assertions with failing
  `workflow menu quick` cases for Planning's `Continue artifacts` on board and detail. Pin the exact
  Continue skill, existing-change target, verbatim/missing goal handling and at-most-one-artifact
  instruction, without new-change creation, automatic goal writes or implementation. Rename the
  direct board button to `Create scaffold…` and update existing creation/header assertions, keeping
  its dialog validation, create request and uncertain-outcome behavior. Preserve quick Explore's
  Planning-only guard, quick Verify/Archive in Complete, Ready/Progress's Apply destination menu,
  the shared normal/worktree Apply prompt and the confirmed archive-all-completed launch. Update
  every affected caller/label assertion rather than retaining conflicting old Propose semantics.
  The user additionally approved updating the existing selectors and prompt expectation in
  `test/integration.test.mjs` only, without adding tests or changing its CLI behavior.
  In this slice, document the interaction change and the distinctions New versus Create scaffold…,
  Continue versus Apply, and Bulk archive versus archive all in README. Verify `npm run build`,
  `node --test --test-name-pattern='workflow menu quick' test/panel.test.mjs` and the full
  `node --test test/panel.test.mjs` regression suite.

## 4. Keyboard, layout and approved browser matrix

- [x] 4.1 At the same panel/fake-host seam, add `workflow menu accessibility` cases for Enter/Space
  opening, navigation, selection, Escape dismissal and focus restoration on global/card/detail
  menus. Test both themes at 320px and 1076px, all menu entries' reachability, no horizontal page
  overflow, and retained search/detail shells, caret, focus and scroll during ordinary refreshes
  and theme changes. Use these cases to drive only necessary changes to native-menu wiring and
  `panel/index.html`; retain current footer spacing and handle disposal. In the existing fixture,
  the user also approved the minimal `src/panel/document-view.ts` presentation fix for the reproduced
  Refresh scroll collapse, retaining the old render only while loading without changing read caching.
  add the approved `OPENSPEC_TEST_BROWSER` choice of chromium/firefox/webkit with Chromium default
  and explicit rejection of any other value before launch; add no new helper, file or package
  script. Document exact developer commands and their panel-only cross-engine scope in README.
  Verify `npm run build`, the focused accessibility cases, then the full panel suite with the
  selector unset, `OPENSPEC_TEST_BROWSER=firefox` and `OPENSPEC_TEST_BROWSER=webkit`. Verify that an
  unsupported selector fails as expected, not by missing dependencies or silently using Chromium.
  Obtain approval before installing dependencies or browser binaries if missing.

## 5. Integrated acceptance and installable bundle

- [x] 5.1 Run `npm run check` and both additional full panel runs:
  `OPENSPEC_TEST_BROWSER=firefox node --test test/panel.test.mjs` and
  `OPENSPEC_TEST_BROWSER=webkit node --test test/panel.test.mjs`. Inspect actual exit status and
  output; report each engine separately and do not claim other browser suites ran cross-engine.
  Confirm the final diff stays within the design's user-approved existing UI implementation targets,
  leaves manifest permissions/private protocol/stage derivation untouched, and includes the rebuilt
  installable panel bundle. Run available crapper/dryer/mutator checks under project rules or name
  the unavailable checks without installing them. After authorized extension activation using
  AGENTS.md's Disable/Enable procedure, perform the live-host panel/page check using the user's
  approved authenticated Chrome/browser MCP exception (isolated Playwright is blocked by host
  authentication; do not extract credentials or replace a pre-existing nonempty draft):
  prepare global and contextual prompts, check canonical quick labels, keyboard/narrow layout and
  cancelled archive confirmation. Do not create a real scaffold, session or worktree without
  separate permission. Report any installation, activation or live-host blocker rather than mark
  unperformed checks complete. This broad integration task adds no separate test seam or new tests.

## 6. Sentence-case labels and outcome descriptions

- [x] 6.1 At the existing panel fake-host seam, first demonstrate failing label and hover/focus
  description tests. Normalize extension-owned action, navigation, retry and dialog button labels
  to sentence case without changing IDs, accessible names or workflow routing. Add small local
  tooltip support using the installed SDK controls, with hover/focus visibility, aria-describedby,
  Escape/activation dismissal, usable placement at 320px in both themes and owner cleanup.
  Update stage-dependent descriptions; do not retain descriptions on hidden/disabled/removed controls.
  Explain draft preparation versus direct scaffold creation and confirmed session/worktree launches.
  Preserve Continue/Apply, New change/Create scaffold and Bulk archive/Archive all distinctions.
  Adapt affected existing selectors and README. Verify focused tests and full panel regressions;
  task 5 acceptance must be repeated after this slice, including both themes and live tooltips.

## 7. Exclusive Workflows descriptions

- [x] 7.1 Reproduce the trigger-tooltip overlap and missing per-entry descriptions with failing
  `workflow menu descriptions exclusive` cases in existing `test/panel.test.mjs` before changing
  runtime. Suppress all ordinary descriptions while any Workflows list is visible. Add short outcome
  descriptions to the existing workflow registries and render the active entry's description inline
  on hover or keyboard navigation, retaining accessible names, native focus/selection and original
  dispatch guards. Handle SDK repaint, dismissal, context replacement and disposal without stale
  descriptions. Verify all six global and seven change entries on board/card/detail, both themes at
  320px and desktop widths, native scroll reachability, no overlap, unchanged side effects and
  restored ordinary tooltips after closing. No new files, dependencies, SDK changes or test seams.
- [x] 7.2 Independently inspect the final diff; run the focused regressions, `npm run check`, full
  Firefox/WebKit panel suites, strict OpenSpec validation and `git diff --check`. Repeat authorized
  live checks of opening, hover/keyboard descriptions, dismissal and focus restoration without
  creating real changes/sessions/worktrees or altering existing nonempty drafts. Record actual
  outcomes and unavailable checks. Preserve unrelated worktree changes, including `mise.toml`.

## Task 7 acceptance (2026-11-03)

- RED: the two initial regressions failed before runtime changes: open-trigger tooltip remained
  visible and workflow entries had no description (`/tmp/opencode/workflow-exclusive-red.log`).
- Parent build and focused exclusive regressions: 3/3, exit 0; independent runtime review approved.
- `mise exec -- npm run check`: Node 22.23.4, exit 0, 191/191 tests. Full panel suites: Chromium
  127/127 within check, Firefox 127/127, WebKit 127/127, each exit 0. Logs in `/tmp/opencode/`:
  `workflow-exclusive-final-check.log`, `workflow-exclusive-final-firefox.log`,
  `workflow-exclusive-final-webkit.log`.
- Strict OpenSpec validation and `git diff --check`: exit 0. Manifest, dependency files, service,
  protocol and stage model were not changed by task 7; no installations or configuration changes.
- Live authenticated Chrome checks after OpenSpec Disable/Enable confirmed Enabled, suppression
  of trigger/unrelated tooltips while the list remained open, pointer/keyboard entry descriptions,
  Home/End/Arrow navigation, Escape/focus restoration and ordinary tooltips after dismissal.
  Board/card/detail, page and 491px rail, dark/light themes were inspected; System mode restored.
  No real changes, sessions or worktrees were created and composer drafts were untouched.
- DOM integration remains specific to installed SDK 1.24.2. Screen-reader speech was not tested;
  accessible-name/description associations were tested. crapper/dryer/mutator remain unavailable.

## Previous verified acceptance (2026-11-03, before task 7)

- `mise exec -- npm run check`: exit 0, 188/188 tests; includes lint, formatting, typecheck and build.
- Full panel suite: Chromium 124/124 (within check), Firefox 124/124 and WebKit 124/124, each exit 0.
  Final logs: `/tmp/opencode/final-ui-check.log`, `final-ui-firefox.log`, `final-ui-webkit.log`.
- `openspec validate expose-all-openspec-workflows --strict` and `git diff --check`: exit 0.
- Final runtime review approved. Authorized live Chrome iframe checks confirmed Enabled after
  Disable/Enable, sentence-case board/card/detail controls, hover/focus descriptions, keyboard menus
  and Escape/focus restoration, canceled Archive all and both themes in a 324px rail and page view.
  Onboard and contextual Verify prepared unsent drafts; only those exact test drafts were cleared.
  The initial empty composer and System theme were restored; no real scaffold/session/worktree was
  created. Isolated Playwright remains host-authentication-blocked; the approved Chrome exception
  was used. Browser screenshot scrolling can dismiss a tooltip, so text checks used iframe locators.
- `crapper`, `dryer` and `mutator` are unavailable; no installations or claims of those checks.
