# TICKET-06: Dedicated Accessory Slot
**STATUS: BACKLOG**

## Description
Items like the "Ruby Signet" are currently forced into the `HAT` slot. We need a proper Trinket or Accessory slot for items that provide esoteric stat configurations.

## Requirements
- Add a new `accessory` (or `trinket`) slot to the `equipment` object of the `Combatant` class.
- Update the `InventoryPhase` UI to render a 6th equipment slot card for characters.
- Ensure items initialized as type `ACCESSORY` can exclusively be slotted there.
