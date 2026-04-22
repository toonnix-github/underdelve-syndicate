# TICKET-44: Specialized Room Visuals (Entrance & Stairs)
**STATUS: BACKLOG**

## Description
Currently, all rooms use the generic dark fantasy backgrounds. To improve navigation and game "feel," the Entrance and Stairs (Up/Down) rooms need distinct, recognizable visual assets.

## Requirements
- **Entrance Room**: A unique background representing the arrival point of the Syndicate (e.g., an elevator cage, a heavy vault door, or a safe arrival zone).
- **Stairs Down (Next Floor)**: A background featuring a clear descending staircase, a hole in the floor, or a glowing portal leading deeper.
- **Stairs Up (Prev Floor)**: If applicable, a visual representing the way back (ascending stairs or a lift).
- **Implementation**: The `ExplorationPhase` logic should check the current tile's interactable type and override the random room background if it matches one of these special types.
- **Developer Instruction**: The Lead Developer is responsible for generating these three specific room backgrounds using AI prompting to match the existing "Dark Fantasy" aesthetic.

## Acceptance Criteria
- [ ] **Entrance Asset**: The starting room (0,0) has a dedicated "Entrance" background.
- [ ] **Stairs Down Asset**: Tiles with the `STAIRS` interactable type display a "Descending" background.
- [ ] **Stairs Up Asset**: Tiles with the `PREV_FLOOR` interactable type display an "Ascending" background.
- [ ] **Clarity**: The function of these rooms is "obvious" at first glance based on the artwork.
- [ ] **Integration**: The transition between generic rooms and special rooms is seamless.
