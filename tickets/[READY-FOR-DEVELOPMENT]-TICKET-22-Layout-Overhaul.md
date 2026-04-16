# TICKET-22: Grid Layout Overhaul (Left-Align Map) [Ready for Development]
**STATUS: READY FOR DEVELOPMENT**

## Description
The current layout centers the map with info on the top/bottom. To maximize vertical space and improve usability, we need a side-by-side layout.

## Requirements
- Refactor the `ExplorationPhase` CSS/Layout.
- Move the 7x7 Grid to the far left of the screen, taking up 100% of the viewport height.
- Move Status badges (Floor #), Controls (DPads), and Buttons (Party Stash) to a dedicated "Dashboard" column on the right-hand side.
- Ensure the layout remains responsive for smaller screens (fold to stack on mobile).

## Test Cases
- **TC1: Desktop two-column layout**
  - Open exploration on desktop viewport (e.g., 1440x900).
  - Verify grid is left-aligned and dashboard content is rendered in a right-side column.
- **TC2: Full-height grid behavior**
  - Confirm map container occupies full viewport height and grid scales without vertical clipping.
  - Verify no overlap between grid and dashboard panels.
- **TC3: Dashboard content migration**
  - Verify Floor badge, DPad controls, and Party Stash button are all present in dashboard column.
  - Confirm elements are removed from previous top/bottom placement.
- **TC4: Responsiveness on smaller screens**
  - Resize to tablet/mobile widths (e.g., 768px and 390px).
  - Verify layout folds into stacked sections and remains readable/usable.
- **TC5: Interaction regression in new layout**
  - Perform movement and open Party Stash from dashboard.
  - Verify controls respond correctly and no click target is obstructed after layout change.
