# TICKET-14: Environmental Hazard - Miasma Clouds
**STATUS: BACKLOG**

## Description
The grid needs more danger. Miasma Clouds are tiles that deal low DOT damage while standing in them or passing through.

## Requirements
- Create a new grid property or interactable `MIASMA` that does not disappear when stepped on.
- On every player move, if current position is `MIASMA`, apply minor HP drain to the party.
- Visual: Particle effect or purple hue on the tile in Exploration Phase.
