# OpenCode Clippy

A nostalgic Microsoft Office Clippy desktop widget that hooks into [OpenCode](https://opencode.ai) and reacts to your coding events with classic animations, proactive tips, and Lottie effects.

> "It looks like you're writing some code. Can I help?"

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)
![Electron](https://img.shields.io/badge/electron-33-green)
![License](https://img.shields.io/badge/license-MIT-brightgreen)

## Features

- **43 Clippy animations** from the original sprite sheet — Greeting, Thinking, Writing, Searching, Alert, Congratulate, and more
- **Proactive tips** in classic "It looks like you're trying to..." style — pattern-matches your coding activity and offers contextual suggestions
- **Lottie effects** — sparkles on success, confetti on congratulate, alert pulses, thinking dots, wave lines
- **Classic Windows 98 tooltip** — authentic `#FFFFE1` yellow speech bubble with sharp corners, `#808080` drop shadow, Tahoma font, and triangular tail
- **Task completion detection** — Clippy celebrates when OpenCode finishes a task (`session.idle`)
- **20 idle animations** — Clippy looks around, waves, gets artsy, checks things, and fidgets while you think
- **Cross-platform** — macOS, Windows, and Linux (Unix sockets on macOS/Linux, named pipes on Windows)
- **System tray** — tray icon with show/hide toggle, runs in background
- **Single instance** — only one Clippy widget runs at a time
- **Resilient IPC** — heartbeat, auto-reconnect, launch-order independent (start either side first)

## How It Works

The project has two parts:

1. **Desktop Widget** — an Electron app that renders Clippy with sprite animations, speech bubbles, and Lottie effects
2. **OpenCode Plugin** — a gateway that listens to OpenCode events and forwards them to the widget via IPC (Unix socket / named pipe)

They communicate over a local socket — no network, no ports, no firewall issues. Start them in any order; they auto-reconnect.

```
                    Unix Socket / Named Pipe
                    /tmp/opencode-clippy.sock
                              
OpenCode ──► Plugin (clippy.ts) ──────────────► Electron Widget
             events + tips engine               sprite canvas + speech bubble + lottie
```

## Installation

### 1. Clone and build

```bash
git clone https://github.com/huangcheng/opencode-clippy.git
cd opencode-clippy
npm install
npm run build
```

### 2. Register the plugin globally

Add the plugin to your OpenCode config so it loads from any project directory:

```bash
# macOS / Linux
vim ~/.config/opencode/opencode.json
```

Add to the `"plugin"` array:

```json
{
  "plugin": [
    "file:///path/to/opencode-clippy/.opencode/plugins/clippy.ts"
  ]
}
```

### 3. Start Clippy

```bash
# Terminal 1 — start the widget
npm start

# Terminal 2 — start OpenCode (in any project directory)
opencode
```

Clippy appears in the bottom-right corner and reacts to everything you do in OpenCode.

## Development

```bash
# Watch mode (rebuild on changes)
npm run dev

# Run the widget standalone
npm start

# Run the test harness (visual animation tester)
npx vite dev
# then open http://localhost:5173/test-harness.html

# Package for distribution
npm run package        # current platform
npm run package:mac    # macOS .dmg
npm run package:win    # Windows .exe
npm run package:linux  # Linux .AppImage/.deb
```

## Event Mappings

| OpenCode Event | Clippy Animation | Speech Bubble |
|---|---|---|
| Task complete (`session.idle`) | Congratulate | "All done! Ready for more." |
| AI responding (`message.updated`) | Thinking | "Working on it..." |
| AI streaming (`message.part.updated`) | Thinking | "Thinking..." |
| Code changed (`session.diff`) | Writing | "Changes detected!" |
| Reading files (`tool.execute.before` read) | Searching | "Reading files..." |
| Editing files (`tool.execute.before` edit) | Writing | "Making changes..." |
| Running commands (`tool.execute.before` bash) | GetTechy | "Running command..." |
| Tool success (`tool.execute.after`) | Congratulate | "Done!" |
| Tool error (`tool.execute.after` error) | Alert | "Oops, something went wrong!" |
| Permission needed (`permission.asked`) | GetAttention | "I need your permission!" |
| Permission granted (`permission.replied`) | Congratulate | "Thanks!" |
| Permission denied (`permission.replied` denied) | LookDown | "Okay, I won't do that." |
| Session start (`session.created`) | Greeting | "Hey! Let's write some code!" |
| Session end (`session.deleted`) | GoodBye | "See you next time!" |
| File saved (`file.edited`) | Save | "File saved!" |

## Proactive Tips

Clippy watches your coding patterns and offers help, just like the original:

| Pattern | Clippy Says |
|---|---|
| 3+ errors in 60 seconds | "It looks like you're running into errors!" |
| Reading test files | "It looks like you're working on tests!" |
| Editing config files (`.env`, `.json`, `.yaml`) | "It looks like you're editing configuration!" |
| First edit in a session | "It looks like you're about to make your first change!" |

Tips have a 5-minute cooldown per pattern to avoid nagging.

## Architecture

```
opencode-clippy/
├── .opencode/plugins/
│   └── clippy.ts              # OpenCode plugin — event gateway + tips engine
├── widget/
│   ├── main/main.ts           # Electron main — window, tray, IPC server
│   ├── preload/preload.ts     # Context bridge for IPC → renderer
│   └── renderer/
│       ├── index.html          # Widget layout (transparent, frameless)
│       ├── renderer.ts         # Main renderer — wires everything together
│       ├── animation-engine.ts # Canvas sprite renderer with priority queue
│       ├── event-mapping.ts    # OpenCode event → animation/tip mapping
│       ├── speech-bubble.ts    # Windows 98 tooltip (classic yellow)
│       └── lottie-effects.ts   # Lottie overlay (sparkles, confetti, etc.)
├── plugin/
│   └── tips-engine.ts         # Proactive tips pattern matching
├── assets/
│   ├── map.png                # Clippy sprite sheet (124×93px frames)
│   ├── animations.json        # Frame timing data (43 animations)
│   ├── icon.png               # Tray icon
│   └── lottie/                # Lottie effect JSONs
└── package.json
```

### IPC Protocol

Plugin → Widget communication uses newline-delimited JSON over Unix socket (`/tmp/opencode-clippy.sock`) or named pipe (`\\.\pipe\opencode-clippy` on Windows).

**Event message:**
```json
{"type": "event", "event": "message.part.updated"}
```

**Tip message:**
```json
{"type": "tip", "title": "It looks like you're running into errors!", "body": "Would you like me to suggest checking the error logs?", "animation": "GetAttention"}
```

**Heartbeat:**
```json
{"type": "ping"}
```

## Special Thanks

- **[felixrieseberg/clippy](https://github.com/felixrieseberg/clippy)** — Clippy sprite sheet assets (`map.png`, `animations.json`) and animation frame data. This project's sprite rendering is built directly on top of these lovingly extracted assets.
- **[panta82/opencode-notificator](https://github.com/panta82/opencode-notificator)** — Reference implementation for OpenCode plugin event handling. The `session.idle` detection pattern and session ID tracking approach were adapted from this project.
- **[OpenCode](https://opencode.ai)** — The AI coding assistant whose plugin system makes this possible. Plugin API docs at [opencode.ai/docs/plugins](https://opencode.ai/docs/zh-cn/plugins/).

## Credits

- Original Clippy character designed by **Kevan Atteberry** for Microsoft Office 97
- Lottie animations rendered with **[lottie-web](https://github.com/airbnb/lottie-web)** by Airbnb
- Desktop widget built with **[Electron](https://www.electronjs.org/)**
- Built with the assistance of **Claude Code** by Anthropic

## License

MIT
