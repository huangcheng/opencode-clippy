## Why

OpenCode is a powerful terminal-based AI coding assistant, but its interface is purely text. Adding a nostalgic Clippy desktop widget that reacts to OpenCode events creates a fun, visual companion that surfaces contextual tips and animations — making the coding experience more engaging and providing at-a-glance status awareness outside the terminal.

## What Changes

- New OpenCode plugin (`.opencode/plugins/clippy.ts`) that subscribes to OpenCode events (session, tool, message, permission, idle)
- Standalone Electron desktop widget rendering Clippy sprite animations in an always-on-top transparent window (cross-platform: macOS, Windows, Linux)
- Event-to-animation mapping: OpenCode events trigger corresponding Clippy animations (e.g., `session.created` → Greeting, `tool.execute.before` → Thinking, `session.idle` → IdleSnooze)
- Speech bubble overlay showing contextual tips and status messages, with Lottie-powered entrance/exit animations
- Proactive contextual tips in classic Clippy style ("It looks like you're trying to...") — the plugin analyzes OpenCode events (tool patterns, error sequences, repeated actions) and generates helpful suggestions
- Lottie UI effects layer for event reactions (sparkles on success, confetti on congratulate, alert pulse, etc.)
- IPC bridge between the OpenCode plugin and the Electron widget via local WebSocket
- Uses sprite assets from [felixrieseberg/clippy](https://github.com/felixrieseberg/clippy) (42 animations including Greeting, Thinking, Writing, Searching, Alert, Congratulate, etc.)

## Capabilities

### New Capabilities
- `plugin-core`: OpenCode plugin that hooks into events and forwards them to the widget via WebSocket
- `desktop-widget`: Electron-based always-on-top transparent window rendering Clippy sprite animations (macOS, Windows, Linux)
- `animation-engine`: Sprite sheet animation system using the Clippy animation assets (map.png + animations.json)
- `event-mapping`: Mapping layer between OpenCode events and Clippy animations/tips
- `speech-bubble`: Tooltip/speech bubble UI showing contextual messages and tips
- `proactive-tips`: Classic Clippy-style contextual tip engine — pattern matching on OpenCode events to generate "It looks like you're trying to..." suggestions
- `lottie-effects`: Lottie animation layer for UI effects (speech bubble transitions, success sparkles, error pulses, confetti)

### Modified Capabilities

## Impact

- **New dependency**: Electron (for the desktop widget process)
- **New dependency**: `ws` (WebSocket for plugin↔widget IPC)
- **New dependency**: `lottie-web` (Lottie animation renderer for UI effects)
- **Asset files**: Clippy sprite sheet (map.png) and animation data (animations.json) from felixrieseberg/clippy
- **Plugin registration**: `.opencode/plugins/clippy.ts` auto-loaded by OpenCode
- **System resources**: Lightweight Electron window (~30-50MB RAM) running alongside OpenCode
