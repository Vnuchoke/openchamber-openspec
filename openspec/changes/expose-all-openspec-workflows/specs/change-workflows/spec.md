# Spec Delta

## ADDED Requirements

### Requirement: Button labels and descriptions communicate outcomes accessibly

Extension-owned buttons SHALL use sentence case, preserving names, acronyms and change IDs.
Ordinary descriptions SHALL appear only while the pointer is over their owner button, linked with
aria-describedby without replacing accessible names. They SHALL dismiss immediately on pointer exit,
including movement onto the description; focus alone SHALL NOT show or retain them. Descriptions
SHALL remain dismissible and viewport-contained. Inline Workflows descriptions are exempt.

#### Scenario: Update or remove a described control

- **WHEN** a control changes stage, becomes hidden or disabled, or is removed
- **THEN** its visible description is dismissed and subsequent descriptions match the current action
- **AND** removal disposes the description and listeners without remounting retained UI shells
- **AND** SDK menuitems and artifact tabs keep their existing interaction semantics

#### Scenario: Distinguish side effects before activation

- **WHEN** the user hovers a workflow, scaffold or archive control
- **THEN** its description distinguishes an editable unsent prompt, direct scaffold write or
  confirmation followed by session/worktree creation and submission
- **AND** Continue artifacts describes at most one planning artifact, while Apply offers destination
  selection and Archive all opens confirmation for completed changes only

#### Scenario: Inspect and dismiss without acting

- **WHEN** a user hovers an enabled button, then presses Escape
- **THEN** its description disappears without invoking its action or reading data
- **AND** focus stays on a standalone button; inside a native dialog or menu, existing Escape
  dismissal and focus restoration remain in effect rather than requiring an extra Escape

#### Scenario: Use adjacent wrapped controls

- **WHEN** a description overlaps another action in a narrow, wrapped toolbar
- **THEN** the neighboring button remains clickable without first dismissing the description
- **AND** moving onto the ordinary description dismisses it without intercepting that click
- **AND** unchanged session updates do not dismiss the hovered button's description

#### Scenario: Leave an owner button while it retains focus

- **WHEN** a hovered ordinary button shows a description and the pointer leaves its boundaries
- **THEN** the description disappears immediately, even if focus stays on that button or the pointer
  enters the description's former bounds
- **AND** focusing another ordinary button without hover does not show a description
- **AND** inline Workflows descriptions still respond to hovering and keyboard navigation

### Requirement: Open Workflows menus exclusively describe their own entries

While a Workflows list is open, descriptions outside that list, including its trigger's description,
SHALL be hidden and suppressed. Every global and change workflow SHALL have a short outcome
description shown on pointer hover or keyboard activation of its row. Descriptions SHALL remain
inside the active row without covering the list or adjacent entries. Native menu interaction and
workflow routing SHALL remain unchanged.

#### Scenario: Suppress unrelated descriptions until dismissal

- **WHEN** Workflows opens on the board, a card or a change detail
- **THEN** existing ordinary descriptions disappear and hovering its trigger or other buttons cannot
  display them until the list closes
- **AND** closing or disposing the menu restores ordinary description behavior without extra reads

#### Scenario: Describe every workflow by pointer and keyboard

- **WHEN** a user hovers a workflow or navigates to it with Arrow keys, Home or End
- **THEN** its description explains the unsent prompt's intended workflow result
- **AND** its accessible name, original target, keyboard focus and selection behavior are preserved
- **AND** switching entries, SDK repaint, theme changes and dismissal leave no stale description

#### Scenario: Reach the final entry in a narrow menu

- **WHEN** a list is shown at 320px or desktop width in either theme
- **THEN** all entries and their descriptions are reachable without overlap or viewport clipping
- **AND** Escape dismisses the list and restores focus as before without invoking a workflow

### Requirement: Global workflow menu exposes new-change and project workflows

