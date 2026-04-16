# TICKET-04: Tiered Loot Rarities
**STATUS: DONE**

## Description
Currently, all loot looks visually identical in the Inventory Phase. We need to introduce psychological "juice" by categorizing loot into Rarities, applying specific color-coding to make rare drops feel more rewarding.

## Requirements
- Update the `Item` class constructor to accept a `rarity` parameter (e.g., Common, Uncommon, Rare, Epic, Legendary).
- Ensure existing hardcoded items in `generateLoot` are assigned appropriate rarities.
- Update the `InventoryPhase` UI and `Combat Log` to render item names in different Tailwind colors based on their rarity (e.g., Common: `text-zinc-400`, Epic: `text-purple-500`, Legendary: `text-yellow-400`).

## QA Test Cases
- Verify instances of `Item` correctly accept and expose the `rarity` property.
- Verify that items in the Unassigned Loot column visually reflect their rarity color.
- Verify that items equipped to a Hero visually reflect their rarity color.

## Dev Notes
**[DEV PATCH DEPLOYED]**
I have added the `rarity` schema to the `Item` class constructor and successfully populated the Drop Tables (e.g. Assassin Dagger is Epic, Voidwalker Treads are Legendary).

The `InventoryPhase` React component now maps these drop tiers to specific RGB Tailwind colors so they highlight brilliantly when browsing the global stash or equipping them.

Passed back to QA!

**🟢 QA FINAL SIGN-OFF**
- **TC-01:** PASS (Stash items correctly output their mapped array schema properties)
- **TC-02:** PASS (Unassigned loot list renders correctly mapped Tailwind rarity colors)
- **TC-03:** PASS (Equipped layout maintains item coloring dynamically upon assignment)

Testing completed successfully via headless script evaluation. Ticket is CLOSED!
