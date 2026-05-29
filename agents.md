# Agent Team Rules & Best Practices — Indie Game Development

## Team Roles (Indie Game Dev Structure)

| Role | Responsibility |
|------|--------------|
| **Game Director** | Owns creative vision, game design docs, feature prioritization, final say on UX/gameplay. |
| **Tech Lead / Engine Programmer** | Architecture decisions, build system, performance, rendering pipeline, tool chain. |
| **Gameplay Programmer** | Mechanics, systems, AI behaviors, scripting, player controller, game loop. |
| **UI/UX Programmer** | Menus, HUD, input handling, accessibility, responsive layouts, visual polish. |
| **Art / Audio Lead** | Asset pipeline, sprite/texture consistency, sound integration, visual style guide. |
| **QA / Test Engineer** | Test plans, automated tests, manual validation, bug triage, release checklists. |

## Agent Interaction Rules

1. **One voice per role** — Each agent speaks from its assigned role. No agent overrides another’s domain without escalation to Game Director.
2. **Escalation path** — Design conflicts → Game Director. Technical conflicts → Tech Lead. Scope conflicts → Game Director + Tech Lead jointly.
3. **Handoffs require checklists** — When one agent finishes a subsystem, it must provide: (a) what was built, (b) how to test it, (c) known limitations, (d) integration points.
4. **No silent failures** — If an agent can’t complete a task, it must report blockers immediately, not produce placeholder/buggy code.
5. **Code is shared** — All agents work in the same repo. Feature branches per subsystem; merge via PR reviewed by Tech Lead or Gameplay Programmer.

## Code Quality Standards

- **Testing**: Every gameplay system must have unit/integration tests. Every UI screen must have a verification step (screenshot or behavior checklist).
- **No warnings as ship** — Compiler warnings and linter errors are treated as blockers in the final milestone.
- **Documentation**: Public APIs and complex algorithms get inline comments. `README.md` stays current with build/run instructions.
- **Performance budget**: Target 60 FPS on min-spec. Profile before optimizing; optimize only after measurement.

## Git Workflow

- **Branch naming**: `feature/<name>`, `fix/<name>`, `art/<name>`, `audio/<name>`.
- **Commits**: Small, atomic commits with clear messages. Reference task/ticket IDs when applicable.
- **Merges**: Rebase preferred for feature branches; merge commits OK for releases.
- **Tags**: `v0.1.0-alpha`, `v0.2.0-beta`, `v1.0.0-rc1`, `v1.0.0`.

## UI/UX Verification Process

1. Mock/wireframe review by Game Director before implementation.
2. Implement with placeholder art if final assets aren’t ready.
3. Keyboard + gamepad + mouse input must all work where applicable.
4. Accessibility: readable fonts, color-blind safe indicators, scalable UI.
5. Final UI pass: animations, transitions, sound feedback, edge-case handling.

## Definition of Done (Shippable)

- [ ] All critical path features implemented and tested.
- [ ] No known crash bugs or soft-locks.
- [ ] All screens accessible and functional.
- [ ] Performance stable at target frame rate.
- [ ] Build reproducible from clean checkout (`README.md` instructions verified).
- [ ] Final playtest completed by at least one agent in a "fresh" worktree.
- [ ] Version tagged and release notes drafted.

## Tech Stack (To Be Filled)

- Engine / Framework:
- Language:
- Build Tool:
- Test Framework:
- CI/CD:

---
*This document is living. Update it as conventions evolve.*
