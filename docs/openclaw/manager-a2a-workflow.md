

## SCRIPTED-WORKFLOW-CHECKS

Manager must use repository scripts as deterministic verification gates, not as planning authority.

Before starting a task, run:

```bash
cd /home/clawd/projects/scale-admin
scripts/openclaw-preflight.sh
```

Continue only if `PREFLIGHT_RESULT=PASS`.

The preflight script verifies repository state. It must not be treated as the source of truth for:
- next task selection;
- backend/frontend agent selection;
- task branch naming.

Manager must select the next valid pending task itself by reading `tasks.json`, checking dependencies, priority, and project context.

Manager must choose `backend` or `frontend` itself using task meaning, PRD, acceptance criteria, and implementation scope.

After implementation, verification, closure commit, merge to `main`, and push, run:

```bash
scripts/openclaw-after-task-check.sh <TASK_ID>
```

Final report is allowed only after `AFTER_TASK_RESULT=PASS`.

### Docker verification fallback

If Docker Compose verification is required, manager should first try the approved repository script:

```bash
scripts/openclaw-docker-verify.sh <TASK_ID>
```

If the manager runtime cannot access Docker, for example Docker daemon permission denied or elevated execution unavailable, this is not an implementation failure.

In that case manager must stop before closure:
- keep task status pending;
- keep task branch open;
- keep task lock present;
- report `DOCKER_VERIFICATION_REQUIRED`;
- ask the user to run through SSH:

```bash
cd /home/clawd/projects/scale-admin
scripts/openclaw-docker-verify.sh <TASK_ID>
```

Manager may continue closure only after the user provides evidence with `DOCKER_VERIFY_RESULT=PASS`.

Manager must not generate ad-hoc Docker SSH command chains. Use the approved script only.

## TASK-BRANCH-WORKFLOW

Manager must use feature branch flow for every task.

Rules:

- Start from `main`.
- Create task branch: `task/<TASK_ID>-<slug>`.
- Make a coordination commit on the task branch.
- Assign exactly one implementation agent: `backend` or `frontend`.
- Backend/frontend makes implementation commits only on the task branch.
- Manager verifies the implementation.
- Manager makes closure commit only after all required verification passes.
- Merge task branch into `main` using `--no-ff`.
- Push `main` to `origin`.
- Keep task branch open and pushed.
- Do not delete task branches.
- Do not work directly on `main` except merge commits.
- Do not choose backend/frontend from scripts; manager chooses by task meaning, PRD, tasks.json, dependencies, and acceptance criteria.
