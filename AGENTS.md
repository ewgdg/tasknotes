# TaskNotes - Agent Development Guide

This is an Obsidian plugin. The plugin ID is `tasknotes`.

## Fork Repository

This repository is a fork. Prefer changes that preserve upstream compatibility and reduce long-term rebase cost.
If any other repository-local instruction conflicts with this section, follow this section.

Use this priority order:
1. Extend existing seams without modifying upstream source files.
2. Put fork-specific tests in `tests/unit/fork` and fork-specific docs in `docs/fork`.
3. If upstream files must be changed, keep the patch minimal, local, and clearly attributable to fork-specific behavior.

Do not spread fork-only behavior across unrelated upstream files when a dedicated fork-specific module or boundary would keep the divergence easier to maintain.
For fork-only changes such as BRAT/release plumbing, do not update `docs/releases/unreleased.md`.
For fork releases intended to replace upstream installs, use a stable patch-buffer rule: if upstream is `A.B.C`, tag and release the fork as `A.B.(C+1000)` unless there is a specific reason to choose a higher stable patch. Example: upstream `4.4.0` becomes fork `4.4.1000`. Do not use fork-marked, prerelease, or four-part manifest/tag versions like `4.4.0-fork.0`, `4.4.0-beta.1`, or `4.4.0.1` when the goal is to supersede upstream. Keep fork identity in the repo or release notes, not the plugin version.

## Build & Test

```bash
# Build the plugin and copy files to the vault's plugin directory
npm run build:test

# After building, reload the plugin in the running Obsidian instance
obsidian plugin:reload id=tasknotes vault=test
```

Always run both commands after making changes. Obsidian must be running for the CLI to work.

## Useful Obsidian CLI Commands

```bash
# Check for JavaScript errors after reload
obsidian dev:errors vault=test

# View console output
obsidian dev:console vault=test

# Run JavaScript in the Obsidian context
obsidian dev:eval code="app.vault.getFiles().length" vault=test

# Take a screenshot to verify UI changes
obsidian dev:screenshot path=screenshot.png vault=test

# Open developer tools
obsidian dev:open vault=test
```

## Other Build Commands

```bash
npm test              # Run unit tests (Jest)
npm run lint          # Lint source files
npm run typecheck     # TypeScript type checking only
npm run build         # Production build (without copying to vault)
```

---

When you make changes, update docs/releases/unreleased.md. If your changes are related to a GitHub issue or PR, include acknowledgement of the individual who opened the issue or submitted the PR. Do not update unreleased.md for the addition of tests; unreleased.md is user-facing.

You may update `.ops/` files locally as you work on items, but do not commit `.ops/` files. `.ops/` is local-only working state.
