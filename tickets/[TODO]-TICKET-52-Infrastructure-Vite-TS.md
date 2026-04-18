# TICKET-52: Project Infrastructure Modernization (Vite + TS Migration)
**STATUS: BACKLOG**
**PRIORITY: P0**

## Description
The current `index.html` setup using in-browser Babel and React UMD is insufficient for a complex game. This ticket covers the migration to a modern toolchain.

## Tasks
- **Project Init**: Initialize a new Vite application with React and TypeScript templates.
- **Dependency Management**: Install necessary packages (`react`, `react-dom`, `lucide-react`, `tailwindcss`, `autoprefixer`, `postcss`).
- **Config Setup**:
  - Configure `vite.config.ts`.
  - Configure `tailwind.config.js` to match the current custom theme (Zinc/Amber/Rose color palette).
- **Environment Setup**: Set up the folder structure as defined in the `refactor_plan.md`:
  - `src/components`, `src/hooks`, `src/engine`, `src/data`, `src/types`.
- **Static Assets**: Move all images from `assets/` to `public/assets/`.

## Acceptance Criteria
- [ ] Blank Vite project runs locally via `npm run dev`.
- [ ] TypeScript compiler is active and checking for errors.
- [ ] Tailwind CSS is functional (classes like `bg-zinc-950` apply correctly).
- [ ] Folder structure exists and is empty/ready for migration.
