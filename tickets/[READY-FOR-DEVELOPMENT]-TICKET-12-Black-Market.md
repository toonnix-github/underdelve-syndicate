# TICKET-12: The Black Market (Merchant Phase) [Ready for Development]
**STATUS: READY FOR DEVELOPMENT**

## Description
To give players more agency over their build in a 30-minute run, we need a merchant. Players should be able to find a "TRADER" interactable on the grid to exchange "Syndicate Credits" (new currency) for specific gear.

## Requirements
- Add `credits` as a party-wide resource.
- Create a new interactable type `TRADER`.
- Implement a `MerchantPhase` UI that displays 3 random items from the premium loot table with price tags.
- Credits drop from enemies and chest overflows.

## Test Cases
- **TC1: Credits resource availability**
  - Start a new run and confirm party state includes `credits` initialized to `0`.
  - Defeat an enemy and verify `credits` increases by the configured drop amount.
- **TC2: TRADER interactable spawn + interaction**
  - Enter a floor with interactables and verify a `TRADER` node can appear.
  - Move to the `TRADER` tile and confirm interaction opens `MerchantPhase`.
- **TC3: Merchant inventory composition**
  - Open `MerchantPhase` and verify exactly 3 offers are rendered.
  - Confirm all 3 offered items come from the premium loot table.
- **TC4: Price tag + purchase flow**
  - For an affordable item, verify price is visible, purchase deducts correct credits, and item is granted.
  - For an unaffordable item, verify purchase is blocked and an insufficiency message/state is shown.
- **TC5: Chest overflow credit conversion**
  - Force a chest overflow scenario and verify overflow converts into `credits`.
  - Confirm converted credits are immediately reflected in UI/state.
