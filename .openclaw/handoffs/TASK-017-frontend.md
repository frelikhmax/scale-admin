# Handoff: TASK-017 — Stores UI and Admin/Operator navigation

Owner: frontend
Branch: task/TASK-017-stores-ui-navigation
Status: assigned

## Task
Create Stores UI and basic Admin/Operator navigation.

## Acceptance criteria
- Admin sees list of all stores.
- Admin can open create and edit store forms.
- Operator sees only assigned stores.
- Navigation differs for admin and operator.
- There is a transition from store list to Store Details.

## Test steps
1. Log in as admin, open Stores, and verify all stores are shown.
2. Create a store through UI and verify it appears in the list.
3. Log in as operator, open Stores, and verify only assigned stores are shown.
4. Click a store and reach Store Details.

## Dependencies confirmed done
- TASK-014 — Login UI/session state
- TASK-016 — Store CRUD API
- TASK-013 — operator store access management

## Implementation constraints
- Work only on this task.
- Use existing frontend API layer/RTK Query patterns.
- Use existing backend endpoints from TASK-016/TASK-013; do not implement backend feature code.
- Do not mark `tasks.json` done.
- Keep changes scoped to frontend unless a tiny non-feature fix is absolutely necessary and reported.
- Do not expose secrets or hard-code credentials.

## Required completion report
Return:
- implementation commit hash(es)
- changed files
- exact tests/builds run and results
- how each acceptance criterion was verified
- known limitations/blockers, if any
- confirmation that `tasks.json` was not marked done
