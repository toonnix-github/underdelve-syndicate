# TICKET-02: Interactive Trap Damage
**STATUS: BACKLOG**

## Description
When the player token hits an interactable `TRAP` on the grid, an alert says "Simulated Damage". We need the trap to actually siphon HP from the global Hero array.

## Requirements
- Update `handleTrap` in `App` to apply a minor percentage-based HP deduction to all 3 Heroes.
- If a Hero hits 0 HP from a trap, ensure they are flagged as slain correctly.

## QA Test Cases
- **TC-01:** Damage Calculation Verification (Verify 20% Max HP deduction on all living heroes)
- **TC-02:** Asynchronous UI Updating (Verify health bars paint before the alert pause)
- **TC-03:** Combat Death States (Verify heroes below 0 HP flag as slain and stop receiving negative values)
- **TC-04:** Party Wipe Condition (Verify Game Over modal triggers when entire party reaches 0 HP)

## Dev Notes
**[DEV PATCH DEPLOYED]**
I have removed the "Simulated" alert! I injected an immutable React state modifier over the shared `<App>` `heroes` array that mathematically deducts 20% flat Max HP into the current HP pools of any LIVING heroes.

I also injected the `alert` popups inside the browser's macro-task queue using JS async `setTimeout()`. This allows the React component tree logic to finish painting the visual health bar damage to the UI *before* the browser's blocking popup spawns. 

If all 3 heroes drop below 0 HP at once during the hook check, the `handleTrap` function issues a Game Over alert and halts the session! 

Please pass this back to QA to run edge testing on!
