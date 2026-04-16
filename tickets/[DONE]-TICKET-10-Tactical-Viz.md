**STATUS: DONE**

## Description
To enhance the tabletop planning experience, we need to improve how tiles (rooms) visualize potential movement. Instead of color-coded highlights, players should see literal "doorways" on tile borders.

## Requirements
- **Path Viz (Borders)**: Dynamically update the border of each revealed tile based on its neighbors. 
- **🟠 PM REDESIGN (DOORWAYS)**: If an adjacent tile is walkable (`layout[y][x] === 1`), the border should **not** be a solid line. It must render a "void" or gap in the center of the line (`--   --`) to indicate a pass-through doorway.
- **🟠 PM REDESIGN (WALLS)**: If an adjacent tile is NOT walkable (boundary or void), the border must be a **solid** `zinc-800` line (`-------`) to indicate a physical wall.
- **Scouting (Question Mark Rooms)**: If an unrevealed tile (`!isExplored`) is adjacent to a revealed tile AND is traversable (`layout[y][x] === 1`), render it as a "Placeholder Room" with:
    - A stylized `?` icon in the center.
    - Dimmed borders that follow the same Path/Wall logic above.
- **Persistence**: Content (Enemies/Chests/Traps) within a Question Mark room must remain hidden until the player actually enters the tile.

## QA Test Cases
- **TC-01: Doorway Gap Verification** (Verify specific borders show a centered gap on valid paths)
- **TC-02: Fog Scouting** (Confirm hidden walkable paths show a "?" while walls stay hidden)
- **TC-03: Content Hiding** (Ensure Enemies/Chests are NOT rendered inside "?" rooms)
- **TC-04: Scout Reveal Transition** (Confirm the room content replaces the "?" exactly upon entry)
- **TC-05: Solid Wall Verification** (Confirm non-traversable boundaries render as solid unbroken lines)

## Dev Notes
*RE-OPENED: PM requires physical doorway gaps instead of color highlights. Implementation PENDING.*

**🟢 QA FINAL SIGN-OFF (PASS)**
- **TC-01: Doorway Gaps** - PASS (Split borders with 60% central gaps confirmed on paths).
- **TC-02: Fog Scouting** - PASS ('?' icons correctly rendered on adjacent traversable hidden tiles).
- **TC-03: Content Hiding** - PASS (Entities are NOT rendered inside '?' rooms).
- **TC-04: Reveal on Entry** - PASS (Scouted rooms correctly reveal full content upon coordinate entry).
- **TC-05: Solid Walls** - PASS (Non-path borders remain solid/unbroken).

All criteria met. Ticket is CLOSED.
