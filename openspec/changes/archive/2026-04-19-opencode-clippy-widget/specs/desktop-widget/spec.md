## ADDED Requirements

### Requirement: Widget renders as transparent always-on-top window
The Electron BrowserWindow SHALL be created with `transparent: true`, `frame: false`, `alwaysOnTop: true`, and `hasShadow: false`. The window background SHALL be fully transparent. This SHALL work on macOS, Windows, and Linux.

#### Scenario: Widget appears as floating Clippy
- **WHEN** the widget process starts
- **THEN** a frameless transparent window appears in the bottom-right corner of the screen showing Clippy in the RestPose animation

#### Scenario: Widget stays on top of other windows
- **WHEN** the user switches to another application
- **THEN** the Clippy widget remains visible above all other windows

### Requirement: Widget supports cross-platform transparent rendering
The widget SHALL detect whether the host OS supports transparent windows. On Linux without a compositing window manager, the widget SHALL fall back to a solid background color (#c0c0c0).

#### Scenario: Transparent window on macOS
- **WHEN** the widget starts on macOS
- **THEN** the window renders with full transparency

#### Scenario: Transparent window on Windows
- **WHEN** the widget starts on Windows
- **THEN** the window renders with full transparency

#### Scenario: Transparent window on Linux with compositor
- **WHEN** the widget starts on Linux with a compositing WM (GNOME, KDE, etc.)
- **THEN** the window renders with full transparency

#### Scenario: Fallback on Linux without compositor
- **WHEN** the widget starts on Linux without a compositing WM
- **THEN** the window renders with a solid #c0c0c0 background behind Clippy

### Requirement: Widget window is draggable
The user SHALL be able to click and drag Clippy to reposition the widget anywhere on screen.

#### Scenario: User drags Clippy
- **WHEN** the user clicks and drags on the Clippy sprite area
- **THEN** the widget window moves to follow the cursor

### Requirement: Widget window has appropriate size
The widget window SHALL be sized to accommodate the Clippy sprite (124x93px) plus the speech bubble area, approximately 300x250px total.

#### Scenario: Window dimensions match content
- **WHEN** the widget opens
- **THEN** the window is 300px wide and 250px tall with the sprite anchored at the bottom

### Requirement: Widget runs a WebSocket server
The widget SHALL start a WebSocket server on the port specified via CLI argument `--port`.

#### Scenario: Server starts on specified port
- **WHEN** the widget launches with `--port 9876`
- **THEN** a WebSocket server starts listening on `ws://localhost:9876`

### Requirement: Widget auto-closes without heartbeat
The widget SHALL close itself if no `ping` message is received for 10 seconds after the last ping.

#### Scenario: Heartbeat timeout triggers close
- **WHEN** 10 seconds pass without a `ping` message
- **THEN** the widget process exits gracefully

### Requirement: Widget positions at bottom-right on launch
The widget SHALL initially position itself at the bottom-right corner of the primary display, offset 50px from the edges.

#### Scenario: Initial positioning
- **WHEN** the widget opens for the first time
- **THEN** it appears at `(screenWidth - 300 - 50, screenHeight - 250 - 50)`
