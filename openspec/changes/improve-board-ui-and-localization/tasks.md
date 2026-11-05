# Tasks

Implementation is blocked on explicit owner approval of proposal/design/specs/tasks. No runtime
work has started. The sole new-test seam is the existing `test/panel.test.mjs` fake SDK host;
extend that file's fixture, not another test file or helper. Each slice records an expected RED
before runtime edits, implements minimum GREEN, cleans up and reruns its focused tests. Deliver
the runtime slices together; partial EN/RU coverage is not a completed localization release.

## 1. Contained search and clarified Planning label

- [x] 1.1 At the panel seam add failing `board toolbar contained` cases with bounding boxes at
  320/560/561/580/600/1076px in both themes, empty/nonempty search, clear/Escape and long change IDs.
  Fix search minimum/basis and flex wrapping in panel/index.html without clipping or hiding actions.
  Rebuild and verify input containment, no search/action intersection, no horizontal page overflow
  and unchanged filtering/focus. Update README's responsive-layout guidance in this slice.
- [x] 1.2 At the same panel seam add failing `planning label preserves Continue` card/detail cases.
  Change the English presentation to Continue planning, keeping the exact prompt and all workflow
  IDs/guards. Update existing panel/integration English selectors only where the label changed;
  retain payload assertions. Verify focused new tests and existing workflow tests after build and
  update README wording without modifying the completed prior change.

## 2. Persistent language selection and board presentation

- [x] 2.1 Extend the existing panel fake host for SDK storage and locale-ready snapshots, including
  delayed/rejected get/set and persistence across iframe remount. Add failing `viewer language
  preference` cases for missing/en/ru/auto, en-AU/ru-RU/case variants/unsupported locale, null and
  invalid values, read/write rejection, pending repeat selection and dispose-before-response.
  Implement the typed EN/RU catalogue and controller-owned state with the persistent SDK picker;
  localize board labels, stages, search/clear, notices, help and counters in this slice so language
  choice has observable effect. One get per mount, one set at a time, commit after success, visible
  failures, no rewrite/retry and no extra board reads. Verify focused panel tests, picker focus,
  document language and typecheck; document preference scope and failure behaviour in README.
- [x] 2.2 Add failing `viewer language retained board` panel cases: caret/selection and query,
  focused notice Retry, host-locale and theme updates, empty/error/stale/unavailable board states,
  count forms 0/1/2/5/11/21/22, clearing and Back/post-delete focus using translated names.
  Finish owned board message descriptors/cache updates and stable focus selectors. Extend the
  geometry cases to English/Russian, both themes, all six widths and empty/nonempty search.
  Verify no new reads or writes during language-only updates, same mounted search/notice controls,
  correct clearing labels and unchanged counts/stages; rerun slices 1 and 2 focused panel tests.

## 3. Localized retained detail and workflow presentation

- [x] 3.1 Add failing `viewer language retained detail` cases at the panel seam for detail/actions,
  standard/custom artifact tabs, readiness, tasks and document status/retry/fallback text. Pin
  actual focused nonselected tab, selected artifact, board/detail/document scroll, document text
  selection and expansion. Localize detail/document/tasks and their shared controls in place;
  translate owned client/resources diagnostics while preserving classes/codes and raw upstream
  evidence. Verify unchanged document DOM/source/task text and no extra reads or rerender of
  unchanged content. Rerun existing retained-state tests and update README's translation boundary.
- [x] 3.2 Add failing `viewer language workflow payloads` cases at the same seam for every global
  and per-change workflow in both languages, all primary stages and Apply destinations. Localize
  registry presentation, action labels, ordinary tooltips and inline descriptions only. Pin
  Continue planning / Продолжить планирование, exact unchanged prompt payloads, opened menu active
  ID/focus/captured context and stale-selection rejection through locale/theme updates. Verify
  existing hover-only/suppression/keyboard suites, no implicit launch/send and no extra reads.
- [x] 3.3 Add failing `workflow information accent` panel cases for board/card/detail triggers in
  both themes, alongside primary/muted actions, with hover/focus-visible/disabled. Apply scoped
  info-token styling without recolouring menu rows or Apply destination controls. Verify distinct
  surfaces, text contrast >=4.5:1 and focus/control contrast >=3:1 from actual fixture colours,
  keyboard reachability and an unclipped final menu entry at 320px and desktop. Rerun workflow
  interaction tests and document the host-token-dependent accent in README.

## 4. Localized dialogs and operation feedback

