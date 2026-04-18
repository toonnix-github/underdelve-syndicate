# TICKET-48: Hero Card Redesign (Minimalist Tabletop Style)
**STATUS: DONE**
**PRIORITY: P1 (COMPLETE)**

## Description
The current hero cards are informative but text-heavy. To align with our premium digital tabletop goal, we are redesigning the card layout to favor symbols over text, inspired by high-end physical board games.

## Requirements
- **Icon-Driven Stats**: 
  - Replace "ATK", "DEF", and "SPD" text labels with a vertical stack of colored circular tokens.
  - Position these tokens on the right edge of the card, floating over the art.
  - Numbers should be displayed cleanly next to or inside the icons.
- **Full Bleed Art**: The hero illustration should fill the entire card area. 
- **Syndicate Industrial Aesthetic**: 
  - The hero **Name** and **Role** should be centered at the bottom.
  - Use a heavy, industrial/dungeon-themed border pattern (e.g., rusted iron grating, Syndicate sigils, or rough-hewn stone textures) to separate the footer from the art.
- **Reference Layout**: Use the vertical icon stack from the provided reference image, but adapt the *graphic style* to our dark-fantasy/industrial "Syndicate" branding.

## Acceptance Criteria
- [x] **Visual Layout**: Stats are represented by a vertical column of colored icons on the right side.
- [x] **Full Bleed**: The background art fills the entire card frame.
- [x] **Syndicate Border**: A decorative heavy-metal or dungeon-etched border is visible at the bottom of the art section.
- [x] **Readability**: Hero names and roles are prominently centered in the bottom plate.
- [x] **Minimalist Polish**: Raw text labels (ATK:, DEF:) are completely removed in favor of purely symbolic representation where possible.

## Implementation Notes
- **Stat Tokens**: Implemented as circular backdrop-blurred elements with colored borders (Rose for ATK, Amber for DEF, Cyan for SPD).
- **Industrial Border**: Uses a repeating-linear-gradient grating effect for a premium industrial look.
- **Footer Plate**: Centered name and role with a dark-to-transparent gradient blend.
- **Full Bleed**: Art layer expanded to `absolute inset-0` with noise and gradient overlays to enhance character focus.
- **Zero-Testing Compliance**: Redesign implemented based on structural code logic; UI verification via browser subagent skipped per instruction.
