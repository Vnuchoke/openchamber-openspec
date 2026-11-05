# Spec Delta

## ADDED Requirements

### Requirement: Localized planning presentation preserves incremental Continue

The Planning primary action SHALL be Continue planning / Продолжить планирование on cards and
detail. It SHALL retain the existing `openspec-continue-change` prompt for at most one next
planning artifact of the existing change, preserving its goal and decisions without new-change
creation or implementation. UI language SHALL NOT change workflow IDs, prompt text or routing.

#### Scenario: Continue planning from either surface

- **WHEN** a user activates Continue planning or Продолжить планирование on a Planning card or detail
- **THEN** the same existing-change Continue prompt is prepared unsent with at most one next artifact
- **AND** the recorded goal remains exact and missing goals are not fabricated or automatically written
- **AND** neither the extension nor the prompt substitutes old existing-scaffold Propose behaviour

#### Scenario: Translate without changing any workflow request

- **WHEN** each global or change workflow is activated in English and Russian for identical context
- **THEN** its skill mapping and prepared prompt payload are identical across UI languages
- **AND** Apply destination selection, global Bulk archive and confirmed Archive all remain distinct
- **AND** no current-chat action gains an implicit send, session launch or worktree creation

#### Scenario: Preserve obsolete-action rejection

- **WHEN** a localized menu or quick action has an obsolete project, planning target, session,
  change or stage where that quick action requires it
- **THEN** the existing guard rejects dispatch just as in English before localization
- **AND** a mere language change does not replace its captured context or grant permission

## MODIFIED Requirements

### Requirement: Use OpenSpec workflow vocabulary consistently

Cards and detail SHALL label the Planning primary action Continue planning / Продолжить
планирование, ready and in-progress actions Apply / Выполнить, and completed action Archive /
Архивировать. Secondary Verify / Проверить SHALL remain independent of archive. Stage and standard
artifact display labels SHALL follow the selected language; custom identifiers remain unchanged.
Refresh / Обновить SHALL remain a manual read. These are presentations of existing CLI-derived
progress, not persisted states. Canonical Propose remains a global new-change workflow, not an
instruction to create another copy of an existing scaffold.

#### Scenario: Match actions across board and detail

- **WHEN** a user views a change in each of the four stages and opens its detail in either language
- **THEN** the primary labels match on both surfaces and call `openspec-continue-change`,
  `openspec-apply-change`, `openspec-apply-change` and `openspec-archive-change` respectively
- **AND** Complete exposes secondary Verify / Проверить calling `openspec-verify-change`
  independently of Archive / Архивировать
- **AND** stage headings are Planning / Планирование, Ready / Готово к выполнению,
  In Progress / В работе and Complete / Завершено
- **AND** standard display names are Proposal / Предложение, Specs / Спецификации,
  Design / Проектирование and Tasks / Задачи without translating their IDs
- **AND** no action is labelled merely continue when it actually resumes implementation through Apply
