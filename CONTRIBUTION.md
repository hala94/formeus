# Contributing overview

This repository is a `turbo` monorepo and the dependecies are managed with `pnpm`.

Releases are done via PRs to the `main` branch, and we use `changesets 🦋` for release messages.

Clone this project and run `pnpm install` at the root of the project.

```sh
brew install pnpm
```

## Contribution steps

Make a desired change to the codebase.

Test and Lint the packages by running `pnpm test-packages` in the workspace root.

Create a _changeset_ by running `pnpm changeset` in the workspace root and specify semver bump type for each package.
Read more about [changesets](https://github.com/changesets/changesets/blob/main/docs/command-line-options.md).

Create a PR to the `main` branch.

### Demo

Repo contains demo apps that link to workspace packages and can be used to
visually test out the form in the real world example.
