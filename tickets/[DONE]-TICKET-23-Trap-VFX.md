# TICKET-23: Exploration Phase VFX (Floating Damage)
**STATUS: BACKLOG**

## Description
Traps currently trigger a generic browser alert for damage. This breaks immersion. We need visual feedback on the grid.

## Requirements
- When a `TRAP` is triggered, spawn a floating `-HP` text at the player's grid coordinates.
- Use the same `animate-float-up` logic used in the Battle Phase.
- Remove the blocking `alert()` once the VFX is in place.
