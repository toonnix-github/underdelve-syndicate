# TICKET-53: Domain Model & Data Extraction
**STATUS: BACKLOG**
**PRIORITY: P0**

## Description
Extract all raw data and definitions from `index.html` into static data files and TypeScript interfaces.

## Tasks
- **Types Extraction**: Define TS interfaces in `src/types/game.d.ts`:
  - `Hero`, `Enemy`, `Item`, `Trap`, `FloorState`, `Combatant`.
- **Hero Roster**: Move `HERO_ROSTER` and `LEADER_PERKS` to `src/data/heroes.ts`.
- **Item Tables**: Move `PASSIVES`, `ROLES`, and item generation logic to `src/data/items.ts`.
- **Asset Constants**: Create `assets.ts` to manage paths to images/sprites to avoid hardcoded strings.

## Acceptance Criteria
- [ ] No hardcoded roster data remains in the component logic.
- [ ] TypeScript interfaces correctly describe the shape of heroes and items.
- [ ] The `Combatant` class is updated to a modern ES6 class with proper type annotations.
