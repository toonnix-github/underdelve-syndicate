# TICKET-46: Deployment Screen Overhaul & Row Restrictions
**STATUS: BACKLOG**

## Description
The Deployment phase currently allows placing heroes in Vanguard and Rearguard but lacks restrictions and visual tabletop flair. We need to cap rows to 2 heroes maximum and make the deployment feel like organizing physical cards.

## Requirements
- **Row Restriction**: The `VANGUARD` and `REARGUARD` arrays can hold a maximum of **2** heroes each. Attempting to move a third hero into a full row must be blocked (or auto-swap).
- **Tabletop Visuals**: Revisualize the heroes as physical cards (like in Draft and Battle modes) that sit on designated playmats or zones.
- **Interaction**: Allow easy swapping back and forth between Vanguard and Rearguard zones.

## Acceptance Criteria
- [ ] Logic prevents placing 3 heroes in a single row (Vanguard or Rearguard).
- [ ] Deployment screen displays heroes as distinct, tangible cards.
- [ ] Visual zones for Vanguard and Rearguard look like dedicated tabletop playmats.
- [ ] Swapping logic works flawlessly within the new constraints.
