# TICKET-43: Battlefield Visual Overhaul
**STATUS: DONE**

## Description
The current `BattlePhase` arena is a dark void with floating cards. To maintain the high-end "Digital Tabletop" immersion, we need a dedicated tactical background and a clearer visual representation of the battle-line positions (Vanguard vs. Rearguard).

## Requirements
- **Tactical Background**: Implement a unique background for the `BattlePhase`. It should represent a generic but atmospheric dungeon room (stone floors, torches, shadows).
- **Positional Grouping**: 
  - Visually separate the **VANGUARD** and **REARGUARD** units.
  - The Vanguard (Front Line) should be spatially closer to the center of the screen (the "Conflict Zone").
  - The Rearguard (Back Line) should be staggered further back.
- **Visual Slots**: Add subtle circular or square "Slot" textures on the floor beneath units to ground them in the scene.
- **Developer Instruction**: The Lead Developer is responsible for generating the background image asset (e.g., using AI prompting) and integrating it into the React component.

## Acceptance Criteria
- [x] **Combat Arena Assets**: The `BattlePhase` displays a dark fantasy combat background image.
- [x] **Line Separation**: There is a clear, visible gap/stagger between Vanguard and Rearguard units on both the Hero and Enemy sides.
- [x] **Positional Logic**: The `BattlePhase` layout correctly maps the `positionLine` property to these new visual coordinates.
- [x] **Animation Alignment**: Current attack animations (Advance/Strike/Return) are updated to originate and terminate at the correct new positional offsets.
- [x] **Scaling**: The layout remains responsive on various screen sizes without the lines overlapping.

## Implementation Notes
- `BattleView` uses randomized dungeon battle backgrounds from `assets/battle-bgs/`.
- Vanguard/Rearguard units are rendered in distinct columns with clear stagger and spacing on both sides.
- Attack arc origin/target positions are continuously sampled from live card DOM bounds so visual action alignment follows the current layout.
