# TICKET-47: Point-and-Click Map Traversal
**STATUS: BACKLOG**

## Description
The on-screen D-Pad and standard keyboard movement feel too arcade-style. Exploring a tabletop dungeon is better served with strategic point-and-click traversal.

## Requirements
- **Remove On-Screen D-Pad**: Delete the on-screen arrow buttons from the right dashboard.
- **Click to Move**: Allow players to click directly on adjacent, valid map tiles (rooms) in the `ExplorationPhase` to move the party there.
- **Hover Feedback**: When the player hovers their cursor over an adjacent, accessible room, display a visual indicator (e.g., footprint icon, highlight border) to show they can move there.
- **Fallback**: Maintain WASD/Arrow key support (TICKET-34) as a secondary control scheme.

## Acceptance Criteria
- [ ] On-screen movement arrows are removed.
- [ ] Adjacent rooms to the player are clickable and trigger movement.
- [ ] Non-adjacent or blocked rooms are not clickable.
- [ ] Hovering over a valid adjacent room shows an interactive cursor/icon.
- [ ] Logic respects blocked walls, voids, and existing movement rules.
