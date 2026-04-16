# TICKET-34: Keyboard Navigation (WASD/Arrows)
**STATUS: BACKLOG**

## Description
Relying solely on clicking the D-Pad buttons on the right dashboard is clunky for a PC-based "Digital Tabletop" experience. We need native keyboard support.

## Requirements
- Map `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` to the `movePlayer` function.
- Support `W`, `A`, `S`, `D` as alternate hotkeys.
- Ensure keyboard input is disabled when the Inventory Phase or Confirmation Modals are open.
