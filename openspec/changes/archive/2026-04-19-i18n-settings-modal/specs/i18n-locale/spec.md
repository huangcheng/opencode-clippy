## ADDED Requirements

### Requirement: Locale registry with en and zh-CN
The system SHALL provide translation dictionaries for English (`en`) and Simplified Chinese (`zh-CN`) covering all user-facing strings: speech bubble tips, click/double-click reactions, event mapping tips, tray menu labels, about dialog text, and settings modal labels.

#### Scenario: English locale loaded by default
- **WHEN** no language preference is saved in config
- **THEN** the system uses `en` as the default locale

#### Scenario: Chinese locale loaded from config
- **WHEN** config contains `language: "zh-CN"`
- **THEN** all user-facing strings display in Simplified Chinese

### Requirement: Translation lookup function
The system SHALL provide a `t(key)` function that returns the translated string for the current locale, falling back to the English value if the key is missing in the active locale.

#### Scenario: Key exists in current locale
- **WHEN** `t("greeting")` is called with locale set to `zh-CN`
- **THEN** the Chinese translation is returned

#### Scenario: Key missing in current locale
- **WHEN** `t("someKey")` is called and the key does not exist in `zh-CN`
- **THEN** the English value for `someKey` is returned

### Requirement: Runtime locale switching
The system SHALL allow changing the locale at runtime without restarting the app. All subsequently displayed strings SHALL use the new locale.

#### Scenario: User switches language in settings
- **WHEN** user changes language from English to Chinese in the settings modal
- **THEN** new speech bubbles, tips, and tray menu labels use Chinese strings immediately

### Requirement: Tray menu labels are translated
The tray menu labels (Settings, About, Exit) SHALL update to the selected language when the locale changes.

#### Scenario: Tray menu in Chinese
- **WHEN** locale is `zh-CN`
- **THEN** tray menu shows "设置", "关于", "退出"
