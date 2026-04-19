## ADDED Requirements

### Requirement: Drag to reposition widget
Users SHALL be able to click and drag the Clippy widget to any position on screen.

#### Scenario: User drags Clippy to new position
- **WHEN** user clicks and holds on the Clippy canvas and moves the mouse
- **THEN** the widget window follows the mouse cursor in real time

#### Scenario: Drag starts from canvas area
- **WHEN** user clicks on the speech bubble area (not the canvas)
- **THEN** dragging does not start; only the canvas area is draggable

### Requirement: Drag animation
Clippy SHALL play a movement animation while being dragged and a settle animation when released.

#### Scenario: Animation during drag
- **WHEN** user starts dragging Clippy
- **THEN** Clippy plays a drag animation (e.g., GestureDown or a looping idle)

#### Scenario: Animation on drop
- **WHEN** user releases the mouse after dragging
- **THEN** Clippy plays a settle animation (e.g., LookDown then RestPose)

### Requirement: Persist window position
The widget SHALL save its screen position to `~/.opencode-clippy/config.json` and restore it on startup.

#### Scenario: Position saved after drag
- **WHEN** user releases the mouse after dragging to a new position
- **THEN** the new x,y coordinates are written to `~/.opencode-clippy/config.json`

#### Scenario: Position restored on startup
- **WHEN** the Clippy widget launches and `~/.opencode-clippy/config.json` contains saved position
- **THEN** the widget opens at the saved position instead of the default bottom-right corner

#### Scenario: No saved position
- **WHEN** the Clippy widget launches and no config file exists or has no position
- **THEN** the widget opens at the default bottom-right corner position
