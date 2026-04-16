# TICKET-33: Room Variety (Dark Fantasy Backgrounds)
**STATUS: BACKLOG**

## Description
The dungeon grid currently looks like a flat digital tabletop. To enhance the "Dark Fantasy" immersion, each traversable room should have a unique (but cohesive) background texture or image.

## Requirements
- Source 5 alternative backgrounds in a "Dark Fantasy Dungeon" style (e.g., Cold Stone, Mossy Brick, Ruined Tiles, Bone Pit, Shadowed Grate).
- Assign a random background ID to each traversable tile during floor generation.
- Update the `ExplorationPhase` cell rendering to display these backgrounds.
- Ensure the backgrounds are dark enough to keep the grid coordinates (0,0) and indicators readable.
- Maintain the "Board Game" feel with subtle, non-distracting textures.