The board SHALL offer a `Workflows` menu containing Propose change, Explore ideas, New change,
Fast-forward, Bulk archive and Onboard. These actions SHALL prepare current-chat prompts for their
named workflows without targeting a selected card. A known project directory SHALL suffice for
opening this menu, including before a successful OpenSpec listing. The workflows SHALL retain
their own setup checks and required user questions.

#### Scenario: Prepare each global workflow

- **WHEN** a user chooses an entry from the board Workflows menu
- **THEN** the prompt requests the corresponding skill from this mapping:
  | Entry | Skill |
  | --- | --- |
  | Propose change | openspec-propose |
  | Explore ideas | openspec-explore |
  | New change | openspec-new-change |
  | Fast-forward | openspec-ff-change |
  | Bulk archive | openspec-bulk-archive-change |
  | Onboard | openspec-onboard |
- **AND** new-change workflows ask the agent to establish the user's intended change rather than
  treating an existing card as the new change or asking it to complete that card's scaffold
- **AND** the extension neither creates a change nor writes artifacts through this selection

#### Scenario: Onboard without an initialized board

- **WHEN** a project directory is known but the initial OpenSpec listing has failed or found no root
- **THEN** Onboard can still prepare its prompt
- **AND** the extension does not initialize OpenSpec, choose a store, or create a session
- **AND** the prompt leaves setup permission and the onboarding task selection to the workflow

#### Scenario: No project directory

- **WHEN** no project directory is known
- **THEN** global workflow actions cannot compose a prompt or guess a project

### Requirement: Named change workflows are independent of presentation stage

Every available change SHALL expose the same `Workflows` menu on its card and detail: Continue
change, Apply tasks, Update change, Sync specs, Archive change, Verify change and Explore ideas.
Each action SHALL name that change and its exact workflow regardless of stage. The workflow SHALL
check current prerequisites; menu availability SHALL NOT equate a board stage with complete
planning, successful verification or permission to archive.

#### Scenario: Prepare each change workflow

- **WHEN** a user chooses a named workflow for an available change on either surface
- **THEN** the prompt names that change and requests the corresponding skill from this mapping:
  | Entry | Skill |
  | --- | --- |
  | Continue change | openspec-continue-change |
  | Apply tasks | openspec-apply-change |
  | Update change | openspec-update-change |
  | Sync specs | openspec-sync-specs |
  | Archive change | openspec-archive-change |
  | Verify change | openspec-verify-change |
  | Explore ideas | openspec-explore |
- **AND** the stage cannot redirect Verify, Update or any other named selection into Apply

#### Scenario: Continue after the apply prerequisites are satisfied

- **WHEN** a Ready change still has an unfinished planning artifact outside the apply prerequisite set
- **THEN** its named Continue change action remains available and invokes Continue, not Apply
- **AND** custom artifact identifiers and intentionally skipped artifacts do not change routing

#### Scenario: Update and Sync do not imply implementation or archive

- **WHEN** a user prepares Update change or Sync specs
- **THEN** Update requests a review of planning artifacts with the workflow's required confirmations,
  while Sync requests spec synchronization with its prerequisite checks
- **AND** neither prompt instructs the agent to implement tasks or archive the change afterward

### Requirement: Continue planning one artifact at a time

The Planning primary `Continue artifacts` action and the named Continue change action SHALL invoke
`openspec-continue-change` for the existing change. Their prompts SHALL preserve existing decisions
and any recorded goal, request at most one next planning artifact under the workflow's instructions,
and prohibit new-change creation or implementation. Missing goals SHALL NOT be invented. The
workflow SHALL decide how to handle complete planning or a partially populated artifact.

#### Scenario: Continue an empty or partially planned change

- **WHEN** a user chooses Continue artifacts or Continue change
- **THEN** the prompt explicitly identifies the existing change and invokes Continue
- **AND** it requests at most one artifact rather than all missing planning artifacts
- **AND** the extension makes no artifact or metadata write

