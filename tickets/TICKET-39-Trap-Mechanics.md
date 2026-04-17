# TICKET-39: Rogue's Gambit (Interactive Trap Mechanics)
**STATUS: BACKLOG**

## Description
Traps currently deal unavoidable damage. To make the dungeon feel more interactive, traps will now trigger a "Skill Check" event.

## Proposed Mechanism
1.  **The Trigger**: Stepping on a `TRAP` tile opens the **Trap Event Modal**.
2.  **Dodge Roll**: The player rolls a 1d20.
    *   **Bonus**: Add a bonus based on the party's average **SPD** stat.
    *   **Success (DC 15)**: The trap is avoided. The player is given a choice: **[Disarm]** or **[Step Back]**.
    *   **Failure**: Immediate damage (standard `handleTrap` logic).
3.  **The Disarm**:
    *   If the player chooses to Disarm, they roll another 1d20.
    *   **Success**: The trap is removed from the map forever, and the party gain a small **Credit/Loot reward**.
    *   **Failure**: The trap triggers anyway (damage dealt), and the trap **remains on the tile** for the next person who steps there.

## UI Requirements
- Dice rolling animation in the modal.
- Visual variants for the trap room background (Spikes, Acid, Swinging Blades).

## Acceptance Criteria
- [ ] **Modal Trigger**: Stepping on a Trap tile reliably opens the Trap Event Modal (disabling standard movement until resolved).
- [ ] **Dice Logic**: Dice rolls (1d20 + Avg SPD) are calculated correctly and compared against the DC (15).
- [ ] **Branching Choice**: Successfully dodging allows the player to choose between **[Disarm]** (risk for reward) or **[Move On]** (safe exit).
- [ ] **Persistence**: If a trap is NOT disarmed (either failed roll or skipped), the trap icon remains on the map and can be triggered again.
- [ ] **Success Reward**: Disarming a trap removes it from the map permanent and awards a random amount of Credits (10-30).
- [ ] **Animations**: The modal includes a functional dice rolling animation and visual feedback for Success/Failure.
