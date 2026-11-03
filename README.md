# OpenSpec for OpenChamber

A kanban board for the OpenSpec changes in your OpenChamber project or worktree. See each change's
stage, artefacts and task progress in one place, create or delete changes, and kick start the next
workflow step.

![OpenSpec board grouping changes by stage, with task progress and workflow actions.](docs/images/board-view.jpg)
![OpenSpec change detail showing the selected Specs tab and its specification.](docs/images/change-view.jpg)

This extension is simply another way to use OpenSpec, without adding planning features or
conventions of its own. OpenSpec's own CLI and skills remain the core.

Contributions that keep this extension in step with OpenSpec or take advantage of it's additional
features are welcome.

## Get started

1. Install the [OpenSpec CLI](https://openspec.dev/docs/installation) on the OpenChamber server
   (workflow setup targets 1.16.0).
2. Run `openspec config profile`. Select all twelve workflows and choose **skills** delivery:
   propose, explore, new, continue, apply, ff, update, sync, archive, bulk-archive, verify and
   onboard.
3. In your project, run `openspec init --tools opencode`. For an existing OpenCode integration, run
   `openspec update` after changing the workflow profile.
4. In OpenChamber, open **Settings > Extensions** and add
   `https://github.com/jaythomasonprojects/openchamber-openspec.git`. Its service runs `openspec`
   with your user access, and the `sessions` permission lets it start sessions for worktree Apply
   and bulk archiving. If you trust that, choose **Allow and enable**.
5. Open the **OpenSpec** rail panel, or find it under **Extension pages**.

The board's help button opens the OpenSpec quickstart. For ~ x2 faster loads, run
`openspec config set telemetry.enabled false`, since telemetry can slow down every CLI call.

## Global workflows

The board's **Workflows** menu prepares an editable, **unsent** prompt in the current chat,
replacing any existing draft (including a fresh chat without a session):

| Action         | Requested skill                |
| -------------- | ------------------------------ |
| Propose change | `openspec-propose`             |
| Explore ideas  | `openspec-explore`             |
| New change     | `openspec-new-change`          |
| Fast-forward   | `openspec-ff-change`           |
| Bulk archive   | `openspec-bulk-archive-change` |
| Onboard        | `openspec-onboard`             |

These global actions never target a selected card or search results. A project directory is enough,
even when no OpenSpec root is initialized; the extension does not initialize it, write files, send
the prompt or start a session. The agent workflow retains setup permission, task selection and other
required questions. Bulk archive owns candidate selection, conflict assessment and batch
confirmation; it is not the separate confirmed **Archive all** shortcut that launches a
completed-only session.

All twelve workflows require their generated skills: the six above plus `openspec-continue-change`,
`openspec-apply-change`, `openspec-update-change`, `openspec-sync-specs`, `openspec-archive-change`
and `openspec-verify-change`. The active agent must expose and permit the requested skill in its
allowlist. A prepared prompt does not prove skill availability or successful execution. Installation
and authorization are your environment's responsibility; the extension neither installs skills nor
substitutes another workflow or raw slash command when one is unavailable.

## Change workflows

Each available card and its detail view have the same **Workflows** menu in every stage:

| Action          | Requested skill            |
| --------------- | -------------------------- |
| Continue change | `openspec-continue-change` |
| Apply tasks     | `openspec-apply-change`    |
| Update change   | `openspec-update-change`   |
| Sync specs      | `openspec-sync-specs`      |
| Archive change  | `openspec-archive-change`  |
| Verify change   | `openspec-verify-change`   |
| Explore ideas   | `openspec-explore`         |

Selections target the menu's original change and prepare an unsent replacement draft, without extra
reads, file writes or session launches. Changing project, planning target, chat or displayed detail
change invalidates an old opening; a stage update alone does not. Unavailable changes are disabled.
A stage is not proof that planning or verification is complete: each workflow checks its own
prerequisites and retains its required user questions and confirmations.

Continue preserves existing decisions and the recorded goal verbatim, requests **at most one** next
planning artifact and neither creates another change nor implements code. A missing goal is left for
clarification, not automatically written. Explore discusses the goal without file changes. Update
revises planning with its confirmations, not implementation; Sync checks prerequisites and
synchronizes specs without following up with archive. Verify reports implementation gaps without
fixing or archiving; Archive checks archival prerequisites rather than assuming verification. Named
Apply tasks always prepares the current-chat draft; only the existing quick Apply destination menu
offers **Run in new worktree**, using the same Apply prompt.

An already accepted host compose request cannot be cancelled by navigation. Late feedback is
discarded in the replacement context, without retrying or replaying the prompt.

### Quick actions and scaffold creation

Planning's primary action is now **Continue artifacts**, not the former existing-scaffold Propose.
On both cards and detail it invokes Continue for the existing change, preserving decisions and the
goal verbatim and requesting at most one next planning artifact. Missing goals require
clarification, not automatic metadata writes. It never automatically starts implementation. Quick
**Explore** remains Planning-only; global **Propose change** and **Fast-forward** instead plan a new
change.

Ready and In Progress both show **Apply**, with current-chat and new-worktree destinations using the
same Apply prompt. Complete retains **Verify** (diagnostic only) and **Archive** (with prerequisite
checks). These shortcuts do not add stages or treat verification as permission to archive.

**Create scaffold…** opens the existing name-and-required-goal dialog and directly creates only that
scaffold. The global **New change** workflow instead prepares an unsent agent prompt and leaves its
questions and artifact creation to the agent. Likewise, **Bulk archive** is interactive agent-led
selection and confirmation, whereas **Archive all** retains its separate confirmation before
starting a session for completed changes only, regardless of the search filter.

Buttons use sentence case. Hover or focus a button to read its outcome without activating it; Escape
dismisses the description; native dialogs and menus keep their usual Escape closing and focus
restoration. Descriptions preserve accessible names and distinguish unsent drafts from direct
scaffold creation, deletion, and confirmed session/worktree launches. Retry descriptions refer only
to reads, never automatically repeating uncertain writes.

While any **Workflows** list is open, ordinary button descriptions are suppressed, including its
trigger's. Hover an entry or use Arrow keys, Home or End to read its outcome inline in the active
row; descriptions never cover neighboring entries. Escape closes the native menu and restores focus.

## Planning across worktrees

Commit your `openspec/` directory and worktrees pick up changes through Git like any other file.
**Run in new worktree** starts from your project's default base, so commit the change there first.

Optionally, to share uncommitted planning between worktrees, use your project's setup hook to link
each worktree's `openspec/` to the main checkout's. The board follows the link but does not create
or repair it.

## Develop

Requires Node 22.13+, npm and the OpenSpec CLI. Run `npm ci`, `npx playwright install chromium`,
then `npm run check`. OpenChamber does not build extensions on install, so rebuild, then disable and
re-enable the extension to restart its service. More detail is in `AGENTS.md`.

The existing fake-host **panel suite only** also supports Firefox and WebKit; this is not
cross-engine coverage of the document, service or integration suites. Install their browser binaries
and required system libraries separately if needed
(`npx playwright install --with-deps firefox webkit`). With Node 22 selected through mise, rebuild
before running browser tests:

```sh
mise exec -- npm run build
env -u OPENSPEC_TEST_BROWSER mise exec -- node --test --test-name-pattern='workflow menu accessibility' test/panel.test.mjs
OPENSPEC_TEST_BROWSER=firefox mise exec -- node --test --test-name-pattern='workflow menu accessibility' test/panel.test.mjs
OPENSPEC_TEST_BROWSER=webkit mise exec -- node --test --test-name-pattern='workflow menu accessibility' test/panel.test.mjs
env -u OPENSPEC_TEST_BROWSER mise exec -- node --test test/panel.test.mjs
OPENSPEC_TEST_BROWSER=firefox mise exec -- node --test test/panel.test.mjs
OPENSPEC_TEST_BROWSER=webkit mise exec -- node --test test/panel.test.mjs
```

Unset `OPENSPEC_TEST_BROWSER` defaults to Chromium; `chromium` explicitly selects it too. Any other
value fails before browser launch. Check that rejection with the following command, which must exit
nonzero with `Unsupported OPENSPEC_TEST_BROWSER: unsupported`:

```sh
OPENSPEC_TEST_BROWSER=unsupported mise exec -- node --test --test-name-pattern='workflow menu accessibility' test/panel.test.mjs
```
