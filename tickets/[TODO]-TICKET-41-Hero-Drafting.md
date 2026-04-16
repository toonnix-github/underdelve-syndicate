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
> [!IMPORTANT]
> **SCOPE REMARK**: The "Trait/Passive" logic is **OUT OF SCOPE** for this ticket. The developer should focus only on the Draft Phase logic, Stat integration, and the new visual roster. Traits will be implemented in TICKET-42.

| Name | Role | Race/Gender | Appearance (AI Prompting Guide) | Quote | **Trait** (SCOPED OUT) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Valerius** | TANK | Human Male | Heavy gold-trimmed plate, blue cape, massive kite shield. | "The shield is my temple." | Aura of Iron |
| **Slyn** | DPS | Void Elf Female | Purple hood, dual glowing daggers, shadow wisps. | "You won't even hear the air move." | Infiltrator |
| **Morgra** | HEALER | Orc Female | Furs, skull-topped staff, red tribal paint. | "Pain is just the cost of life." | Blood Pact |
| **Krix** | DPS | Goblin Male | Brass mechanical arm, bag of ticking gadgets. | "Why hit once when you can explode twice?" | Overclock |
| **Draka** | TANK | Dragonkin Male | Crimson scales, brass gorget, scorched mace. | "Fire in blood, steel in hand." | Scales |
| **Vex** | DPS | Undead Female | Gothic robes, floating soul-flames, iron-bound book. | "Your soul will serve a better master." | Soul Reaper |
| **Leora** | DPS | Wood Elf Female | Green leather, longbow of white wood, hawk feather. | "One shot. One truth." | Eagle Eye |
| **Grimm** | TANK | Dwarf Male | Dirty grey beard, shovel-glaive, stone shield. | "Deeper we go, the more I feel at home." | Undying |
| **Lira** | HEALER | Human Female | Colorful poncho, silver lute, golden headband. | "Let the rhythm mend the steel." | Inspire |
| **Borum** | DPS | Dwarf Male | Iron apron, twin blacksmith hammers, red tattoos. | "I'll forge your path." | Sunder |
| **Valthea** | TANK | Human Female | Heavy iron plate, red scarf, dual-shield combatant. | "My steel is your sanctuary." | Vanguard Stance |
| **Elara** | HEALER | Elf Female | White silk robes, glowing staff, silver circlet. | "The moon mends the deepest wounds." | Moonlight Aura |
| **Kael** | DPS | Elf Male | Green/Gold light armor, twin recurve bows, focused gaze. | "My arrow has already found its mark." | Piercing Shot |

### Detailed Stats Table (For Data Initialization)
| Name | Base HP | ATK | DEF | SPD | Image ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Valerius | 140 | 8 | 18 | 10 | `hero_valerius` |
| Slyn | 75 | 22 | 6 | 28 | `hero_slyn` |
| Morgra | 95 | 12 | 12 | 15 | `hero_morgra` |
| Krix | 80 | 18 | 10 | 22 | `hero_krix` |
| Draka | 160 | 12 | 20 | 6 | `hero_draka` |
| Vex | 85 | 24 | 8 | 18 | `hero_vex` |
| Leora | 70 | 26 | 5 | 25 | `hero_leora` |
| Grimm | 110 | 14 | 15 | 12 | `hero_grimm` |
| Lira | 85 | 10 | 10 | 20 | `hero_lira` |
| Borum | 100 | 20 | 12 | 8 | `hero_borum` |
| Valthea | 120 | 10 | 15 | 12 | `hero_valthea` |
| Elara | 70 | 14 | 15 | 6 | `hero_elara` |
| Kael | 85 | 18 | 22 | 10 | `hero_kael` |
