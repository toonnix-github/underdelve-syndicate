# TICKET-54: Modular Game Engine (Hooks & Logic)
**STATUS: BACKLOG**
**PRIORITY: P1**

## Description
Extract the "Heavy Lifting" logic (Combat, Exploration, Trap checks) from the main React components into standalone React Hooks or pure JS modules.

## Tasks
- **useCombat**: Create a hook to manage turn orders, damage calculation, and victory/defeat states.
- **useDungeon**: Create a hook to manage movement, scouting, and interactable state.
- **Dungeon Generator Integration**: Import and integrate the `dungeon_generator.js` logic as a module instead of a window property.
- **State Serialization**: Implement `serializeFloorState()` and `deserializeFloorState()` to handle persistence robustly.

## Acceptance Criteria
- [ ] Combat logic is non-visual and can be tested independently.
- [ ] Floor persistence (backtracking) works without state corruption.
- [ ] Exploration movement logic is decoupled from the `ExplorationPhase` component.
