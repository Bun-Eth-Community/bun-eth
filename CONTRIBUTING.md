# Contributing to Bun-Eth

Thank you for your interest in contributing to Bun-Eth! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/Bun-Eth-Community/bun-eth.git
   cd bun-eth
   ```
3. Install dependencies:
   ```bash
   task install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/my-feature
   ```

## 📝 Development Workflow

1. Make your changes
2. Add tests for new functionality
3. Run tests:
   ```bash
   task test
   ```
4. Commit your changes:
   ```bash
   git commit -m "feat: add my feature"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/my-feature
   ```
6. Open a Pull Request

## 🎯 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Examples:
```
feat: add wallet balance caching
fix: resolve contract deployment issue
docs: update API documentation
```

## 🧪 Testing Requirements

- All new features must include tests
- Maintain or improve test coverage
- Tests should pass before submitting PR

## 🔍 Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Format code with Prettier (if configured)
- Use meaningful variable names

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments to public APIs
- Update example code if needed

## 🐛 Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Bun version, OS, etc.)

## 💡 Feature Requests

Include:
- Clear use case description
- Proposed implementation (if any)
- Potential alternatives considered

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.
