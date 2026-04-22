# TICKET-55: Component Atomic Migration
**STATUS: BACKLOG**
**PRIORITY: P1**

## Description
Convert the large embedded UI components from `index.html` into independent, reusable React components (`.tsx`).

## Tasks
- **Hero Components**: `Card.tsx`, `HeroRoster.tsx`, `LeadershipSelection.tsx`.
- **Map Components**: `DungeonMap.tsx`, `MiniMap.tsx`, `Tile.tsx`.
- **Combat Components**: `BattleArena.tsx`, `VFXLayer.tsx`.
- **Modals**: `TrapModal.tsx`, `StairsModal.tsx`, `InventoryModal.tsx`.

## Acceptance Criteria
- [ ] Every major UI element is a separate file in `/src/components`.
- [ ] Components use props and types correctly.
- [ ] CSS matches the current "Digital Tabletop" aesthetic exactly.
- [ ] Animations (fades, card tilts) are preserved.
