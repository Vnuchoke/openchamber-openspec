# Spec Delta

## ADDED Requirements

### Requirement: Board search and actions fit without collision

The board SHALL keep the search input, its icon and clear control within the search container
without overlapping toolbar actions or causing horizontal page overflow. Controls SHALL wrap
before search becomes unusably narrow. This SHALL work in English and Russian, both themes,
without hiding overflow, clipping controls or hiding actions.

#### Scenario: Resize across the former collision range

- **WHEN** the board is displayed at 320, 560, 561, 580, 600 or 1076 CSS pixels in either language and theme
- **THEN** input bounds stay inside the search container and do not intersect action bounds
- **AND** input text, search/clear icons and action buttons remain visible and reachable
- **AND** the page has no horizontal overflow with empty or nonempty search

#### Scenario: Use long localized controls and clear search

- **WHEN** Russian controls and long change names are displayed at a narrow width
- **THEN** toolbar rows wrap without hiding actions, obscuring search or clipping focus indicators
- **AND** clearing search restores the same results and input focus as before
- **AND** opening Workflows keeps its final entry reachable without horizontal clipping

### Requirement: Workflows has a distinct information accent

All board, card and detail Workflows triggers SHALL use a consistent theme-aware information
accent, blue/cyan in the supported themes, distinct from primary and muted controls. Hover,
keyboard focus and disabled states SHALL remain recognizable and readable in both themes.
The treatment SHALL NOT recolour unrelated buttons or change menu activation or routing.

#### Scenario: Distinguish actions in each theme

- **WHEN** the viewer displays Workflows beside primary and muted actions in light or dark theme
- **THEN** the Workflows trigger has an information-tinted surface and readable information-colour text
- **AND** enabled text contrast is at least 4.5:1 and the focus/control boundaries are at least 3:1
- **AND** hover, focus-visible and disabled presentation are independently identifiable
- **AND** Apply destination controls and workflow menu rows retain their own styling and behaviour

## MODIFIED Requirements

### Requirement: Completion counts use readable wording

The viewer SHALL display artefact and task completion counts as `X of Y` in English and `X из Y`
in Russian, not `X/Y`, with appropriate noun forms. This wording SHALL apply to card artefact
labels, card task progress, the board task tally and detail task progress. The progress summary
in a prepared Apply prompt SHALL remain English `X of Y`. Counts, percentages and stage derivation
SHALL retain their existing meaning. Single-total tab counts and empty-state meaning remain unchanged.

#### Scenario: Show progress across the viewer

- **WHEN** a change has four applicable artefacts, four completed artefacts, thirteen tasks, and two
  completed tasks
- **THEN** its English card shows `4 of 4 artefacts` and `2 of 13 tasks complete`
- **AND** the Tasks view, board tally, and prepared Apply progress summary use `of` between
  completed and total task counts
- **AND** formatting does not change the counts or stage

#### Scenario: Show Russian count forms without changing data

- **WHEN** Russian is active with totals 0, 1, 2, 5, 11, 21 or 22
- **THEN** visible completion uses `из` and the appropriate Russian task, artifact or change noun form
- **AND** switching back to English restores `of` without changing totals, percentages or stage
- **AND** prepared prompt text remains unchanged in either UI language

### Requirement: Detail heading supports copying the change name

The viewer SHALL display an always-visible copy icon button immediately beside the change name in
the detail view. The button SHALL have the accessible label `Copy change name` in English or
`Копировать имя изменения` in Russian, a localized outcome description, and support pointer and
keyboard activation. Activation SHALL copy the exact displayed change ID at the time of activation,
without quotes, Markdown, paths or workflow commands. Copying SHALL NOT alter the chat composer,
send a message or request fresh change data.

#### Scenario: Copy the displayed name

- **WHEN** the user activates Copy change name while viewing `add-copy-to-change-name`
- **THEN** the viewer requests copying exactly `add-copy-to-change-name` to the clipboard
- **AND** the chat composer and sent messages remain unchanged
- **AND** the viewer makes no additional change-data requests

#### Scenario: Copy with the keyboard

- **WHEN** the user focuses Copy change name and activates it with Enter or Space
- **THEN** the viewer requests copying the displayed change ID

#### Scenario: Switch changes

- **WHEN** the user opens a different change and activates Copy change name
- **THEN** the viewer requests copying the newly displayed change ID rather than the previous ID

#### Scenario: Copy while change data is unavailable

- **WHEN** a detail view retains its heading during refresh or after the change becomes unavailable
- **THEN** Copy change name remains available for copying that displayed ID

#### Scenario: Translate copy without changing its target

- **WHEN** the interface changes to Russian while the copy control is focused
- **THEN** that control retains focus and exposes `Копировать имя изменения`
- **AND** subsequent activation copies the same exact change ID

### Requirement: Copy feedback reflects the clipboard result

The viewer SHALL show a success toast with `Change name copied` in English or
`Имя изменения скопировано` in Russian only after the clipboard operation succeeds. A failed
clipboard operation SHALL show an error toast, SHALL NOT show success feedback, and SHALL allow
retry through the same button. Extension-owned feedback SHALL use the current UI language;
raw upstream diagnostics remain verbatim. The viewer SHALL NOT retry clipboard writes automatically.

#### Scenario: Successful clipboard write

- **WHEN** a requested clipboard write succeeds
- **THEN** the viewer shows a success toast containing `Change name copied` in English or
  `Имя изменения скопировано` in Russian

#### Scenario: Failed clipboard write and retry

- **WHEN** a requested clipboard write fails
- **THEN** the viewer shows an error toast without success feedback
- **AND** no further clipboard write occurs until the user activates the button again
- **AND** another activation can copy the displayed change name successfully
