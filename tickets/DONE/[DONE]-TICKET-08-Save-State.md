# TICKET-08: Persistent Save Data
**STATUS: DONE**

## Description
Currently, when a player reloads or forces a refresh, they lose all heroes, loot, and floor progress. We need a mechanism to persist game state between sessions.

## Requirements
- Utilize browser `localStorage` to snapshot the `heroes` array, `inventory`, and current `floor` when transitioning between EXPLORATION and BATTLE phases.
- On initialization, `<App>` should check `localStorage` for an existing save state.
- Add an `Abandon Run` button to the inventory/exploration UI that wipes localStorage.

## QA Test Cases
- **TC-01: Auto-Save Trigger Verification** (Confirm `localStorage` updates during phase transitions)
- **TC-02: Hero State Persistence** (Confirm Hero HP/Equipment survives page refresh)
- **TC-03: Inventory/Stash Persistence** (Confirm looted items survive page refresh)
- **TC-04: Session Termination (Abandon Run)** (Confirm `localStorage` is purged and session restarts)

## Dev Notes
*Waiting on Developer (Antigravity) to implement persistence logic.*
