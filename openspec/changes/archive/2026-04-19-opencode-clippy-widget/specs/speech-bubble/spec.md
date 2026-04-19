## ADDED Requirements

### Requirement: Speech bubble displays tip text
The speech bubble SHALL render as a classic Windows 98-era Clippy tooltip above the sprite, showing the tip text associated with the current animation event.

#### Scenario: Tip text appears with animation
- **WHEN** an event triggers an animation with non-null tip text
- **THEN** a speech bubble appears above Clippy showing the tip text

#### Scenario: No tip text hides speech bubble
- **WHEN** an event triggers an animation with null tip text
- **THEN** no speech bubble is displayed

### Requirement: Speech bubble visual styling matches classic Clippy exactly
The speech bubble SHALL replicate the original Microsoft Office Clippy tooltip appearance:
- **Background**: solid `#FFFFE1` (pale yellow/cream), NOT white
- **Border**: 1px solid `#000000` (black)
- **Corners**: sharp 90-degree corners, NO border-radius
- **Drop shadow**: 2px offset dark gray (`#808080`) shadow on the bottom and right edges, simulating the classic Windows 98 raised tooltip shadow
- **Tail**: triangular pointer from the bottom-left of the bubble pointing downward toward Clippy, same yellow fill and black border
- **Font**: `"Tahoma", "MS Sans Serif", "Microsoft Sans Serif", sans-serif` at 11px/12px, regular weight, black text (`#000000`)
- **Padding**: 8px on all sides
- **Max-width**: 250px for status tips, 300px for proactive tips
- **Text rendering**: plain left-aligned text, no bold (except for proactive tip titles)

#### Scenario: Speech bubble renders with classic Windows 98 tooltip style
- **WHEN** a speech bubble appears
- **THEN** it has pale yellow background (#FFFFE1), 1px black border, sharp corners, a dark gray drop shadow on the bottom-right, and a triangular tail pointing down-left toward Clippy

#### Scenario: Font matches classic Clippy
- **WHEN** a speech bubble renders text
- **THEN** the text uses Tahoma (or MS Sans Serif fallback) at 11px, regular weight, black color

### Requirement: Proactive tip bubble has distinct layout
Proactive tips ("It looks like you're...") SHALL render in the same classic yellow tooltip style but with a structured layout: the title line in **bold** (e.g., "It looks like you're running into errors!") followed by body text in regular weight on the next line. A small "x" close button SHALL appear in the top-right corner of the bubble, styled as plain black text.

#### Scenario: Proactive tip renders with title and body
- **WHEN** the widget receives a proactive tip with title and body
- **THEN** the speech bubble shows the title in bold Tahoma 11px on the first line, the body in regular Tahoma 11px below, and an "x" close button in the top-right

### Requirement: Speech bubble auto-dismisses
The speech bubble SHALL automatically dismiss after 4 seconds (status tips) or 8 seconds (proactive tips), with a Lottie pop-out exit animation, or when the next animation starts, whichever comes first.

#### Scenario: Status tip auto-dismiss after 4 seconds
- **WHEN** a status tip appears with text "Reading files..."
- **THEN** it plays the Lottie pop-out animation and disappears after 4 seconds

#### Scenario: Proactive tip auto-dismiss after 8 seconds
- **WHEN** a proactive tip appears with title and body
- **THEN** it plays the Lottie pop-out animation and disappears after 8 seconds

#### Scenario: Dismiss on next animation
- **WHEN** a speech bubble is showing and a new animation event arrives
- **THEN** the current speech bubble plays the pop-out animation immediately and the new one pops in (if the new event has tip text)

### Requirement: Speech bubble uses Lottie entrance/exit animations
The speech bubble SHALL use Lottie animations (`speech-pop.json`) for its entrance (pop-in) and exit (pop-out) transitions instead of plain CSS fades.

#### Scenario: Bubble pops in with Lottie animation
- **WHEN** a speech bubble appears
- **THEN** it plays the `speech-pop.json` Lottie entrance animation (scale from 0 to 1 with overshoot)

#### Scenario: Bubble pops out with Lottie animation
- **WHEN** a speech bubble dismisses (timeout, click, or next animation)
- **THEN** it plays the `speech-pop.json` Lottie exit animation (scale from 1 to 0)

### Requirement: Speech bubble supports click to dismiss
The user SHALL be able to click anywhere on the speech bubble (status tips) or the "x" button (proactive tips) to dismiss it immediately.

#### Scenario: User clicks status tip to dismiss
- **WHEN** the user clicks on an active status tip bubble
- **THEN** the speech bubble dismisses immediately with the pop-out animation

#### Scenario: User clicks close button on proactive tip
- **WHEN** the user clicks the "x" button on a proactive tip
- **THEN** the proactive tip dismisses immediately with the pop-out animation
