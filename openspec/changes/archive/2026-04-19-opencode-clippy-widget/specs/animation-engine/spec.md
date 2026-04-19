## ADDED Requirements

### Requirement: Animation engine renders sprite sheet frames on Canvas
The animation engine SHALL use an HTML5 Canvas element to render individual frames from the Clippy sprite sheet (`map.png`) using the frame coordinates and timing data from `animations.json`.

#### Scenario: Single animation plays correctly
- **WHEN** the engine receives a `play("Greeting")` command
- **THEN** it renders each frame of the Greeting animation at the specified duration per frame, clipping from the sprite sheet at the correct row/column offsets

### Requirement: Animation engine supports all 42 Clippy animations
The engine SHALL support playing any of the 42 animations defined in `animations.json`: Alert, CheckingSomething, Congratulate, Default, EmptyTrash, Explain, GestureDown, GestureLeft, GestureRight, GestureUp, GetArtsy, GetAttention, GetTechy, GetWizardy, GoodBye, Greeting, Hearing_1, Hide, Idle1_1, IdleAtom, IdleEyeBrowRaise, IdleFingerTap, IdleHeadScratch, IdleRopePile, IdleSideToSide, IdleSnooze, LookDown, LookDownLeft, LookDownRight, LookLeft, LookRight, LookUp, LookUpLeft, LookUpRight, Print, Processing, RestPose, Save, Searching, SendMail, Show, Thinking, Wave, Writing.

#### Scenario: Each animation plays without errors
- **WHEN** any of the 42 animation names is requested
- **THEN** the engine plays the animation using the correct frame data from `animations.json`

### Requirement: Animation queue with priority levels
The engine SHALL maintain an animation queue with two priority levels: `high` (interrupts current animation) and `normal` (queued after current animation completes).

#### Scenario: High-priority animation interrupts current
- **WHEN** an Alert animation (high priority) is requested while IdleSnooze is playing
- **THEN** IdleSnooze stops immediately and Alert begins playing

#### Scenario: Normal-priority animations queue
- **WHEN** a Thinking animation is requested while Greeting is still playing
- **THEN** Thinking begins after Greeting completes

### Requirement: Idle animation loop
The engine SHALL automatically play a random idle animation when no other animation is queued and the current animation has completed.

#### Scenario: Idle loop after animation completes
- **WHEN** a Greeting animation finishes and no other animations are queued
- **THEN** after a 3-second pause, a random idle animation (from IdleAtom, IdleEyeBrowRaise, IdleFingerTap, IdleHeadScratch, IdleRopePile, IdleSideToSide, IdleSnooze, Idle1_1) begins playing

### Requirement: Animation returns to RestPose between animations
The engine SHALL display the RestPose frame during the pause between animations.

#### Scenario: RestPose between animations
- **WHEN** an animation completes and the next animation hasn't started
- **THEN** the RestPose frame is displayed
