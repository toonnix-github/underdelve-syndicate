# TICKET-22: Grid Layout Overhaul (Left-Align Map)
**STATUS: TODO**

## Description
The current layout centers the map with info on the top/bottom. To maximize vertical space and improve usability, we need a side-by-side layout.

## Requirements
- Refactor the `ExplorationPhase` CSS/Layout.
- Move the 7x7 Grid to the far left of the screen, taking up 100% of the viewport height.
- Move Status badges (Floor #), Controls (DPads), and Buttons (Party Stash) to a dedicated "Dashboard" column on the right-hand side.
- Ensure the layout remains responsive for smaller screens (fold to stack on mobile).
