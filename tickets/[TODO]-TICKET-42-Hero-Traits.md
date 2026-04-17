**STATUS: TODO**

## Description
This ticket completes the "Soul" of the 13 heroes by implementing their unique Traits (Perks, Passives, and Curses). These traits are non-functional labels in TICKET-41 and must now be integrated into the `BattlePhase` and `App` state logic.

## Technical Implementation Guide
The Developer should add a `traitId` to each hero in the `HERO_ROSTER` and implement the following logic hooks:

### 1. Defensive / Passive Auras
- **Valerius (Aura of Iron)**: `damageAmount = Math.floor(damageAmount * 0.9)` if Valerius is in party and alive.
- **Draka (Scales)**: If `target.name === 'Draka'`, deal 6 damage back to `user`.
- **Valthea (Vanguard Stance)**: +10% flat DEF boost if in the `VANGUARD` slot.

### 2. Offensive / Strike Modifiers
- **Slyn (Infiltrator)**: Bypass `vanguardFoes.length > 0` check; can always pick from `livingFoes`.
- **Kael (Steady Aim)**: Basic attacks deal +25% damage to targets in the `REARGUARD`.
- **Borum (Sunder)**: On hit, `target.def = Math.max(0, target.def - 5)`.

### 3. Ability / Utility Modifiers
- **Morgra (Blood Pact)**: `healPower * 1.4` but `morgra.hp -= 5` per cast.
- **Krix (Overclock)**: `setTimeout(() => { if(Math.random()<0.15) unit.atb = 100; }, 300)` at end of turn.
- **Lira (Inspire)**: Global `atbSpeed` multiplier of 1.05 for all party members.
- **Elara (Moonlight Rain)**: Heals have a 25% chance to heal the entire party instead of one target.

### 4. Special / Survival
- **Grimm (Undying)**: If `hp <= 0` and `!hasRevived`, set `hp = 1`, `hasRevived = true`.
- **Vex (Soul Reaper)**: If `target.hp <= 0`, then `vex.hp += 10`.
- **Leora (Eagle Eye)**: All attacks ignore 50% of target DEF.

## Acceptance Criteria
- [ ] **Data Model**: All 13 heroes in `HERO_ROSTER` have a `trait` property.
- [ ] **UI Visualization**: The trait name and a short description are visible on the Hero Card in both the Draft and Inventory phases.
- [ ] **Functional Logic**: Each of the 13 traits correctly influences either the Battle Phase math or the out-of-combat stats.
- [ ] **Feedback**: Floating text (VFX) or logging should occur when a trait triggers (e.g., "⚡ Overclock!" or "🌵 Thorns!").
