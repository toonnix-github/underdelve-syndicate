# TICKET-51: Deep Descent & Map Persistence Overhaul
**STATUS: BACKLOG**

## Description
The Syndicate needs to go deeper. Currently, the dungeon is capped to 2-3 levels and Floor 1 resets upon backtrack. We are expanding the run to 5 floors, increasing map size, and ensuring map state persists across floor transitions.

## Requirements
- **Floor State Persistence [FIX]**:
  - Implement a `floorStates` object to cache `interactables`, `exploredCells`, and `enemies` for each floor level.
  - When returning to a previous floor (`PREV_FLOOR`), the game must reload the last-known state of that floor (e.g., disarmed traps remain disarmed, opened chests remain empty).
- **5-Floor Depth**:
  - The "Ancient Stairwell" logic must lead to Floor 5.
  - Floor 5 is the "Deepest Sector"—the Victory condition triggers only after reaching the exit of Floor 5.
- **9x9 Strategic Grid**: 
  - Expand the `ExplorationPhase` grid size from 7x7 to **9x9**.
  - Update room generation logic to accommodate the larger tactical space.
- **Mini-Map UI**:
  - Add a small simplified "Mini-map" overlay in the corner of the exploration screen.
  - Features: Current party position (blinking), Explored rooms (dimmed), and Key markers (Stairs, Traps, Merchants) for rooms already visited.

## Acceptance Criteria
- [ ] **State Restoration**: Moving between Floor 1 and Floor 2 multiple times preserves all explored areas and interactable status.
- [ ] **Maximum Depth**: Level 5 is reachable and functional.
- [ ] **Grid Expansion**: The map display successfully renders a 9x9 grid without layout breakage.
- [ ] **Mini-Map**: A separate, small-scale map UI is visible and accurately tracks the party's movement/discovery.
