## ADDED Requirements

### Requirement: Event-to-animation mapping table
The system SHALL maintain a static mapping from OpenCode event types to Clippy animation names, priority levels, and optional tip text.

#### Scenario: Known event maps to animation
- **WHEN** the widget receives a `session.created` event
- **THEN** it looks up the mapping and plays `Greeting` with tip "Hey! Let's write some code!"

### Requirement: Complete event mapping coverage
The system SHALL define mappings for the following OpenCode events:

| Event | Animation | Priority | Tip |
|---|---|---|---|
| `session.created` | Greeting | high | "Hey! Let's write some code!" |
| `session.idle` | IdleSnooze | normal | null |
| `session.deleted` | GoodBye | high | "See you next time!" |
| `tool.execute.before` (read) | Searching | normal | "Reading files..." |
| `tool.execute.before` (edit) | Writing | normal | "Making changes..." |
| `tool.execute.before` (bash) | GetTechy | normal | "Running command..." |
| `tool.execute.after` (success) | Congratulate | normal | "Done!" |
| `tool.execute.after` (error) | Alert | high | "Oops, something went wrong!" |
| `message.part.updated` | Thinking | normal | "Thinking..." |
| `permission.asked` | GetAttention | high | "I need your permission!" |
| `permission.replied` (granted) | Congratulate | normal | "Thanks!" |
| `permission.replied` (denied) | LookDown | normal | "Okay, I won't do that." |
| `file.edited` | Save | normal | "File saved!" |

#### Scenario: Tool-specific animation selection
- **WHEN** a `tool.execute.before` event arrives with tool name "read"
- **THEN** the Searching animation plays with tip "Reading files..."

#### Scenario: Error tool execution shows alert
- **WHEN** a `tool.execute.after` event arrives with an error result
- **THEN** the Alert animation plays with priority `high` and tip "Oops, something went wrong!"

### Requirement: Unknown events fall back to default
The system SHALL use `IdleEyeBrowRaise` as the fallback animation for any unmapped event, with no tip text.

#### Scenario: Unmapped event triggers fallback
- **WHEN** the widget receives an event type not in the mapping table
- **THEN** it plays `IdleEyeBrowRaise` with no speech bubble

### Requirement: Event debouncing for rapid events
The system SHALL debounce events of the same type within a 500ms window, keeping only the last occurrence, unless the event has `high` priority.

#### Scenario: Rapid tool events debounced
- **WHEN** 10 `tool.execute.before` events arrive within 500ms
- **THEN** only the last event triggers an animation

#### Scenario: High-priority events not debounced
- **WHEN** 3 `permission.asked` events arrive within 500ms
- **THEN** each event triggers its animation (queued)
