# TICKET-13: Status Effects (DOTs & Buffs)
**STATUS: BACKLOG**

## Description
Combat is currently purely numerical. We need "Status Effects" (Bleed, Poison, Haste) to add strategic depth.

## Requirements
- Define a `StatusEffect` class or object structure.
- Update `Combatant` to hold an `activeEffects` array.
- Implement Damage-Over-Time (DOT) logic that triggers at the start of a combatant's turn.
- Update `executeTurn` to visualize these effects (e.g., icons on the card).
