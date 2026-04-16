# TICKET-12: The Black Market (Merchant Phase)
**STATUS: TODO**

## Description
To give players more agency over their build in a 30-minute run, we need a merchant. Players should be able to find a "TRADER" interactable on the grid to exchange "Syndicate Credits" (new currency) for specific gear.

## Requirements
- Add `credits` as a party-wide resource.
- Create a new interactable type `TRADER`.
- Implement a `MerchantPhase` UI that displays 3 random items from the premium loot table with price tags.
- Credits drop from enemies and chest overflows.
