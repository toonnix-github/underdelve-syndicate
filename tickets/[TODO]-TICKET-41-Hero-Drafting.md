# TICKET-41: Hero Draft & Roster Expansion
**STATUS: TODO**

## Description
Runs currently start with a fixed party. To increase replayability, we are introducing a "Draft Phase."

## Requirements
- **Roster Expansion**: Add 10 new unique hero definitions to the codebase (Total 13).
- **Draft Component**: At the start of a new run, display 5 random heroes from the roster.
- **The Choice**: User must click to "Enlist" exactly 3 heroes.
- **Deployment**: After selection, move to a "Deployment" screen to assign heroes to Vanguard or Rearguard positions.

## Defined Hero Roster (Expansion Pack 1)
To streamline development, the follow 10 heroes are pre-balanced for the Expansion:

| Name | Role | Base HP | ATK | DEF | SPD | Image ID | Trait (Passive) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Valerius** | TANK | 140 | 8 | 18 | 10 | `hero_valerius` | **Aura of Iron**: Allies take 10% less damage. |
| **Slyn** | DPS | 75 | 22 | 6 | 28 | `hero_slyn` | **Infiltrator**: Ignores Vanguard/Rearguard targeting. |
| **Morgra** | HEALER | 95 | 12 | 12 | 15 | `hero_morgra` | **Blood Pact**: +40% Heal power, but loses 5 HP on cast. |
| **Krix** | DPS | 80 | 18 | 10 | 22 | `hero_krix` | **Overclock**: 15% chance to immediately act again. |
| **Draka** | TANK | 160 | 12 | 20 | 6 | `hero_draka` | **Scales**: Reflects 6 damage when hit. |
| **Vex** | DPS | 85 | 24 | 8 | 18 | `hero_vex` | **Soul Reaper**: Heals 10 HP on killing blow. |
| **Leora** | DPS | 70 | 26 | 5 | 25 | `hero_leora` | **Eagle Eye**: +15% Crit chance. |
| **Grimm** | TANK | 110 | 14 | 15 | 12 | `hero_grimm` | **Undying**: Once per battle, returns to 1 HP on death. |
| **Lira** | HEALER | 85 | 10 | 10 | 20 | `hero_lira` | **Inspire**: Party ATB fills 5% faster every time she acts. |
| **Borum** | DPS | 100 | 20 | 12 | 8 | `hero_borum` | **Sunder**: Attacks reduce target DEF by 5 (permanent). |
