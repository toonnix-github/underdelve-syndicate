# TICKET-09: Unique Passive Traits for Epic Loot
**STATUS: READY FOR DEVELOPMENT**

## Description
To align with the "Equipment-First" progression philosophy, we need loot to provide more than just raw stats. Higher-tier items should grant "Passives" that fundamentally change how a Hero performs in combat, making loot feel like a permanent upgrade without the need for level grinding.

## Requirements
- Introduce a `passive` property to the `Item` class (e.g., `{ name: 'Lifesteal', chance: 0.2, value: 5 }`).
- Update `generateLoot` to occasionally roll for Passives on Epic and Legendary items.
- Update `executeTurn` in `BattlePhase` to check for equipped passives:
    - **Lifesteal**: Heal the attacker for a % of damage dealt.
    - **Thorns**: Reflect a flat amount of damage back to the attacker.
    - **Quickening**: Small chance to reset ATB immediately after an action.
- Show the Passive name and description in the `InventoryPhase` and `Card` tooltips (or stats box).

## QA Test Cases
- **TC-01: Passive Triggering** (Verify Lifesteal, Thorns, and Quickening effects trigger in Combat Log)
- **TC-02: Logic Stacking** (Confirm multiple passives from different slots function simultaneously)
- **TC-03: UI Display** (Ensure passive details are visible in the Party Stash/Inventory screen)
- **TC-04: Rarity Gating** (Verify that passives are strictly reserved for Epic/Legendary tiers)

## Dev Notes
*Waiting on Developer to bridge Item class properties with Combat logic.*
