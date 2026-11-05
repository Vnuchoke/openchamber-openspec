# Spec Delta

## MODIFIED Requirements

### Requirement: Open quickstart from the board header

The board SHALL expose a circled question-mark help button in its content header, styled like
OpenChamber's Walkthrough help control; change detail SHALL NOT show help. Its accessible name
SHALL be OpenSpec quickstart / Краткое руководство OpenSpec, with a localized outcome description.
It SHALL support keyboard activation and open exactly `https://openspec.dev/docs/quickstart`
through the host's URL-opening facility. Help SHALL remain available without a selected project
or with a load error. It SHALL NOT navigate the iframe, compose a prompt or change OpenSpec data.

#### Scenario: Open help from the board

- **WHEN** the user activates help on the board, in the sidebar or expanded page
- **THEN** the host receives the quickstart URL and the board retains its content
- **AND** opening change detail exposes no redundant help control

#### Scenario: Accessible help in an empty or narrow viewer

- **WHEN** the viewer has no selected project, a load error or a narrow width
- **THEN** help remains reachable by keyboard, has its localized accessible name and description,
  and does not cause whole-panel horizontal overflow

#### Scenario: Host cannot open help

- **WHEN** the host rejects opening the quickstart
- **THEN** the viewer reports the failure without changing the current view or reporting success
- **AND** owned feedback uses the UI language while an upstream diagnostic remains verbatim

#### Scenario: Translate without navigating

- **WHEN** the viewer changes language with its board help control focused
- **THEN** the same control retains focus and its accessible name changes to the selected language
- **AND** no URL-opening request occurs until the user activates it
