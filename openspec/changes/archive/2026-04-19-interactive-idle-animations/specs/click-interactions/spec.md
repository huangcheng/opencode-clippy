## ADDED Requirements

### Requirement: Single click triggers reaction
Clicking the Clippy canvas SHALL interrupt any idle animation and play a random reaction animation with a speech bubble tip.

#### Scenario: User clicks Clippy while idle
- **WHEN** user single-clicks the Clippy sprite canvas
- **THEN** Clippy plays a reaction animation (e.g., Wave, Greeting, GetAttention) and shows a random fun tip in the speech bubble

#### Scenario: User clicks Clippy during event animation
- **WHEN** user single-clicks while an event-driven animation is playing
- **THEN** the click is ignored and the event animation continues uninterrupted

### Requirement: Double-click triggers special animation
Double-clicking the Clippy canvas SHALL play a special/dramatic animation sequence.

#### Scenario: User double-clicks Clippy
- **WHEN** user double-clicks the Clippy sprite canvas
- **THEN** Clippy plays a dramatic animation (e.g., GetWizardy, GetArtsy, EmptyTrash) with a special speech bubble message

### Requirement: Click reactions have cooldown
Click reactions SHALL have a short cooldown to prevent spamming animations.

#### Scenario: Rapid clicking is throttled
- **WHEN** user clicks Clippy multiple times within 1 second
- **THEN** only the first click triggers a reaction; subsequent clicks within the cooldown are ignored
