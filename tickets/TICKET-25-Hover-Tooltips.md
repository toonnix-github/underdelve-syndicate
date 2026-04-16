# TICKET-25: Grid Hover Tooltips
**STATUS: BACKLOG**

## Description
Players have to step on things to know what they are. We should allow "Peeking" via tooltips.

## Requirements
- Add `onMouseEnter` / `onMouseLeave` handlers to grid cells.
- If a cell contains an interactable (Chest, Trap, Stairs), show a small, themed tooltip with its name and a flavor description.
- Ensure the tooltip stays within screen bounds.
