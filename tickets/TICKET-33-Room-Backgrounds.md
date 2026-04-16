# TICKET-33: Room Variety (Dark Fantasy Backgrounds)
**STATUS: DONE**

## Description
The dungeon grid currently looks like a flat digital tabletop. To enhance the "Dark Fantasy" immersion, each traversable room should have a unique (but cohesive) background texture or image.

## Requirements
- [x] Source 5 alternative backgrounds in a "Dark Fantasy Dungeon" style (e.g., Cold Stone, Mossy Brick, Ruined Tiles, Bone Pit, Shadowed Grate).
- [x] Assign a random background ID to each traversable tile during floor generation.
- [x] Update the `ExplorationPhase` cell rendering to display these backgrounds.
- [x] Ensure the backgrounds are dark enough to keep the grid coordinates readable.
- [x] Maintain the "Board Game" feel with subtle, non-distracting textures.

## Implemented Features (Extended Scope)
- **Mystery Rooms**: Scouted but unvisited rooms (?) now use a swirling "Cloudy Mystery" background to represent the unknown.
- **Dynamic Torchlight**: 
    - Hero token has a flickering circular aura.
    - Light "spills" into North, East, South, and West neighboring explored rooms through connected doorways.
    - Diagonal and blocked rooms remain in shadow.
- **Atmospheric Brightness**: Balanced room overlays (Explored: 20%, Mystery: 70%) for optimal contrast.
