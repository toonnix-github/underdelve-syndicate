# Unit Testing Guide

This project uses **Vitest** for unit testing.

## Run Tests

- `npm run test` runs the full unit test suite once.
- `npm run test:watch` runs tests in watch mode.
- `npm run test:coverage` runs tests and prints coverage output.

## Current Coverage Scope

Unit tests are currently focused on core gameplay logic:

- Combat math and hit/heal/damage calculations.
- Combat stat breakdown calculations.
- Dungeon generation behavior and interactable spawning.
- Combatant model behavior (stat scaling, equipment flow, VFX dedupe).
- Data integrity for heroes, items, enemies, perks, traits, narrative, and constants.
- Utility checks for portrait resolution and class-merging helper behavior.
- Item model constructor behavior.

## CI Enforcement

Unit tests run automatically via GitHub Actions on:

- Pull requests targeting `main`.
- Pushes to `main` (including merged PRs).
