## ADDED Requirements

### Requirement: Settings modal opened from tray menu
The tray menu SHALL have a "Settings" item that opens a modal window in the renderer.

#### Scenario: User clicks Settings in tray menu
- **WHEN** user clicks "Settings" in the tray context menu
- **THEN** a settings modal appears overlaid on the Clippy widget

### Requirement: Language selector in settings
The settings modal SHALL include a language dropdown with available locales (English, 简体中文).

#### Scenario: User selects Chinese
- **WHEN** user selects "简体中文" from the language dropdown
- **THEN** the language preference is saved to config and the locale switches immediately

### Requirement: Launch at Login toggle in settings
The settings modal SHALL include a "Launch at Login" checkbox that replaces the tray menu checkbox.

#### Scenario: User enables auto-start
- **WHEN** user checks the "Launch at Login" checkbox in settings
- **THEN** the app registers as a login item and saves `autoStart: true` to config

#### Scenario: User disables auto-start
- **WHEN** user unchecks the "Launch at Login" checkbox in settings
- **THEN** the app unregisters as a login item and saves `autoStart: false` to config

### Requirement: Settings modal dismissal
The settings modal SHALL be dismissable by clicking outside it or clicking a close button.

#### Scenario: User clicks outside modal
- **WHEN** the settings modal is open and user clicks outside of it
- **THEN** the modal closes

### Requirement: Settings persisted to config
All settings changes SHALL be immediately persisted to `~/.opencode-clippy/config.json`.

#### Scenario: Config updated on change
- **WHEN** user changes any setting
- **THEN** `config.json` is updated with the new value within 500ms
