## ADDED Requirements

### Requirement: All 43 animations used during idle
The animation engine SHALL use all 43 available sprite animations in the idle pool, not just the current subset of 20.

#### Scenario: Idle animation plays from full pool
- **WHEN** no events are received for the idle timeout period
- **THEN** the engine picks an animation from the full set of 43 animations

### Requirement: Weighted random selection
The animation engine SHALL use weighted randomization so that subtle idle animations (e.g., IdleFingerTap, LookRight) play more frequently than dramatic ones (e.g., GetWizardy, EmptyTrash).

#### Scenario: Subtle animations play more often
- **WHEN** 100 idle animations are played in sequence
- **THEN** subtle/look animations appear roughly 3x more often than dramatic animations

### Requirement: No immediate repeat
The animation engine SHALL NOT play the same idle animation twice in a row.

#### Scenario: Consecutive idle animations differ
- **WHEN** an idle animation finishes and the next idle is scheduled
- **THEN** the next animation selected is different from the one that just played
