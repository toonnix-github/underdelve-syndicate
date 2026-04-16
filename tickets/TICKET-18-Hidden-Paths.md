# TICKET-18: Secret Passageways (Hidden Tiles)
**STATUS: BACKLOG**

## Description
Secret rooms are a staple of dungeon crawlers.

## Requirements
- Modify `proceduralGenerateLayout` to occasionally hide a loot room behind a "WALL" tile (`type 0`).
- If the player is adjacent to a secret wall, they can click it to "Reveal" it, making it walkable.
- Add a subtle visual cue (e.g., a cracked texture) for observant players.