- [x] 4.1 At the existing panel seam add failing `viewer language dialogs` cases for create/delete/
  archive, validation, context replacement, pending/uncertain operation and reconciliation states.
  Use automatic host-locale updates while modal dialogs are open to prove existing field focus,
  values, validation, mode and captured attempt are retained without extra mutations or reads.
  Localize owned dialog messages as key/parameters and preserve raw diagnostics; do not change
  mutation/recovery rules. Verify existing uncertainty/confirmation suites in both UI languages
  and update README's dialog language/state guidance.
- [x] 4.2 Add failing `viewer language operation feedback` panel cases for help/copy/link errors,
  prepared prompts, worktree inspection/partial outcomes, archive launch failures and new-session
  titles. Localize controller/worktree-owned text without changing workflow prompt bodies,
  result interpretation, known resource identifiers, retry rules or dispatch guards. Verify
  localized owned feedback and verbatim raw errors, all existing failure branches and unchanged
  host request payloads except explicitly localized titles. Document host Copy/OK and already
  emitted toast exceptions in README; rerun focused tests plus lint/typecheck.

## 5. Integrated verification and acceptance evidence

- [x] 5.1 Independently inspect every modified file, source/bundle diff, catalogue coverage and
  unmodified prompts/IDs/CLI/manifest/dependencies. Run `mise exec -- npm run check`, full panel
  suites with `OPENSPEC_TEST_BROWSER=firefox` and `webkit`, strict validation for this change and
  `git diff --check` on the final source/bundle state. Check actual exit statuses. Confirm the full
  width/language/theme matrix and retained-state/failure cases above pass, not just label smoke
  checks. Record counts, commands and unavailable crapper/dryer/mutator checks without installing.
- [x] 5.2 After build perform AGENTS.md live-host activation (Disable/Enable, confirm Enabled).
  Check current board/detail, non-submitted dialogs, saved language round-trip, both themes,
  search/clear at collision widths, Workflows colour/keyboard/description behaviour and retained
  UI state without modifying composer drafts or creating real changes/sessions/worktrees.
  Use the prescribed isolated browser; if access is blocked, record the infrastructure evidence
  and ask before an alternative method. Record actual live results or keep this task blocked,
  never mark an unperformed check done. Leave commits, push, spec sync and archive untouched.

## Execution evidence

- 2026-11-03: owner explicitly approved this plan through the implementation question. Independent
  Momus review found no blocking gap; strict OpenSpec validation passed before runtime changes.
- 1.1 RED: the new panel assertion reproduced containment=false and overlap=true at light/561px
  (`/tmp/opencode/board-ui-search-red.log`). After the CSS fix it exposed the independent clear
  control failure (`board-ui-search-clear-red.log`); the premature board searchValue assignment
  prevented SDK prop updates. Removing it restores pointer clearing and Escape. GREEN checks six
  widths, both themes, empty/nonempty input, a long change ID and retained input focus.
- 1.2 RED: Continue planning was absent on the Planning card
  (`/tmp/opencode/board-ui-planning-red.log`). GREEN retains the existing card/detail tests with
  exact Continue guidance, recorded/missing goals and compose-only side effects.
- Initial information-accent RED is in `/tmp/opencode/board-ui-accent-red.log`; the previous
  Workflows trigger had ordinary foreground styling. The initial enabled/focus/hover check now
  passes on board/cards/detail at 320/1076px in both themes; full task 3.3 acceptance is pending.
- Parent focused search/accent/Continue run: 3/3 passed, exit 0. Full check and full browser suites
  remain pending until localization is integrated. No final verification is claimed yet.
- Live prerequisite: isolated Playwright at localhost:5096 showed Unlock OpenChamber; the owner
  subsequently authorized authenticated Chrome/Browser MCP for final live checks without reading
  credentials/cookies or creating changes/sessions/worktrees. The prior 57123 endpoint timed out.
- 2.1/2.2: initial RED evidence is `/tmp/opencode/board-ui-language-core-red.log`; seven new board/
  preference regressions now pass. Parent inspected catalogue, controller, board/help, fixture and
  layout changes, then independently ran all ten language/search/accent/Continue focused cases:
  10/10, exit 0, plus typecheck and diff check. Log:
  `/tmp/opencode/board-ui-language-parent-focused.log`. Worker full Chromium panel: 138/138;
  final full runs are still required after later localization. Detail/dialog/actions and feedback
  are not yet fully translated.
- 3.1/3.2: RED evidence `/tmp/opencode/board-ui-detail-red.log`; parent inspected the retained views,
  shared menu/actions, local error descriptors and unchanged workflow prompt file. Independent
  focused detail/workflow run: 5/5 passed, plus typecheck/diff check, exit 0
  (`/tmp/opencode/board-ui-detail-parent-focused.log`). Worker full Chromium panel: 143/143 and
  resources: 4/4. Final post-integration browser checks remain pending.
