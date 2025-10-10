# E2E Tests

End-to-end tests for the Bun-Eth template system.

## Overview

These tests validate the entire template creation and setup workflow, ensuring that:
1. The CLI successfully creates projects
2. Dependencies install correctly
3. All builds complete successfully
4. The development stack starts properly
5. Contracts can be deployed
6. Services are accessible and functional
7. All template improvements are present

## Running Tests

### Run all E2E tests

```bash
bun test:e2e
```

### Run with verbose output

```bash
bun test tests/e2e --verbose
```

### Run a specific test file

```bash
bun test tests/e2e/template-creation.test.ts
```

## Test Coverage

### Template Creation Tests

- **CLI Project Creation**: Validates that `create-bun-eth` successfully creates a new project
- **Dependency Installation**: Ensures all npm packages install correctly
- **Contract Compilation**: Verifies Foundry contracts compile without errors
- **Unit Tests**: Runs core and SDK unit tests
- **Contract Tests**: Executes Foundry test suite
- **Build Process**: Validates all packages build successfully
- **Dev Stack**: Tests Docker Compose stack startup
- **Contract Deployment**: Deploys contracts to local Anvil network
- **Service Health**: Checks API and web services are responding
- **Cleanup**: Ensures dev stack stops cleanly

### Template Improvements Validation

- **Enhanced .env.example**: Verifies improved documentation and configuration
- **Improved Taskfile**: Validates deployment error handling
- **Deployment Guide**: Checks DEPLOYMENT_GUIDE.md exists and is complete
- **Git Attributes**: Ensures .gitattributes is configured for template
- **Cleanup Script**: Validates cleanup-template-artifacts.sh exists
- **No Legacy References**: Confirms HARDHAT_NODE references are removed
- **Degit Usage**: Verifies CLI uses degit instead of git clone

## Test Environment

Tests run in `/tmp` directory and automatically clean up after completion:
- Test project: `/tmp/test-bun-eth-e2e`
- Automatically deleted after tests complete

## Requirements

Before running E2E tests, ensure you have:

1. **Bun** installed (>= 1.1.0)
2. **Foundry** installed (forge, anvil, cast)
3. **Docker** running (for dev stack tests)
4. **Task** (optional, but recommended)
5. **Free ports**: 3000, 3001, 3002

## CI/CD Integration

These tests can be integrated into CI pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run E2E Tests
  run: bun test:e2e
  timeout-minutes: 20
```

## Test Timeouts

Tests have generous timeouts due to:
- Package installation (~2-3 minutes)
- Contract compilation (~30 seconds)
- Docker image building (~1-2 minutes)
- Service startup (~30 seconds)

Total test suite runtime: **~10-15 minutes**

## Troubleshooting

### Port Already in Use

If tests fail with "address already in use", kill existing processes:

```bash
lsof -ti:3000,3001,3002 | xargs kill -9
```

### Docker Issues

Ensure Docker is running:

```bash
docker ps
```

Clean up old containers:

```bash
docker compose down -v
```

### Test Cleanup Failed

Manually clean up test project:

```bash
rm -rf /tmp/test-bun-eth-e2e
```

### Foundry Not Found

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Adding New Tests

When adding new template features, update the E2E tests:

1. Add validation in `template-creation.test.ts`
2. Update this README with new test coverage
3. Ensure cleanup handles new resources
4. Add appropriate timeout for new operations

## Performance Benchmarks

Target timings for each test phase:

- CLI Creation: < 5 seconds
- Install Dependencies: < 180 seconds
- Compile Contracts: < 60 seconds
- Run Tests: < 30 seconds
- Build Packages: < 60 seconds
- Start Dev Stack: < 120 seconds
- Deploy Contracts: < 30 seconds
- Health Checks: < 10 seconds
- Cleanup: < 30 seconds

## Notes

- Tests are designed to be idempotent and can be run multiple times
- Each test run starts with a clean slate (no previous artifacts)
- Tests validate both functionality AND the template improvements from TEMPLATE_PROPOSAL.md
- All services are properly stopped and cleaned up after tests complete
