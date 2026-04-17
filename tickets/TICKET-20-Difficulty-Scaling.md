# TICKET-20: Dynamic Difficulty (Floor Scaling)
**STATUS: BACKLOG**

## Description
Dungeon difficulty currently feels static. We need to implement a scaling system where the underworld grows more dangerous as the party descends into deeper floors.

## Requirements
- **Enemy Quantity Scaling**: Multi-enemy packs should scale based on depth. 
  - Target Formula: `Enemy Count = floor + 1`.
- **Trap Density**: The probability of encountering a trap tile during map generation should increase with the current `floor` level.
- **Combat Scaling**: Enemy HP and ATK should receive a flat multiplier based on the current floor (e.g., `1.0 + (floor - 1) * 0.2`).
- **Loot Scaling**: Higher floor difficulty should be compensated with better credit rewards (e.g., `BASE_CREDITS * (1 + (floor - 1) * 0.5)`).

## Acceptance Criteria
- [ ] **Enemy Count**: Combat encounters on Floor 2+ feature more enemies (following `floor + 1` logic).
- [ ] **Trap Frequency**: Level generation logic increases trap probabilities by at least 5% per floor.
- [ ] **Stat Scaling**: Enemy HP/ATK values correctly reflect the floor multiplier.
- [ ] **Reward Scaling**: Credit rewards from traps and chests increase proportionally with depth.
