# TICKET-03: The 3rd Floor Expansion
**STATUS: BACKLOG**

## Description
Currently, `interactable.type === 'STAIRS'` throws an alert ("You survived the MVP Demo!") and executes a hard `window.location.reload()` if the player beats Floor 2. We need to allow them to cross into Floor 3 and fight a final boss pack.

## Requirements
- Remove the termination block on Floor 2.
- Define a Floor 3 enemy multipack returning boss stats.
