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
For fork releases distributed through BRAT, use a fork-suffixed tag and release version based on the upstream version: if upstream is `A.B.C`, tag and release the fork as `A.B.C-fork.N`. Example: upstream `4.5.0` becomes fork `4.5.0-fork.0`.
Keep committed source version files aligned with upstream unless there is a specific reason not to. The release workflow is responsible for stamping the release artifact `manifest.json` version from the Git tag.

### Fork Release Process

Keep fork releases simple. For a normal fork release:
1. Pull or merge the desired upstream release commit into `main`.
2. Do not create extra release-prep churn unless genuinely required.
3. Create the fork tag from that commit using the fork version convention: `A.B.C-fork.N`.
4. Push the commit and the tag.
5. Stop there. Let the GitHub Actions release workflow build artifacts, stamp the release version from the tag, and publish the release.

Do not manually over-engineer routine releases with extra local release steps when the existing workflow already handles them.

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
