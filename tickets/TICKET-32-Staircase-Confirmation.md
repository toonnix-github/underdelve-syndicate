# TICKET-32: Staircase Confirmation Dialogue
**STATUS: BACKLOG**

## Description
Players currently advance to the next floor immediately upon stepping on the stairs. This can be frustrating if they accidentally move onto the tile before finishing their exploration or looting.

## Requirements
- When the player moves onto a `STAIRS` tile, do NOT trigger the floor transition immediately.
- Display a confirmation dialogue (browser `confirm()` or a custom UI modal) asking: "Descend deeper into the Underdelve?"
- Only call `onNextFloor` if the player selects "Yes".
- If the player selects "No", they remain on the stairs tile and can move away on their next turn.

## QA / Handoff Notes
- Attach staircase modal screenshots in the PR conversation/UI during review.
- Do not commit screenshot binaries solely for review evidence.
