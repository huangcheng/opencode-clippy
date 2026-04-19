## ADDED Requirements

### Requirement: Lottie effects layer renders above Clippy sprite
The widget SHALL include a Lottie rendering layer (using `lottie-web`) positioned as an overlay on top of the Canvas sprite area, allowing vector effects to play around and above the Clippy character.

#### Scenario: Lottie layer composites correctly over sprite
- **WHEN** a Lottie effect triggers while a Clippy sprite animation is playing
- **THEN** the Lottie effect renders on top of the sprite without obscuring or interfering with the character animation

### Requirement: Sparkles effect on successful tool execution
The system SHALL play a `sparkles.json` Lottie animation (gold sparkle particles radiating outward) around Clippy when a `tool.execute.after` event indicates success.

#### Scenario: Success sparkles play
- **WHEN** a `tool.execute.after` event arrives with a success result
- **THEN** the sparkles Lottie animation plays once around the Clippy sprite area

### Requirement: Confetti effect on congratulate
The system SHALL play a `confetti.json` Lottie animation (colorful confetti burst) when the Congratulate Clippy animation triggers.

#### Scenario: Confetti burst on congratulate
- **WHEN** the Congratulate animation plays
- **THEN** the confetti Lottie animation plays once, centered above Clippy

### Requirement: Alert pulse effect on high-priority events
The system SHALL play an `alert-pulse.json` Lottie animation (red pulsing ring) around Clippy when a high-priority event triggers (Alert animation, permission.asked).

#### Scenario: Alert pulse on permission request
- **WHEN** a `permission.asked` event arrives
- **THEN** the alert-pulse Lottie animation plays, looping until the permission is resolved or the next animation starts

### Requirement: Thinking dots effect during processing
The system SHALL play a `thinking-dots.json` Lottie animation (animated ellipsis dots) near the speech bubble area when Clippy is in the Thinking or Processing animation.

#### Scenario: Thinking dots during tool execution
- **WHEN** the Thinking animation plays due to `message.part.updated`
- **THEN** the thinking-dots Lottie animation loops near the speech bubble until the next event arrives

### Requirement: Wave lines effect on greeting and goodbye
The system SHALL play a `wave-lines.json` Lottie animation (radiating wave lines) around Clippy during the Greeting and GoodBye animations.

#### Scenario: Wave lines on session start
- **WHEN** the Greeting animation plays on `session.created`
- **THEN** the wave-lines Lottie animation plays once around the sprite

### Requirement: Lottie effects are non-blocking
Lottie effects SHALL NOT block or delay Clippy sprite animations. Effects play independently and are fire-and-forget for single-play effects, or auto-stop when the triggering Clippy animation ends.

#### Scenario: Effect does not delay next sprite animation
- **WHEN** a sparkles effect is still playing and a new event triggers a different Clippy animation
- **THEN** the sparkles effect stops immediately, the new Clippy animation starts without delay, and any new associated effect begins

### Requirement: Lottie JSON assets are bundled
All Lottie JSON effect files SHALL be bundled in the `assets/lottie/` directory and loaded at widget startup. The set of bundled effects SHALL include: `sparkles.json`, `confetti.json`, `alert-pulse.json`, `thinking-dots.json`, `speech-pop.json`, `wave-lines.json`.

#### Scenario: All Lottie assets load at startup
- **WHEN** the widget starts
- **THEN** all 6 Lottie JSON files are loaded into memory and ready for instant playback