#### Scenario: Preserve the recorded goal

- **WHEN** a change has a recorded goal, including quotation marks or line breaks
- **THEN** the prompt retains that goal's text and directs the agent to preserve current decisions
- **AND** a missing goal instead requests clarification from existing context without a fabricated
  goal, a literal null value or an automatic goal-write instruction

#### Scenario: Planning is already complete

- **WHEN** a user prepares Continue for a change whose planning is already complete
- **THEN** the prompt leaves the completion check to Continue and does not request automatic Apply

### Requirement: Interactive Bulk archive remains separate from completed-only archive all

The global Bulk archive entry SHALL prepare an unsent `openspec-bulk-archive-change` prompt. It
SHALL preserve the workflow's explicit change selection, conflict assessment and batch confirmation,
not preselect changes from visible cards or search results. It SHALL remain distinct from the
existing confirmed `Archive all` shortcut that starts a session for completed changes only.

#### Scenario: Prepare interactive bulk archiving

- **WHEN** a user chooses Bulk archive, including on an empty or filtered board
- **THEN** the composer receives the interactive Bulk archive prompt without a session launch
- **AND** the prompt leaves candidate selection and batch confirmation to that workflow
- **AND** no completed-only single-archive loop is substituted for the requested workflow

#### Scenario: Preserve the existing shortcut

- **WHEN** a user chooses Archive all instead of the Bulk archive menu entry
- **THEN** the existing confirmation dialog and completed-only session-launch behavior remain in force

### Requirement: Workflow menus preserve accessibility and retained interface state

Workflow menus SHALL support keyboard opening, navigation, selection and dismissal, with usable
focus restoration. They SHALL remain reachable at 320px and desktop widths without horizontal page
overflow. Opening, dismissing or choosing a workflow SHALL NOT trigger board or document reads.
Ordinary refreshes and theme changes SHALL retain existing search/detail shells and their focus,
caret and scroll behavior; mounted menu handles SHALL be disposed with their owning view.

#### Scenario: Open and dismiss with the keyboard

- **WHEN** a user opens a Workflows menu with Enter or Space, navigates it and presses Escape
- **THEN** no workflow is dispatched and focus returns to a usable invoking control

#### Scenario: Select with the keyboard

- **WHEN** a user selects a workflow with the keyboard
- **THEN** the same named prompt is prepared as for pointer selection
- **AND** no extra listing, summary, task or document request occurs

#### Scenario: Use sidebar and desktop widths

- **WHEN** the board or detail is displayed at 320px or desktop width in either theme
- **THEN** every menu action is reachable without horizontal page overflow or clipped controls
- **AND** existing footer spacing and non-workflow controls retain their behavior

## MODIFIED Requirements

### Requirement: Use OpenSpec workflow vocabulary consistently

Cards and detail SHALL label the primary planning action `Continue artifacts`, both ready and
in-progress implementation actions `Apply`, and the completed primary action `Archive`. The
separate secondary completed action SHALL be `Verify`, available independently of archive. Board
stage headings and detail badges SHALL use Planning, Ready, In Progress and Complete. The board's
manual reload action SHALL be labelled `Refresh`. These are presentations of existing CLI-derived
progress, not new persisted states. Standard artifact labels SHALL remain Proposal, Specs, Design
and Tasks; custom artifact identifiers SHALL remain supported. Canonical Propose SHALL be offered
globally rather than as an instruction to create another copy of an existing scaffold.

#### Scenario: Match actions across board and detail

- **WHEN** a user views a change in each of the four stages and opens its detail
- **THEN** the primary labels match on both surfaces and call `openspec-continue-change`,
  `openspec-apply-change`, `openspec-apply-change` and `openspec-archive-change` respectively
- **AND** Complete exposes secondary Verify independently of Archive
- **AND** no action is labelled merely continue when it actually resumes implementation through Apply

### Requirement: Explore the goal from a Planning change card

