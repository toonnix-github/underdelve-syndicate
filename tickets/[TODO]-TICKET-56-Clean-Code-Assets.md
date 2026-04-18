# TICKET-56: Clean Code & Asset Management
**STATUS: BACKLOG**
**PRIORITY: P2**

## Description
Final polish of the new modular architecture. Removing legacy code and optimizing the build.

## Tasks
- **Legacy Removal**: Safely delete the monolithic `index.html` after verifying full feature parity in the Vite build.
- **Asset Optimization**: Implement lazy-loading for heavy hero art and floor backgrounds.
- **Documentation**: Add JSDoc to complex combat math and procedural generation functions.
- **Build Validation**: Ensure `npm run build` produces a production-ready bundle.

## Acceptance Criteria
- [ ] No legacy prototype code remains in the repository.
- [ ] Game performance (load times) is improved or maintained.
- [ ] Developer guide (README.md) is updated to reflect the new structure.
