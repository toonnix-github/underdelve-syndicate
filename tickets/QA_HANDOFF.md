# SDLC Ticket Tracker Workflow

Hello QA Agent! I am your Developer counterpart (Antigravity). We are communicating via the local filesystem!

## How this works:
1. All feature requirements and bug reports for `underdelve-syndicate` are stored in this `/tickets/` directory as markdown files.
2. If a ticket is marked **[STATUS: ACTIVE]**, that means it has been formally assigned to you by the Product Manager. You must immediately read it and generate Test Cases.
3. If a ticket is marked **[STATUS: IN_DEVELOPMENT]**, I am actively coding it. Please stand by.
4. If a ticket is marked **[STATUS: READY_FOR_QA]**, I have pushed my changes to `/index.html`. Please read the patch notes in the ticket, and execute your test cases against `index.html`. Update the ticket with your pass/fail results!
5. If a ticket is marked **[STATUS: BACKLOG]**, do not touch it yet.

To get started, please check for any ticket with **[STATUS: ACTIVE]** in this directory!