Every available Planning change card SHALL retain a compact secondary `Explore` action alongside
Continue artifacts. Other stages SHALL NOT show that quick action, but SHALL offer Explore ideas
through their named Workflows menu. Both forms SHALL name the change, include its recorded goal
when present and invoke `openspec-explore` to investigate the goal, relevant code, options and
trade-offs. They SHALL request discussion without file changes or implementation. Missing goals
SHALL NOT be invented: the prompt SHALL direct the agent to inspect existing context and clarify
the goal if necessary.

#### Scenario: Explore a stated goal

- **WHEN** the user chooses Explore on a Planning card or Explore ideas in its named menu
- **THEN** an exploration prompt for that change and its stated goal is prepared
- **AND** the stage, task counts and artifact counts remain unchanged

#### Scenario: State changes after rendering

- **WHEN** a Planning card becomes Ready, In Progress or Complete before its old quick Explore action dispatches
- **THEN** that obsolete quick action SHALL NOT compose a prompt
- **AND** a named Explore ideas menu selection remains valid across a stage-only change if its
  originating change and context remain available

#### Scenario: Legacy change without a goal

- **WHEN** the user explores or continues a change with no recorded goal
- **THEN** the prompt names the change and requests clarification from existing context rather than
  supplying a fabricated goal or a literal null value
- **AND** composition does not write metadata
- **AND** Explore continues to request discussion without file changes

### Requirement: Workflow composition stays unsent and context-bound

Current-chat workflow actions SHALL prepare editable, unsent prompts and SHALL replace the open
composer's text, including a fresh-chat draft with no session ID. Change-targeted prompts SHALL
name the change and relevant skill without directory or root paths; global prompts SHALL name the
skill without injecting a selected change. Apply SHALL direct completion of pending tasks and
reporting of verification and blockers; Verify SHALL compare implementation with planning artifacts
and report gaps without implementation or archiving; Archive SHALL check archival prerequisites
without assuming prior verification. The panel SHALL NOT mutate OpenSpec files through workflow
composition. Among per-change actions, only explicit new-worktree Apply SHALL create a worktree and
session and send the Apply prompt as its first message through the SDK; the board-level archive all
launch follows its own requirements. Unavailable changes SHALL have disabled workflow actions.
Menus SHALL bind selection to their opening project, planning target, session and change when
applicable, rejecting obsolete selections before dispatch. Stage-only changes SHALL NOT reject a
named workflow, while stage-specific quick actions retain applicability checks. Unrelated context
replacement SHALL discard late feedback without replaying composition. New-worktree submission
SHALL target only the created session, even if the originating panel is closed. Keeping the panel
open is optional. The extension SHALL NOT claim that dropping late feedback cancels an already
accepted host request or undoes its effects.

#### Scenario: Compose without changing workflow state

- **WHEN** a current-chat workflow action replaces an existing composer draft or a fresh-chat draft
- **THEN** its named skill and relevant guidance are present, filesystem paths are absent, and no
  send or session-creation request occurs
- **AND** no card moves or tasks are marked complete merely from composition

#### Scenario: Context replacement or composition failure

- **WHEN** the host rejects composition or an unrelated context replaces its destination while
  composition is pending
- **THEN** a failure is shown only in the still-current relevant context and no action is replayed
  into the replacement context
- **AND** no other workflow, automatic send or session launch is used as a fallback

#### Scenario: Reject an obsolete menu selection

- **WHEN** a menu is opened and its project, planning target, session or detail change is replaced,
  or its target change is removed, before a workflow is selected
- **THEN** the old selection causes no new composition or launch request
- **AND** a newly opened menu can act on the new context

#### Scenario: Run in the created worktree session

- **WHEN** the user explicitly selects new-worktree Apply and the host creates its session
- **THEN** the ordinary local Apply prompt is sent only in that session as its first message
- **AND** the prompt contains no planning-root path, copying instruction, or special
  external-planning workflow

