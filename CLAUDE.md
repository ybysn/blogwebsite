# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** This directory is currently empty. This CLAUDE.md encodes the engineering process. Update it with project-specific build/test commands and architecture once a codebase is cloned here.

## Engineering Process

### Before Every Task

1. Read project docs (CLAUDE.md, AGENTS.md, README.md, docs/) and relevant source files first. Do not modify code immediately.
2. Summarize your understanding of the requirement, existing implementation, and scope of impact.
3. State assumptions explicitly. If you can't make a reasonable assumption, ask the user.
4. For multi-file, complex, unfamiliar, or high-risk tasks: produce a phased plan with verification steps. For single-line low-risk fixes: state scope and verification, then execute directly.

### Context Management

- Do not mix unrelated tasks in the same long-running session. When context is polluted by irrelevant exploration, failed patches, or long logs, first summarize confirmed facts, modified files, test commands, and remaining issues, then start a clean session.
- If the same issue gets corrected more than 2 times in a row, stop patching in polluted context. Distill new facts and a more precise initial prompt, then restart diagnosis or implementation fresh.
- Long tasks must use persistent files to carry context (SPEC.md, plan.md, research.md, .ai/task-handoff.md). Record at minimum: goal, scope, key files, important decisions, attempted approaches, test commands, unresolved risks, and next steps.
- Before session compaction, restore, or handoff: preserve the modified files list, verification commands, unfinished TODOs, and key decisions.

### Implementation Rules

- Reuse existing architecture, directory structure, tech stack, and code style.
- No refactoring unrelated to the current task.
- No unapproved changes to architecture, database schema, auth, permissions, security, payments, or deployment configuration.
- Minimize scope of changes. Follow existing patterns.

### Verification Gates

- Define pass/fail criteria before implementation (tests, build, lint, type check, repro script, fixture diff, screenshots, or manual run steps).
- UI/interaction changes require visual verification. If you can't screenshot or drive a browser, explicitly state uncovered visual risks in the final response.
- Deliver verification evidence, not just "verified." Include commands, exit codes, key output, screenshot paths, or before/after behavior differences.
- After complex, high-risk, or long-running changes: perform a second review in a fresh context. Check the diff against the plan, requirements, boundary conditions, test coverage, security, and regression risks.
- In review: only correctness, requirements, scope, security, and maintainability issues are blocking. Pure style preferences are optional.

### Bug Fix Flow (mandatory)

1. Reproduce the problem. Do not guess and patch.
2. Write down at least 2 possible root causes.
3. Prove the hypothesis with logs, tests, breakpoints, code paths, or data.
4. Fix only after root cause is confirmed.
5. Add or update regression tests.
6. Document what was learned.

Never do random trial-and-error patching. Before each change, state: current hypothesis, evidence supporting it, expected result of this change.

### When Multiple Fixes Fail (diagnostic mode)

Stop writing code and output:
- Attempted approaches and why each failed
- Confirmed facts
- Unknown information
- Top 3 most likely root causes
- Next minimal verification experiment
- Additional logs, tests, or breakpoints needed

### High-Risk Changes (plan required before any code)

- Architecture changes
- Database schema changes
- Auth, permission, security logic
- Payment, order, billing, financial logic
- Deployment, CI/CD, production config
- Data deletion or migration
- New dependencies or core technology replacement

Plan must include: why it's needed, affected modules, compatibility/rollback approach, verification method, and risks.

### Lessons Learned

After solving a problem, capture the learning in the right place:
1. Automated test (if it can be tested automatically)
2. Check script (if it can be scripted)
3. Runbook or debugging playbook (if it can become a repeatable process)
4. ADR (architecture decision record — if it affects architecture choices)
5. Lessons learned doc (otherwise)

### Final Delivery Format

Every completed task response must include:
- **Completed:** What was done
- **Modified files:** List of changed files
- **Verification results:** Commands, outputs, evidence
- **Lessons captured:** Tests, docs, or scripts created/updated
- **Remaining risks:** Known gaps or unverified areas
- **Next steps:** Recommended follow-up

## Recommended Docs Directory

When a project is set up, create these as needed:

| File | Purpose |
|------|---------|
| `docs/architecture.md` | System architecture |
| `docs/engineering-process.md` | Team engineering workflow |
| `docs/debugging-playbook.md` | Common debugging procedures |
| `docs/lessons-learned.md` | Lessons learned log |
| `docs/common-failures.md` | Known failure modes |
| `docs/testing-strategy.md` | Testing approach |
| `docs/adr/` | Architecture decision records |
| `.ai/project-map.md` | Entry points, core modules, API layer, DB, auth, tests, deploy files, forbidden actions, debug commands |
| `.ai/review-checklist.md` | Code review checklist |
