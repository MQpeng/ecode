# Prettier before adding files (optional)

If you want Prettier to run before `git add`, Git does not have a native pre-add hook. You have two options:

1) Use a git alias (recommended for pre-add behavior):

  git config alias.addp "!f() { prettier --write \"$@\" && git add \"$@\"; }; f"

  Then use `git addp <file>` instead of `git add <file>` to format before adding.

2) Use the provided wrapper script in the repo (recommended):

  scripts/git-add-prettier

  Usage: `./scripts/git-add-prettier <file> [<file> ...]` or via npm: `pnpm run addp -- <file>`.

  The script runs Prettier on the provided files and then `git add` them.

Save as `scripts/git-add-prettier` and make it executable (see next step), then run `./scripts/git-add-prettier <file>` or `pnpm run addp -- <file>`.

Note: We configured a pre-commit hook (husky + lint-staged) that automatically formats staged files with Prettier before committing, which covers most workflows.
