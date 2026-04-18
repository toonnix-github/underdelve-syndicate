# Underdelve Syndicate - Development Process

This document outlines the mandatory steps for finalizing a feature or fixing a bug (the "DONE process") to maintain consistency and documentation integrity across the codebase.

## The DONE Process

When a ticket's requirements are fully met and verified:

1.  **Requirement Verification**: Cross-reference the final implementation against all acceptance criteria in the ticket file.
2.  **Update Ticket Content**:
    *   Change `STATUS: TODO` to `STATUS: DONE`.
    *   Check all acceptance criteria boxes (e.g., `- [ ]` -> `- [x]`).
    *   Add a `## Implementation Notes` section at the end of the ticket summarizing key technical decisions or new dependencies.
3.  **Rename the Ticket**:
    *   Rename the file to replace the `[TODO]-` or `[READY-FOR-DEVELOPMENT]-` prefix with `[DONE]-`.
    *   Example: `[TODO]-TICKET-49-Leadership-System.md` -> `[DONE]-TICKET-49-Leadership-System.md`.
4.  **Finalize Walkthrough**:
    *   Create or update the `walkthrough.md` artifact.
    *   Include final screenshots (using `browser_subagent`) and brief explanations of the user-facing changes.
    *   *Note: Per recent instruction, do not run UI tests if explicitly forbidden for a specific ticket.*
5.  **State Management Audit**:
    *   Ensure any new persistent state (e.g., `isLeader`) is initialized correctly and doesn't break save/load or floor transitions.
6.  **Cleanup**:
    *   Delete any temporary scratch files or test scripts created in the project workspace.
