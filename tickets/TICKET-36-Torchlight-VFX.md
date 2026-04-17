# TICKET-36: Torchlight Enhancement & Fog Darkness
**STATUS: BACKLOG**

## Description
The current fog of war is binary (Black or Visible). To increase atmosphere, we should implement a "Torchlight" effect centered on the hero.

## Requirements
- Tiles immediately adjacent to the Hero should have a "Spillover" light effect (low opacity visibility).
- Unexplored/Unscouted tiles should be 100% black.
- Add a subtle flickering amber overlay to the Hero's current tile to simulate a handheld torch.
- **Party Representation**: Instead of a single circle token, the map should display **3 distinct tokens** (miniatures or small hero portraits) to represent the 3-member party moving as a group.

## Acceptance Criteria
- [ ] Atmospheric torchlight flickers on the player's current tile.
- [ ] Adjacent tiles show partial "light spill" instead of being pitch black.
- [ ] The map character representation consists of 3 tokens (one for each hero) rather than 1.
- [ ] Transitions between rooms maintain the 3-token grouping.
