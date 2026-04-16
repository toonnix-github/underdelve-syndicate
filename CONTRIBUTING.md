# CONTRIBUTING.md — Developer & AI Agent Guide
> **⚠️ READ THIS BEFORE TOUCHING ANYTHING.**
> This document governs how all development work is conducted on this project — by humans and AI agents alike.

---

## 1. Project Overview

**Underdelve Syndicate** is a browser-based tactical roguelite dungeon crawler built in a single-file React app (`index.html`) served via a local HTTP server. There is no build pipeline — changes to `index.html` are immediately reflected in the browser.

- **Stack**: React 18 (UMD), Tailwind CSS (CDN), Babel (in-browser JSX)
- **Entry Point**: `d:\Agent\underdelve-syndicate\index.html`
- **Local Server**: `http://localhost:8000`
- **Assets**: `assets/` (hero/enemy images)
- **Engine Scripts**: `engine/` (Python battle engine, separate from the browser game)
- **Tickets**: `tickets/` (source of truth for all work)

---

## 2. The Ticket System (Source of Truth)

All work is ticket-driven. **Never make unsolicited changes.** If something seems wrong but there is no ticket for it, raise it — don't fix it silently.

### Ticket Lifecycle & File Naming Convention

Tickets live in `tickets/` and their **filename prefix is their status**:

| Prefix | Meaning |
|---|---|
| `[TODO]` or no prefix | Exists but not yet scheduled |
| `[BACKLOG]` | Deprioritized, not active |
| `[READY-FOR-DEVELOPMENT]` | Assigned, ready to be picked up |
| `[READY-FOR-QA]` | Dev complete, awaiting QA sign-off |
| `[RE-OPENED]` | QA rejected — defect attached, needs rework |
| `[DONE]` | QA approved, closed |

### Rules for Picking Up Work

1. Always scan `tickets/` first. Only pick up **`[READY-FOR-DEVELOPMENT]`** tickets.
2. If multiple tickets are ready, pick the **lowest ticket number**.
3. **Never start on a ticket that is `[READY-FOR-QA]`, `[DONE]`, or `[BACKLOG]`** unless explicitly instructed.
4. When picking up a ticket:
   - Change its prefix to `[READY-FOR-DEVELOPMENT]` if it isn't already
   - Add `**BRANCH: feature/<slug>**` to the ticket header
   - Commit the ticket update to `main` before switching to the feature branch

### Required Ticket Fields

Every ticket in development must contain:
```
**STATUS: <current status>**
**BRANCH: <branch name>**
```

---

## 3. Git Workflow (STRICT)

### Branch Rules

| Branch | Purpose |
|---|---|
| `main` | Stable deployable code. Ticket files only. No raw feature code. |
| `feature/<slug>` | All code changes go here. Named after the ticket. |

### Workflow Per Ticket

```
1. Create feature branch:
   git checkout -b feature/<ticket-slug>

2. Switch back to main, update ticket file with branch name:
   git checkout main
   git add tickets/
   git commit -m "Update TICKET-XX status + link branch"
   git push origin main

3. Switch to feature branch, implement the code:
   git checkout feature/<ticket-slug>
   <implement changes>
   git add index.html
   git commit -m "feat(TICKET-XX): <short description>"
   git push origin feature/<ticket-slug>

4. Merge into main BEFORE declaring READY-FOR-QA:
   git checkout main
   git pull origin main
   git merge feature/<ticket-slug> --no-ff -m "Merge feature/..."
   git push origin main

5. Update ticket file to [READY-FOR-QA]:
   git add tickets/
   git commit -m "Update TICKET-XX to READY-FOR-QA"
   git push origin main
```

> **⚠️ CRITICAL**: A ticket is NOT done when the feature branch is pushed. It is done when the feature branch is **merged into `main`** and QA has signed off. Failure to merge before declaring READY-FOR-QA will result in QA testing against stale code (as happened with QA-BUG-002).

### Commit Message Format

```
feat(TICKET-XX): Short description of the feature
fix(TICKET-XX): Short description of the bug fix
Update TICKET-XX status to <STATUS>
Merge feature/<slug>: TICKET-XX description
```

---

## 4. Code Architecture

### Single-File Architecture

All game logic lives in `index.html`. Within a single `<script type="text/babel">` block:

```
index.html
├── class Item             — Equipable loot (statBoost, passives, rarity)
├── class Combatant        — Heroes & enemies (ATB, VFX, equipment, passives)
├── const ROLES            — Role metadata (TANK, HEALER, DPS)
├── const PASSIVES         — Global passive definitions (LIFESTEAL, THORNS, QUICKENING)
├── const Card             — React: single unit card (combat)
├── const BattlePhase      — React: ATB combat engine
├── const InventoryPhase   — React: Party Stash / equip screen
├── const ExplorationPhase — React: Dungeon grid, Fog of War, scouting
└── const App              — React: Master controller, phase routing, inventory
```

