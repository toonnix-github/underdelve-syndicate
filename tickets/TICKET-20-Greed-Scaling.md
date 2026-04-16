# TICKET-20: Dynamic Difficulty (Greed Scaling)
**STATUS: BACKLOG**

## Description
The more loot you find, the harder the dungeon fights back. This balances lucky runs.

## Requirements
- Create a `GreedScore` based on the number of non-consumable items in the inventory.
- Scale enemy HP/ATK by a multiplier tied to `GreedScore`.
- Ensure the player is warned when their Greed increases (e.g., "The Underdelve recognizes your wealth...").
