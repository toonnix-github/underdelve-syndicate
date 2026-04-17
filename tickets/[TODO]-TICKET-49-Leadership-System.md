# TICKET-49: Syndicate Leadership System
**STATUS: BACKLOG**

## Description
Every successful heist needs a mastermind. We are introducing a "Group Leader" mechanic where one of the three chosen heroes is designated as the party leader, granting a unique persistent "Leader Perk" for the duration of the run.

## Requirements
- **Leader Selection Phase**: 
  - Add a one-time selection step (e.g., in the Deployment Phase or at the end of the Draft).
  - The player chooses exactly one of their 3 heroes to be the "Syndicate Leader."
- **Leader Perks**: 
  - Define a unique `leaderPerk` for each of the 13 heroes.
  - Examples:
    - *Tactician (Valerius)*: +10% Party DEF on floor 1.
    - *Navigator (Slyn)*: Reveals 1 random adjacent unexplored room.
    - *Wealth Seeker (Grimm)*: +20% Credits from all sources.
- **Persistence**: The Leader Perk applies throughout the entire game (all floors) and cannot be changed after the initial start.
- **UI Indicator**: The designated Leader should have a "Crown" or "Star" icon on their card in the Right Panel and Battle/Exploration views.

## Acceptance Criteria
- [ ] **Selection Logic**: The game prompts the player to pick a leader once at the start of the run.
- [ ] **State Management**: The global game state correctly stores the `leaderHeroId`.
- [ ] **Perk Application**: The specific modifier for the chosen leader is active (e.g., credit bonuses are calculated, scout reveals happen).
- [ ] **Visual Identity**: The chosen leader is clearly distinguished in all game phases by a "Leader" icon or badge.
- [ ] **One-Time Only**: The leader selection is locked and cannot be re-assigned during the run.
