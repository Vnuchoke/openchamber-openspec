# Tasks

Only implementation work is tracked below; generating these artifacts completes none of it.
The user approved `test/panel.test.mjs`'s fake SDK host as the sole new-test seam, and an
`OPENSPEC_TEST_BROWSER` selector in that same fixture. Do not add another test file/helper, service
route, CLI call, dependency or manifest permission. Preserve the existing goal and unrelated changes.
For each behavior change, first run its test and observe the expected failure, implement the minimum
fix, rerun it, then tidy without changing behavior. Name new menu tests with the `workflow menu`
prefix. Rebuild before browser tests; do not pass test flags through `npm test`.

## 1. Global workflow access

- [ ] 1.1 At the existing panel/fake-host seam, add failing `workflow menu global` cases for the six
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

- [ ] 2.1 At the same panel/fake-host seam, add failing `workflow menu change` cases covering all
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

- [ ] 3.1 At the same panel/fake-host seam, replace the obsolete Propose assertions with failing
  `workflow menu quick` cases for Planning's `Continue artifacts` on board and detail. Pin the exact
  Continue skill, existing-change target, verbatim/missing goal handling and at-most-one-artifact
  instruction, without new-change creation, automatic goal writes or implementation. Rename the
  direct board button to `Create scaffold…` and update existing creation/header assertions, keeping
  its dialog validation, create request and uncertain-outcome behavior. Preserve quick Explore's
  Planning-only guard, quick Verify/Archive in Complete, Ready/Progress's Apply destination menu,
  the shared normal/worktree Apply prompt and the confirmed archive-all-completed launch. Update
  every affected caller/label assertion rather than retaining conflicting old Propose semantics.
  In this slice, document the interaction change and the distinctions New versus Create scaffold…,
  Continue versus Apply, and Bulk archive versus archive all in README. Verify `npm run build`,
  `node --test --test-name-pattern='workflow menu quick' test/panel.test.mjs` and the full
  `node --test test/panel.test.mjs` regression suite.

## 4. Keyboard, layout and approved browser matrix

- [ ] 4.1 At the same panel/fake-host seam, add `workflow menu accessibility` cases for Enter/Space
  opening, navigation, selection, Escape dismissal and focus restoration on global/card/detail
  menus. Test both themes at 320px and 1076px, all menu entries' reachability, no horizontal page
  overflow, and retained search/detail shells, caret, focus and scroll during ordinary refreshes
  and theme changes. Use these cases to drive only necessary changes to native-menu wiring and
  `panel/index.html`; retain current footer spacing and handle disposal. In the existing fixture,
  add the approved `OPENSPEC_TEST_BROWSER` choice of chromium/firefox/webkit with Chromium default
  and explicit rejection of any other value before launch; add no new helper, file or package
  script. Document exact developer commands and their panel-only cross-engine scope in README.
  Verify `npm run build`, the focused accessibility cases, then the full panel suite with the
  selector unset, `OPENSPEC_TEST_BROWSER=firefox` and `OPENSPEC_TEST_BROWSER=webkit`. Verify that an
  unsupported selector fails as expected, not by missing dependencies or silently using Chromium.
  Obtain approval before installing dependencies or browser binaries if missing.

## 5. Integrated acceptance and installable bundle

- [ ] 5.1 Run `npm run check` and both additional full panel runs:
  `OPENSPEC_TEST_BROWSER=firefox node --test test/panel.test.mjs` and
  `OPENSPEC_TEST_BROWSER=webkit node --test test/panel.test.mjs`. Inspect actual exit status and
  output; report each engine separately and do not claim other browser suites ran cross-engine.
  Confirm the final diff stays within the design's at-most-nine existing implementation targets,
  leaves manifest permissions/private protocol/stage derivation untouched, and includes the rebuilt
  installable panel bundle. Run available crapper/dryer/mutator checks under project rules or name
  the unavailable checks without installing them. After authorized extension activation using
  AGENTS.md's Disable/Enable procedure, perform the live-host panel/page check with Playwright:
  prepare global and contextual prompts, check canonical quick labels, keyboard/narrow layout and
  cancelled archive confirmation. Do not create a real scaffold, session or worktree without
  separate permission. Report any installation, activation or live-host blocker rather than mark
  unperformed checks complete. This broad integration task adds no separate test seam or new tests.
