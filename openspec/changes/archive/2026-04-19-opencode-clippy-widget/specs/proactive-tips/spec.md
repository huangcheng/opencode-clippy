## ADDED Requirements

### Requirement: Plugin maintains a sliding event window
The plugin SHALL maintain a circular buffer of the last 20 events (or events within the last 30 seconds, whichever is smaller) for pattern matching.

#### Scenario: Event window captures recent activity
- **WHEN** 25 events have occurred in the last 30 seconds
- **THEN** the event window contains only the most recent 20 events

#### Scenario: Old events expire from window
- **WHEN** the oldest event in the window is more than 30 seconds old
- **THEN** it is removed from the window on the next event arrival

### Requirement: Pattern matcher generates proactive tips
The plugin SHALL run a set of pattern matchers against the event window on each new event. When a pattern matches, the plugin SHALL send a tip message to the widget with a title, body, and associated animation.

#### Scenario: Error pattern triggers tip
- **WHEN** 3 or more `tool.execute.after` events with error results occur within 60 seconds
- **THEN** the plugin sends a tip: title "It looks like you're running into errors!", body "Would you like me to suggest checking the error logs?", animation GetAttention

#### Scenario: Test file pattern triggers tip
- **WHEN** a `tool.execute.before` (read) event targets a file matching `*.test.*`, `*.spec.*`, or `__tests__/*`
- **THEN** the plugin sends a tip: title "It looks like you're working on tests!", body "Remember to run them after making changes."

#### Scenario: Rapid edits pattern triggers tip
- **WHEN** 3 or more `file.edited` events target the same file within 30 seconds
- **THEN** the plugin sends a tip: title "It looks like you're making lots of changes!", body "Don't forget to save your progress."

#### Scenario: Git commands pattern triggers tip
- **WHEN** a `tool.execute.before` (bash) event contains a git command (git commit, git push, git checkout, etc.)
- **THEN** the plugin sends a tip: title "It looks like you're working with git!", body "Make sure to commit before switching branches."

#### Scenario: Idle after session start triggers tip
- **WHEN** no events (other than session.created) have occurred for 15 seconds after session start
- **THEN** the plugin sends a tip: title "It looks like you're thinking about where to start!", body "Try describing your task to OpenCode."

#### Scenario: Repeated permission denials trigger tip
- **WHEN** 2 or more `permission.replied` (denied) events occur within 60 seconds
- **THEN** the plugin sends a tip: title "It looks like you're being cautious with permissions!", body "You can configure auto-approve for safe operations."

#### Scenario: First edit in session triggers tip
- **WHEN** the first `tool.execute.before` (edit) event occurs in a session
- **THEN** the plugin sends a tip: title "It looks like you're about to make your first change!", body "I'll keep an eye on things."

#### Scenario: Config file edit triggers tip
- **WHEN** a `file.edited` event targets a file matching `*.env*`, `*.json`, `*.yaml`, `*.yml`, `*.toml`, or `*.config.*`
- **THEN** the plugin sends a tip: title "It looks like you're editing configuration!", body "Double-check for typos — config errors can be sneaky."

### Requirement: Tips have per-pattern cooldown
Each tip pattern SHALL have a 5-minute cooldown. After a pattern triggers a tip, the same pattern SHALL NOT trigger again until 5 minutes have elapsed.

#### Scenario: Cooldown prevents nagging
- **WHEN** the error pattern triggers a tip at T=0
- **AND** the error pattern matches again at T=2 minutes
- **THEN** no tip is sent for the second match

#### Scenario: Cooldown expires
- **WHEN** the error pattern triggered a tip at T=0
- **AND** the error pattern matches again at T=6 minutes
- **THEN** a new tip is sent

### Requirement: Widget renders proactive tips in classic Clippy style
The widget SHALL render proactive tips in the speech bubble with a distinct layout: bold title line (the "It looks like you're..." text), followed by body text with the suggestion. The bubble SHALL be wider (max-width 300px) for tips and include a close (x) button.

#### Scenario: Tip renders with title and body
- **WHEN** the widget receives a tip message with title "It looks like you're running into errors!" and body "Would you like me to suggest checking the error logs?"
- **THEN** the speech bubble shows the title in bold on the first line, the body on subsequent lines, and a close button in the top-right corner

#### Scenario: Tip uses GetAttention animation
- **WHEN** a proactive tip is displayed
- **THEN** the Clippy GetAttention animation plays first, followed by the Explain animation while the tip remains visible

### Requirement: Tips auto-dismiss after 8 seconds
Proactive tips SHALL auto-dismiss after 8 seconds (longer than regular status tips) since they contain more content to read.

#### Scenario: Tip auto-dismisses
- **WHEN** a proactive tip appears
- **THEN** it auto-dismisses with the speech bubble pop-out animation after 8 seconds

#### Scenario: User dismisses tip early
- **WHEN** the user clicks the close button on a proactive tip
- **THEN** the tip dismisses immediately with the pop-out animation
