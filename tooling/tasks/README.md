# Task Organization

This directory contains the organized Taskfile structure split by category.

## File Structure

```
tooling/tasks/
├── Taskfile.yml          # Main file with vars, includes, and backward-compatible aliases
├── README.md             # This documentation
├── setup.yml             # Installation and initial setup tasks
├── dev.yml               # Development tasks (dev stack, logs, health checks)
├── contracts.yml         # Smart contract tasks (compile, deploy, test)
├── test.yml              # Testing tasks (unit, e2e, coverage)
├── build.yml             # Build and lint tasks
├── deploy.yml            # Deployment tasks
├── ci.yml                # CI/CD validation tasks
└── clean.yml             # Cleanup tasks
```

## Task Categories

### Setup (`setup.yml`)
- `setup:install` - Install dependencies
- `setup:start` - Quick start (install + compile + run)
- `setup:setup` - Complete setup with tests

**Alias**: `s:` (e.g., `task s:install`)

### Development (`dev.yml`)
- `dev:up` - Start dev stack (Web + API + Anvil)
- `dev:down` - Stop dev stack
- `dev:logs[:api|:anvil|:web]` - View logs
- `dev:status` - Show container status
- `dev:health` - Check API health
- `dev:restart` - Restart dev stack
- `dev:reset` - Reset blockchain state
- `dev:web[:build|:start]` - Web dev server tasks

**Alias**: `d:` (e.g., `task d:up`)

### Contracts (`contracts.yml`)
- `contracts:compile` - Compile contracts
- `contracts:deploy` - Deploy to local Anvil
- `contracts:deploy:sepolia` - Deploy to Sepolia
- `contracts:test` - Run contract tests
- `contracts:generate` - Generate TypeScript types
- `contracts:node` - Run standalone Anvil

**Alias**: `c:` (e.g., `task c:compile`)

### Testing (`test.yml`)
- `test:unit` - Unit tests (core + sdk)
- `test:watch` - Watch mode
- `test:coverage` - With coverage
- `test:contracts` - Contract tests only
- `test:api` - API tests
- `test:sdk` - SDK tests
- `test:core` - Core tests
- `test:e2e` - Web e2e tests
- `test:e2e:template` - Template creation tests
- `test:all` - All tests

**Alias**: `t:` (e.g., `task t:unit`)

### Building (`build.yml`)
- `build:packages` - Build all packages (libraries)
- `build:web` - Build Next.js app
- `build:all` - Build everything
- `build:lint` - Lint all code

**Alias**: `b:` (e.g., `task b:packages`)

### Deployment (`deploy.yml`)
- `deploy:web` - Deploy web app
- `deploy:contracts:local` - Deploy contracts locally
- `deploy:contracts:sepolia` - Deploy contracts to Sepolia

### CI/CD (`ci.yml`)
- `ci:validate` - Full CI validation (lint + test + build)
- `ci:quick` - Quick checks (lint + unit tests)
- `ci:contracts` - Contract checks only

### Cleanup (`clean.yml`)
- `clean:all` - Clean all artifacts and dependencies
- `clean:cache` - Clean Foundry cache
- `clean:web` - Clean Next.js build
- `clean:logs` - Clean development logs

## Usage Examples

```bash
# Full task names
task dev:up
task contracts:compile
task test:unit
task build:packages

# Using aliases
task d:up         # dev:up
task c:compile    # contracts:compile
task t:unit       # test:unit
task b:packages   # build:packages

# Backward compatible shortcuts
task install      # setup:install
task start        # setup:start
task test         # test:unit
task lint         # build:lint
task status       # dev:status

# List all available tasks
task --list

# List tasks by category
task --list | grep "dev:"
task --list | grep "test:"
```

## Benefits of This Structure

1. **Organization**: Tasks grouped by purpose
2. **Discoverability**: `task --list` shows clear categorization
3. **Aliases**: Short prefixes for quick commands
4. **Maintainability**: Easier to find and update tasks
5. **Scalability**: Easy to add new categories
6. **Backward Compatibility**: Old commands still work

## Adding New Tasks

To add a new task:

1. Identify the appropriate category file (or create a new one)
2. Add the task to that file with `dir: '{{.ROOT_DIR}}'` if it needs to run from root
3. Update this README if adding a new category
4. Consider adding a backward-compatible alias in the main `Taskfile.yml` if needed

Example:

```yaml
# In dev.yml
new-task:
  desc: Description of the new task
  dir: '{{.ROOT_DIR}}'
  cmds:
    - echo "Running new task"
```

## Variables

Global variables are defined in the main `Taskfile.yml`:

- `ROOT_DIR` - Project root directory
- `DOCKER_COMPOSE_FILE` - Path to docker-compose.yml
- `WEB_PORT` - Web app port (default: 3000)
- `API_PORT` - API port (default: 3001)
- `ANVIL_PORT` - Anvil node port (default: 3002)

These are accessible in all included task files using `{{.VAR_NAME}}`.
