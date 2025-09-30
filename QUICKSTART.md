# Quick Start Guide

Get up and running with Bun-Eth in 5 minutes!

## 1. Install Task (if not already installed)

```bash
# macOS
brew install go-task

# Linux
sh -c "$(curl --location https://taskfile.dev/install.sh)" -- -d -b ~/.local/bin

# Windows (with Scoop)
scoop install task
```

Or use without installing:
```bash
bunx @go-task/cli
```

## 2. Install Dependencies

```bash
task install
```

## 3. Start Development Stack

```bash
task start
```

This will:
- ✅ Install all dependencies
- ✅ Compile smart contracts
- ✅ Start Hardhat local node
- ✅ Start Bun-Eth API

## 4. Deploy Contracts

In a new terminal:

```bash
task contracts:deploy
```

## 5. Test the API

```bash
# Check health
curl http://localhost:3001/health | bun run -e "console.log(JSON.stringify(JSON.parse(await Bun.stdin.text()), null, 2))"

# Get wallet balance
curl http://localhost:3001/wallet/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 | bun run -e "console.log(JSON.stringify(JSON.parse(await Bun.stdin.text()), null, 2))"
```

## 6. Run Tests

```bash
task test
```

## Common Commands

```bash
# View all available tasks
task --list

# View logs
task dev:logs

# Stop development stack
task dev:down

# Restart development stack
task dev:restart

# Run specific tests
task test:contracts   # Smart contract tests
task test:api        # API tests
task test:sdk        # SDK tests
task test:core       # Core utilities tests
```

## Next Steps

1. 📖 Read the full [README.md](README.md)
2. 📝 Explore the API endpoints in the README
3. 🔧 Customize contracts in `packages/contracts/contracts/`
4. 🚀 Build your dApp!

## Troubleshooting

### Port already in use

If ports 3001 or 8545 are in use:

```bash
# Stop existing services
task dev:down

# Or kill processes
lsof -ti:3001 | xargs kill -9
lsof -ti:8545 | xargs kill -9
```

### Docker issues

```bash
# Restart Docker
docker system prune -a
task dev:up
```

### Dependencies not found

```bash
# Clean and reinstall
task clean
task install
```

## Support

- 📖 [Documentation](README.md)
- 🐛 [Report Issues](https://github.com/yourusername/bun-eth/issues)
- 💬 [Discussions](https://github.com/yourusername/bun-eth/discussions)
