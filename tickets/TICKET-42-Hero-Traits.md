# TICKET-42: Hero Traits (Perks, Passives, and Curses)
**STATUS: BACKLOG**

## Description
Heroes currently only differ by stats and role. Each hero needs a unique "Trait" to define their playstyle.

## Requirements
- Add a `trait` property to the `Combatant` class.
- **Trait Types**:
  - **Perk**: Positive (e.g., "Battle Hardened: 10% more Max HP").
  - **Passive**: Combat Flow (e.g., "Counter: 20% chance to attack when hit").
  - **Curse**: Negative/Risk (e.g., "Glass Cannon: +30% ATK, but -20% DEF").
- Display the trait prominently on the Hero Card (TICKET-41) and during the Draft (TICKET-42).
