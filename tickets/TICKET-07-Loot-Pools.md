# TICKET-07: Differentiated Loot Pools
**STATUS: BACKLOG**

## Description
Loot drops uniformly across the entire game, whether killing a minor bat or looting a rare chest. We should stratify drops based on the encounter.

## Requirements
- Refactor `generateLoot(source)` to accept a parameter for the encounter type.
- Create at least two separate loot tables: one for standard mobs and a "premium" one for Bosses or Chests.
- Update combat and chest resolution callbacks to pass their source parameter to the `generateLoot()` call.
