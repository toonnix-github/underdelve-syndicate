# Underdelve Syndicate - Digital Tabletop Roguelite

A high-fidelity tactical dungeon crawler with a focus on leadership synergies and "Physical Tabletop" aesthetics.

## Tech Stack
- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Game Engine**: Custom React-based state machine with persistent floor caching.

## Getting Started
1. **Installation**:
   ```bash
   npm install
   ```
2. **Development**:
   ```bash
   npm run dev
   ```
3. **Build**:
   ```bash
   npm run build
   ```

## Project Structure
- `/src/components`: UI modules (Cards, Maps, Modals)
- `/src/hooks`: Game logic engines (`useCombat`, `useExploration`)
- `/src/engine`: Pure mathematical logic and grid generation
- `/src/data`: Roster, items, and balancing constants
- `/src/types`: TypeScript definitions for the game domain
- `/public/assets`: Static images and textures

## Development Roadmap
The project is currently undergoing a modular refactor (TICKET-52 to TICKET-56).
- [x] TICKET-52: Infrastructure Setup
- [ ] TICKET-53: Data Extraction
- [ ] TICKET-54: Engine Hooks
- [ ] TICKET-55: Component Migration
- [ ] TICKET-56: Legacy Cleanup
