# TICKET-02: Scaling Trap Damage
**STATUS: READY FOR QA**
**DEFECT ID: QA-BUG-002 — RESOLVED** (feature branch merged into main)
**BRANCH: feature/trap-scaling**

## Dev Notes
Implemented floor-scaled trap damage. Formula: `damagePercent = 0.15 + (floor * 0.05)`
- Floor 1: 20% Max HP
- Floor 2: 25% Max HP
- Floor 3: 30% Max HP

Alert message now dynamically displays the correct percentage per floor.


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

## 🔴 QA DEFECT REPORT (FAILED)
**Issue**: Floor Scaling Logic is missing from the implementation.
**Details**:
- In `index.html:1099`, the damage is hardcoded to `* 0.20`.
- In `index.html:1110`, the alert message is hardcoded to `"20% damage"`.
- Requirement for `0.15 + (floor * 0.05)` is NOT met.

Please implement the dynamic scaling formula and ensure the alert correctly displays the calculated percentage.
