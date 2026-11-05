# Spec Delta

## Purpose

Let users select English or Russian independently of OpenChamber while preserving retained viewer
state, original planning content and the existing workflow and mutation boundaries.

## ADDED Requirements

### Requirement: Choose a persistent interface language

The viewer SHALL offer Language / Язык on board and detail, including without a usable project.
Choices SHALL be Like OpenChamber / Как в OpenChamber, English and Русский. A successful explicit
choice SHALL persist for the extension and take effect without reload. A new mount SHALL restore
the saved choice; already-open viewers need not synchronize with each other.

#### Scenario: Restore and replace a preference

- **WHEN** the user chooses Русский and saving succeeds
- **THEN** the current viewer uses Russian and a newly mounted viewer restores Russian
- **AND** selecting English later changes only extension presentation, not the host language

#### Scenario: Choose a language without board data

- **WHEN** no project is selected or the board failed to load
- **THEN** the language control remains available without requiring a successful board read
- **AND** changing language does not retry the failed board load

### Requirement: Automatic language follows the latest host locale

Without a saved preference the viewer SHALL use automatic mode. Automatic mode SHALL resolve
Russian language tags to Russian and English or unsupported tags to English. Subsequent host
locale updates SHALL affect automatic mode only. The document language SHALL identify the resolved
English or Russian language for accessibility.

#### Scenario: Host changes language in automatic mode

- **WHEN** automatic mode receives en-AU, then ru-RU, then an unsupported or malformed locale
- **THEN** the viewer uses English, then Russian, then English without an error for unsupported locale
- **AND** case differences in the Russian language subtag do not prevent Russian resolution

#### Scenario: Explicit choice overrides the host

- **WHEN** English or Русский is selected and the host changes language or theme
- **THEN** the explicit language remains selected and the theme still updates normally

### Requirement: Preference failures do not corrupt language state

The viewer SHALL keep the board usable during preference loading or saving and SHALL allow only
one preference operation at a time. Invalid saved values and read failures SHALL show a warning
and use automatic mode without rewriting storage. Failed writes SHALL keep the committed choice,
show a warning and require fresh intent before another write. Disposed viewers SHALL ignore late
preference responses.

#### Scenario: Initial preference read is delayed

- **WHEN** the initial read is pending while the board loads and host locale changes
- **THEN** the board remains usable in automatic mode using the latest locale
- **AND** the user cannot submit a preference until that read settles

#### Scenario: Saved preference is invalid or cannot be read

- **WHEN** storage returns null, an unsupported value or a read rejection
- **THEN** a localized warning distinguishes invalid data from a failed read
- **AND** automatic mode is usable without a storage write or automatic retry
- **AND** a missing saved value instead uses automatic mode without a warning

#### Scenario: Write is pending or rejected

- **WHEN** a new preference is saving
- **THEN** further selections cannot dispatch another write and the focused control retains focus
- **AND** success applies the choice, while rejection restores the prior displayed choice and language
- **AND** no warning, rerender or write retry is delivered after the viewer is disposed

### Requirement: Translate owned presentation without translating user content

The viewer SHALL translate its labels, descriptions, accessible names, counters, dialog validation,
notices and newly emitted feedback into the resolved language. Standard artifact display names
SHALL translate while IDs, custom artifact names, goals, documents, task text, paths and raw
upstream diagnostics remain unchanged. Host-owned UI retains host language; already displayed
host toasts need not change retroactively.

#### Scenario: Read the Russian interface

- **WHEN** Russian is active on board, detail, tasks, a dialog or a workflow menu
- **THEN** owned static and dynamic labels, readiness, empty/loading/error text and descriptions use Russian
- **AND** standard artifact names translate while custom IDs and displayed source text remain exact
- **AND** an existing owned notice or validation message changes language without rerunning its operation

#### Scenario: Preserve diagnostic evidence and host ownership

- **WHEN** the viewer reports a raw CLI, service or SDK error within localized feedback
- **THEN** the diagnostic remains verbatim and extension-owned surrounding text uses the chosen language
- **AND** host-owned Copy/OK controls may use a different language from the extension override
- **AND** locally generated viewer errors are translated rather than misclassified as upstream text

#### Scenario: Keep search clearing accessible

- **WHEN** the user enters or clears search, changes language or receives a theme update
- **THEN** the clear control has the current accessible name Clear search / Очистить поиск
- **AND** clearing by pointer or Escape retains the existing filtering and focus behaviour

### Requirement: Language updates retain interface state and request boundaries

Language-only updates SHALL preserve mounted shells, search value/caret, focused control, text
selection, selected change/artifact, document expansion and scroll, and dialog drafts and operation
states. They SHALL NOT reload board/documents/tasks, dispatch workflows, repeat writes or change
the current composer. Open menus SHALL retain their active entry and captured action context.

#### Scenario: Update retained board and detail

- **WHEN** language changes with an active search or a selected and scrolled document
- **THEN** values, input selection, document text selection, selected artifact and scroll remain intact
- **AND** no listing, summary, task or document request is added and unchanged source is not rerendered
- **AND** returning to the board preserves its search and scroll state

#### Scenario: Preserve keyboard navigation

- **WHEN** a host-locale update occurs in automatic mode with a menu open or a nonselected artifact tab focused
- **THEN** the same workflow entry or artifact control retains active/focused identity
- **AND** selection and Escape dismissal still work without dispatching an unrelated action
- **AND** existing stale-context rejection remains effective after translation

#### Scenario: Preserve a modal operation

- **WHEN** host locale changes with a create, delete or archive dialog open
- **THEN** the dialog stays open with the same focused field, draft values, validation and attempt state
- **AND** no creation, deletion, reconciliation or session launch occurs just because language changed

### Requirement: Language changes preserve tooltip interaction rules

Translated ordinary descriptions SHALL retain owner-hover-only visibility and immediate pointer-exit
dismissal; focus alone SHALL NOT show or retain them. Inline Workflows descriptions SHALL retain
pointer and keyboard activation, and open Workflows menus SHALL suppress ordinary descriptions.

#### Scenario: Inspect translated descriptions

- **WHEN** a user hovers a Russian ordinary button and leaves it for its description rectangle
- **THEN** the description disappears immediately even while its owner retains focus
- **AND** focusing it without hover shows no ordinary description

#### Scenario: Translate an open Workflows list

- **WHEN** host locale changes in automatic mode while Workflows is open
- **THEN** the active entry exposes its current translated inline description without stale text
- **AND** pointer and keyboard navigation remain usable and no ordinary tooltip appears outside the list