### Key State (in `App`)

| State | Type | Description |
|---|---|---|
| `floor` | number | Current dungeon depth (1-indexed) |
| `heroes` | Combatant[] | Global party — persists across phases |
| `inventory` | Item[] | Unequipped loot pool |
| `gamePhase` | string | `'EXPLORATION'` / `'BATTLE'` / `'INVENTORY'` |
| `activeEncounter` | object | Current enemy pack being fought |

### Key State (in `ExplorationPhase`)

| State | Type | Description |
|---|---|---|
| `DUNGEON_LAYOUT` | number[][] | 7×7 grid. `1` = walkable, `0` = wall |
| `playerPos` | `{x, y}` | Current player tile |
| `exploredCells` | Set\<string\> | Tiles the player has stood on. Format: `"x,y"` |

### Fog of War Rules

- A tile is **explored** only when the player physically steps on it.
- Adjacent traversable tiles are **scouted** (rendered as `?` rooms) but not explored.
- **Enemies, traps, chests** are only visible in explored tiles.
- `exploredCells` only ever grows — it is never shrunk.

---

## 5. Restrictions & Anti-Patterns

### ❌ Never Do This

- **Never auto-reveal neighbors** in `setExploredCells`. Only add `${newX},${newY}` — never adjacent cells.
- **Never hardcode floor numbers** inside `handleTrap`, `generateLoot`, or similar scaling functions. Use the `floor` state variable.
- **Never skip the merge step**. Feature branch → merge → main → then declare READY-FOR-QA.
- **Never change `main` branch application code directly**. Ticket files only.
- **Never introduce new global state** without documenting it in this file.
- **Never use `alert()` for game-critical feedback**. Use the Combat Log, VFX system, or in-UI toasts.
- **Never test by wandering the browser manually** to find randomly-placed interactables. Verify logic by code review or by temporarily seeding a known tile position.

### ✅ Best Practices

- **Read the ticket in full** before writing a single line of code. Understand the QA test cases.
- **Verify by code review first**, browser test second. The dungeon is procedurally generated — don't waste time chasing random tile spawns.
- **Immutable state updates only**. React does not detect mutations. Always use `Object.assign(Object.create(...), ...)` pattern for `Combatant` objects.
- **Use `PASSIVES` global constant** (defined outside `App`) for any passive definitions. Never define passives inline in item constructors.
- **Prefer `Math.floor` for damage**, `Math.min/max` for clamping HP.
- **VFX matters**. The PM requires visual feedback for all state changes. Add `addVfx()` and log entries for any new mechanic.

---

## 6. QA Process

QA tests against **`main` branch only**. If your code isn't in `main`, it doesn't exist for QA.

### QA Defect Report Format (in ticket)

```markdown
## 🔴 QA DEFECT REPORT (FAILED)
**Defect ID**: QA-BUG-XXX
**Issue**: Short description
**Details**:
- File and line reference
- Expected vs actual behavior
```

When a defect is filed:
1. Ticket is renamed to `[RE-OPENED]-TICKET-XX-...`
2. Developer reads the defect, fixes on the feature branch
3. Merges back into `main`
4. Renames ticket to `[READY-FOR-QA]` and resubmits

---

## 7. Communication Protocol (AI ↔ QA ↔ PM)

Since this project uses AI agents as developers and QA:

- **Ticket files are the communication channel.** Status changes, defect reports, and dev notes all go in the ticket file.
- **AI Developer picks up `[READY-FOR-DEVELOPMENT]` tickets autonomously** if instructed to do so by the PM.
- **AI QA tests specific test cases** defined in the ticket's `## QA Test Cases` section.
- **PM (human)** prioritizes the backlog and gives final approval on `[DONE]` tickets.
- **No middle-man required** for handoffs — ticket filename change is the trigger.

---

## 8. File Reference

```
underdelve-syndicate/
├── index.html              ← The entire game
├── CONTRIBUTING.md         ← This file (read first)
├── .gitignore
├── assets/                 ← Character and enemy images
│   ├── hero_jax.png
│   ├── hero_elara.png
│   ├── hero_kael.png
│   ├── enemy_bat.png
│   ├── enemy_ogre.png
│   └── enemy_lurker.png
├── engine/                 ← Python battle simulator (not used in browser game)
│   ├── battle_loop.py
│   ├── combatants.py
│   └── gambits.py
├── simulator.py            ← Python entry point for engine
└── tickets/                ← All work items (source of truth)
    ├── [DONE]-TICKET-XX    ← Completed work
    ├── [READY-FOR-QA]-...  ← Awaiting QA
    ├── [READY-FOR-DEVELOPMENT]-... ← Next up
    └── [BACKLOG]-...       ← Not yet scheduled
```

---

*Last updated by AI Developer Agent — 2026-04-16*