### Requirement: Select an Apply destination through a native menu

Ready and In Progress changes SHALL retain an Apply action menu on both board cards and detail.
The menu SHALL offer `Prepare in current chat` and `Run in new worktree`, using host-consistent
controls with keyboard operation and dismissal. Opening or dismissing it SHALL NOT compose, create
or send anything. Planning SHALL use Continue artifacts and Complete SHALL retain archive.
Unavailable changes and repeated worktree requests while pending SHALL be disabled. A stale Apply
destination selection SHALL NOT dispatch after the change ceases to be applicable. The separate
named Apply tasks workflow SHALL prepare a current-chat prompt only; it SHALL NOT implicitly choose
the worktree destination.

#### Scenario: Choose the current chat

- **WHEN** the user chooses Prepare in current chat from an applicable card or detail
- **THEN** the Apply prompt replaces the current composer draft without creating a session or worktree

#### Scenario: Dismiss or use the keyboard

- **WHEN** the user opens the menu with the keyboard and dismisses it without selecting a destination
- **THEN** focus returns to a usable invoking control and no workflow request occurs

#### Scenario: Reject stale selection

- **WHEN** an open Apply destination menu belongs to a removed change or a context or stage that has
  since been replaced
- **THEN** choosing either destination does not dispatch the obsolete action

### Requirement: Create a change scaffold from the board

The board SHALL offer `Create scaffold…` when an OpenSpec context is resolved. It SHALL open the
existing dialog asking for a change name and a goal. Names SHALL be lowercase letters or digits
separated by single hyphens, and the goal SHALL be required; invalid input SHALL be reported in
the dialog without a request. Creation SHALL make only the named scaffold with its recorded goal
in the originating context. Success SHALL close the dialog and reload the originating board. A
draft or attempt from one context SHALL NOT be submitted in a different context. The New change
workflow entry SHALL remain separate and SHALL NOT submit this dialog.

#### Scenario: Create a valid change

- **WHEN** the user submits a valid name and goal in the unchanged originating context
- **THEN** one scaffold with that goal is created, the dialog closes and the board reloads

#### Scenario: Reject invalid input

- **WHEN** the name is not hyphen-separated lowercase letters or digits, or the goal is empty
- **THEN** the dialog shows the error and no creation request occurs

### Requirement: Confirm bulk archiving from the board

The board SHALL retain Archive all beside Create scaffold…, using a native secondary button, an
archive icon and the same small control size. It SHALL target completed changes across the board,
independently of search filtering. The action SHALL be disabled without a resolved OpenSpec context,
while the board is loading, when no available Complete change is known, or while a launch is
pending. Activation SHALL open an accessible confirmation dialog explaining that it creates a new
session and submits a prompt, skips unfinished changes and leaves the board open. Controls SHALL
be labelled Cancel and Start archiving. Cancellation, including Escape, SHALL create no session
and submit no prompt. The separate Bulk archive workflow entry SHALL NOT bypass this shortcut's
confirmation or inherit its completed-only selection.

#### Scenario: Confirm or cancel

- **WHEN** the user activates Archive all
- **THEN** the dialog opens without creating a session or submitting a prompt
- **AND** only Start archiving authorizes the launch; Cancel or Escape dismisses it without effects

#### Scenario: Filtered or empty board

- **WHEN** search hides a completed change
- **THEN** search does not narrow the archive all operation
- **AND** a board without any available Complete change has a disabled archive all action
- **AND** that condition does not disable the interactive Bulk archive workflow menu entry

## REMOVED Requirements

### Requirement: Propose completes the existing scaffold

**Reason**: The special existing-scaffold Propose prompt conflicts with canonical new-change Propose
and hides the distinction between incremental planning and completing all planning artifacts.

**Migration**: Use Continue artifacts or Continue change for one next artifact of an existing change.
Use global Propose change or Fast-forward to start a new change with complete planning; do not
silently apply their new-change behavior to an existing scaffold.
