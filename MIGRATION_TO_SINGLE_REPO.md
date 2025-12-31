# Migration: Monorepo → Single Package

Summary:
- Converted repository from pnpm workspaces (packages/*) into a single-package layout.
- Package sources are consolidated under `src/`:
  - `src/config.ts`
  - `src/interaction.ts`
  - `src/runtime.ts`
  - `src/shared.ts`
  - `src/structure.ts`
  - `src/index.ts` (root re-exports)

What changed:
- Removed `workspaces` usage and updated `pnpm-workspace.yaml` to note the migration.
- Updated root `package.json` scripts: `build`, `test`, `bench`, `lint`, `clean`, `prepare`.
- Updated CI workflow to run root scripts instead of workspace commands.
- Tests and benchmarks were updated to import from the new root modules (`../../../src/...`) and verified locally.

Notes and next steps:
- The old `packages/` folders have been permanently removed from the repository to keep the repo clean.
- If you want to publish a single package, we should pick a final package name and update `package.json` metadata.
- I can prepare a PR with these changes and a migration summary if you'd like.
