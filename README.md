# OpenCode Clippy

A Microsoft Office Clippy desktop widget that hooks into [OpenCode](https://opencode.ai) and reacts to coding events with classic Clippy animations, proactive tips, and Lottie effects.

## Features

- **42 Clippy animations** from the original sprite sheet — Greeting, Thinking, Writing, Searching, Alert, and more
- **Proactive tips** in classic "It looks like you're trying to..." style — analyzes your coding patterns and offers contextual suggestions
- **Lottie effects** — sparkles on success, confetti on congratulate, alert pulses, thinking dots
- **Classic Windows 98 tooltip** — authentic `#FFFFE1` yellow speech bubble with sharp corners and drop shadow
- **Cross-platform** — macOS, Windows, and Linux
- **Zero-config** — installs as an OpenCode plugin, Clippy appears automatically

## Installation

1. Clone this repo into your project:
   ```bash
   git clone https://github.com/your-username/opencode-clippy.git
   cd opencode-clippy
   npm install
   ```

2. Build the widget:
   ```bash
   npm run build
   ```

3. Copy the plugin to your project's OpenCode plugins directory:
   ```bash
   cp .opencode/plugins/clippy.ts /path/to/your/project/.opencode/plugins/
   ```

4. Start OpenCode — Clippy will appear automatically!

## Development

```bash
# Watch mode (rebuild on changes)
npm run dev

# Run the widget standalone
npm start

# Package for distribution
npm run package        # current platform
npm run package:mac    # macOS .dmg
npm run package:win    # Windows .exe
npm run package:linux  # Linux .AppImage/.deb
```

## Event Mappings

| OpenCode Event | Clippy Animation | Tip |
|---|---|---|
| Session start | Greeting | "Hey! Let's write some code!" |
| Reading files | Searching | "Reading files..." |
| Editing files | Writing | "Making changes..." |
| Running commands | GetTechy | "Running command..." |
| Thinking | Thinking | "Thinking..." |
| Task complete | Congratulate | "Done!" |
| Error | Alert | "Oops, something went wrong!" |
| Permission needed | GetAttention | "I need your permission!" |
| Session end | GoodBye | "See you next time!" |
| Idle | IdleSnooze | — |

## Proactive Tips

Clippy watches your coding patterns and offers help:

- 3+ errors in a row → "It looks like you're running into errors!"
- Working on test files → "It looks like you're working on tests!"
- Editing config files → "It looks like you're editing configuration!"
- Git commands → "It looks like you're working with git!"
- And more...

## Architecture

```
.opencode/plugins/clippy.ts  → OpenCode plugin (event hooks + tips engine)
        ↓ WebSocket
widget/main/main.ts          → Electron main process (transparent window)
widget/renderer/              → Canvas sprite engine + Lottie effects + speech bubble
assets/                       → Clippy sprites (map.png) + Lottie JSONs
```

## Credits

- Clippy sprite assets from [felixrieseberg/clippy](https://github.com/felixrieseberg/clippy)
- Original Clippy designed by Kevan Atteberry for Microsoft
- Lottie animations rendered with [lottie-web](https://github.com/airbnb/lottie-web)

## License

MIT
