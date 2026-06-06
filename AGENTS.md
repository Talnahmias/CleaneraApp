# AGENTS.md

Guidance for AI agents working in this repository.

## Project status

**CleanersApp** is currently a project scaffold. The repository contains only `README.md` — there is no application source code, dependency manifests, tests, lint configuration, or service definitions yet.

## Cursor Cloud specific instructions

### Services

| Service | Required | Notes |
|---------|----------|-------|
| *(none)* | — | No runnable services exist in the repo yet |

When application code is added, update this section with how to start each service (dev servers, databases, etc.).

### Lint / test / build / run

No lint, test, build, or run commands are defined until a tech stack and `package.json` (or equivalent) are added.

### Environment

The Cloud VM provides common tooling out of the box:

- **Node.js** via nvm (`node`, `npm`, `pnpm`, `yarn`)
- **Python 3.12** (`python3`, `pip`)
- **Git**

Docker is not required for the current repo contents.

### Update script

The VM startup update script is a no-op (`true`) because there are no dependencies to refresh. Once manifests exist (e.g. `package.json`, `requirements.txt`), replace the update script with the appropriate install command.