- 3.3: parent extended and ran the information-accent regression: both themes, 320/1076px,
  board/card/detail, real text/border/focus contrast, info text token, distinct primary/secondary
  surfaces, hover/focus ring, final-entry bounds and host-driven disabled states all passed.
- Independent Oracle static review of the stable board/detail/document/tasks/shared-menu/tooltip
  slice against SDK 1.24.2 and the retained-state requirements found no confirmed defect or
  blocker. It did not run tests or review the still-changing dialog/controller-feedback slice;
  final integration and live acceptance remain separate checks.
- 4.1/4.2 RED: `/tmp/opencode/board-ui-dialog-feedback-red.log`. Parent inspected all three dialog
  diffs, validation-state preservation, controller feedback and worktree error descriptors, then
  independently ran the seven new dialog/feedback cases plus the document-fallback regression:
  8/8, exit 0, followed by typecheck/diff check
  (`/tmp/opencode/board-ui-dialog-feedback-parent-focused.log`).
- Final string inventory also found owned empty-document fallbacks Document task and Image in
  `document-renderer.ts`. Parent RED proved the empty checkbox retained English after a locale
  update (`/tmp/opencode/board-ui-document-fallback-red.log`). The renderer now marks only owned
  fallback nodes; document view updates their labels/text without rerendering source or changing
  source headings/DOM identity. User-provided HTML remains escaped before sanitization. This adds
  document-renderer.ts to the implementation file scope, not another seam or dependency.
- Final review identified a combined empty image inside a task checkbox: the image text translated
  while its derived checkbox name retained Image. Parent reproduced it
  (`board-ui-document-combined-red.log`), then refreshed derived checkbox names after translating
  image placeholders. The combined fallback regression passes in Chromium, Firefox and WebKit.
- Full WebKit exposed lost document selection when SDK tabs replace the focused control. Parent
  reproduced it (`board-ui-webkit-selection-red.log`), retained the document Range across language
  updates and verified the existing focus/selection/scroll assertion in all three engines.
- Firefox reports fractional CSS dimensions: 850.0000305175781px for an 850px viewport. Parent
  reproduced the false strict-equality failure (`board-ui-firefox-geometry-red.log`), bounded the
  sum to <0.001px precision and verified Firefox without relaxing overflow or scroll assertions.
- Live light-theme tokens exposed a translucent host focus token and insufficient hover contrast
  with the initial 18%/32% tint. Parent REDs: `board-ui-focus-colour-red.log` and
  `board-ui-live-hover-red.log` (hover contrast 3.922:1). The scoped style now uses the SDK-like
  10%/16% tint and an opaque info-text outline. The accent regression includes the actual live
  light-theme information colours and hover contrast; all three engines pass it.
- Final live Chrome activation confirmed Enabled. Observed EN/RU/auto selection, Russian preference
  surviving extension Disable/Enable, translated board/detail/create/delete controls, unchanged
  English document headings, menu keyboard descriptions, immediate ordinary-tooltip dismissal,
  and a non-overlapping Russian search at a real 561px iframe width. Light/dark theme checks passed;
  original System colour mode, English preference and iframe style were restored. No real change,
  session or worktree was created and no composer draft was modified.
- Browser MCP frame-target eval did not supply its element despite its help text, and an iframe
  screenshot timed out. Neither was retried unchanged. Exact geometry remains covered at the
  fake-host seam; live assertions use native locators and full-page screenshots. Temporary iframe
  width was restored. Host console 404s were traced to `/api/guests/session-focus/files`, not the
  OpenSpec extension. Screen-reader speech is not tested.
- Final frozen-source `mise exec -- npm run check`: 215/215, exit 0, including Chromium panel
  151/151, lint, format check, typecheck, remaining suites and both bundle builds. Log:
  `/tmp/opencode/board-ui-verified-check.log`.
- Final full panel suites: Firefox 151/151 and WebKit 151/151, both exit 0. Logs:
  `/tmp/opencode/board-ui-verified-firefox.log` and `board-ui-verified-webkit.log`. Runtime/test
  source hashes were unchanged throughout the final runs. Parent final strict validation,
  `git diff --check`, source integrity and byte-identical prompt/ID checks passed. Permissions,
  dependencies, service, private protocol and generated skills are unchanged. All 11 tasks are
  accepted. No commit, push, spec sync or archive was performed. crapper/dryer/mutator remain
  unavailable and were not installed; screen-reader speech remains outside performed checks.
