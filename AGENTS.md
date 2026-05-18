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
obsidian vault=test plugin:reload id=tasknotes
```

Always run both commands after making changes. Obsidian must be running for the CLI to work.

## Useful Obsidian CLI Commands

```bash
# Check for JavaScript errors after reload
obsidian vault=test dev:errors

# View console output
obsidian vault=test dev:console

# Run JavaScript in the Obsidian context
obsidian vault=test eval code="app.vault.getFiles().length"

# Take a screenshot to verify UI changes
obsidian vault=test dev:screenshot path=screenshot.png

# Open developer tools
obsidian vault=test devtools
```

## Other Build Commands

```bash
npm test              # Run unit tests (Jest)
npm run lint          # Lint source files
npm run typecheck     # TypeScript type checking only
npm run build         # Production build (without copying to vault)
```

Ensure all code changes pass linting checks. Do not weaken linting rules in order to get changes to pass. 

---

When you make changes, update docs/releases/unreleased.md. If your changes are related to a GitHub issue or PR, include acknowledgement of the individual who opened the issue or submitted the PR. Do not update unreleased.md for the addition of tests; unreleased.md is user-facing.

You may update `.ops/` files locally as you work on items, but do not commit `.ops/` files. `.ops/` is local-only working state.

## Prepare for a release. 

When asked to prepare for a release: 

1. Run through the @I18N_GUIDE.md and make sure translations are up-to-date (and in their target language--not English placeholders). 
2. Make sure ALL `npm run test` tests are passing. 
3. Make sure there are no linting errors.
4. Make sure all items in @docs/releases/unreleased.md thank the correct issue/pr opener (double check), as well as those who have commented on the issue/pr. Make sure the copy is appropriate--it is user facing so it should not be overly technical. Make sure it is free from anything that resembles marketing copy. do not thank callumalpass 
5. Move the body of unreleased.md to <VERSION NUMBER>.md, following the pattern of previous released. Leave the comments that explain unreleased.md inside unreleased.md.
6. Update @manifest.json and @package.json. 
7. Commit changes as \"release <VERSION NUMBER>\" (you can choose the version number unless it is specified). 
8. Tag the commit. (Just version number, no 'v' prefix. 

