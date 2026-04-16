# TICKET-11: Environment Fix (Headed/Headless Browser File Access)
**STATUS: TODO**

## Description
The QA Agent's `browser_subagent` is currently unable to access `file:///` URLs due to security permissions in the headless context. Additionally, relying on a manual `localhost` server started by the Developer is causing "Session Collision" or unavailability during automation runs.

## Requirements
- **Permission Fix**: Configure the project or provide a script that allows the browser to open local HTML files (`file:///...`) without security blocks.
- **Dedicated QA Server**: Implement a `npm run dev:qa` or similar background task that starts a persistent, isolated server on a dedicated port (e.g., `8080`) for the QA Agent's exclusive use.
- **Port Mapping**: Ensure the server address is documented in the `QA_HANDOFF.md`.

## QA Test Cases
- **TC-01: Connectivity**: Verify the QA Agent can reach the game via `http://localhost:[PORT]` in a headless session.
- **TC-02: File Access**: Verify the QA Agent can open `index.html` directly via `file:///` (preferred for zero-config).

## Dev Notes
*Waiting on Developer to bridge the environmental gap. QA for TICKET-09 is currently DEFERRED.*
