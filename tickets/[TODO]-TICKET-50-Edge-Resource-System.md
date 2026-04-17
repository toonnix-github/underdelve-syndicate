# TICKET-50: The "Edge" System (Luck Mitigation Resource)
**STATUS: BACKLOG**

## Description
To reduce frustration from bad dice rolls and reward strategic resource management, we are introducing "Edge" tokens. These representing the Syndicate's ability to bend the rules in their favor.

## Requirements
- **New Resource**: Add `edgeTokens` to the global game state (Start with 1 or 2).
- **Spending "Edge"**:
  - **Trap Intervention**: Spend 1 Edge to auto-succeed a Trap Dodge or Disarm roll (DC met automatically).
  - **Combat Intervention**: During a hero's turn, spend 1 Edge to guarantee the next ability is a "Strong Proc" (max damage/healing).
  - **Drafting**: Spend 1 Edge to re-roll the current pool of 5 heroes.
- **Earning "Edge"**:
  - Award 1 Edge for defeating an Elite/Boss.
  - Award 1 Edge for successfully disarming a trap manually (without spending Edge).
  - Rare drop from chests.
- **UI**: Display "Edge" tokens as glowing blue shards or coins near the Credit counter.

## Acceptance Criteria
- [ ] Global state correctly tracks and persists `edgeTokens`.
- [ ] Spending Edge in the Trap Modal bypasses the rolling animation and triggers "Success".
- [ ] Spending Edge in Combat applies a guaranteed power boost to the intended action.
- [ ] The player cannot spend Edge if their count is zero.
- [ ] Feedback (SFX/VFX) clearly indicates when "Edge" has been used to influence fate.
