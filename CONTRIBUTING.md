# Contributing to AI Media Platform v2

Thank you for your interest in contributing to AI Media Platform v2! This document provides guidelines and information about contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@example.com.

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We pledge to act and interact in ways that contribute to an open, diverse, inclusive, and healthy community.

### Our Standards

Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- The use of sexualized language or imagery, and sexual attention or advances of any kind
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Getting Started

### Prerequisites

Before contributing, please ensure you have:

- Node.js 20+ installed
- npm 10+ installed
- MongoDB 7+ installed and running
- Redis 7+ installed and running
- Git installed
- A GitHub account

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ai-media-platform-v2.git
   cd ai-media-platform-v2
   ```
3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/your-org/ai-media-platform-v2.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local configuration.

### 3. Start Development Server

```bash
npm run dev
```

### 4. Run Tests

```bash
npm test
```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed**
- **Explain the behavior you expected**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are welcome. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would work**

### Your First Contribution

Not sure where to start? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements
- `tests` - Test improvements

## Coding Standards

### TypeScript Style Guide

We follow the [TypeScript Style Guide](https://typescript-eslint.io/docs/linting/rules/) with some modifications:

#### Naming Conventions

- **Variables and functions**: `camelCase`
- **Classes and interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case.ts`

#### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import { z } from 'zod';
import express from 'express';

import { UserService } from '../services/user.service';
import { logger } from '../utils/logger';

// 2. Types and interfaces
interface User {
  id: string;
  email: string;
}

// 3. Constants
const MAX_RETRY_ATTEMPTS = 3;

// 4. Classes
class UserController {
  // 5. Private fields
  private userService: UserService;

  // 6. Constructor
  constructor(userService: UserService) {
    this.userService = userService;
  }

  // 7. Public methods
  public async getUser(req: express.Request, res: express.Response): Promise<void> {
    // 8. Implementation
  }

  // 9. Private methods
  private async validateUser(id: string): Promise<boolean> {
    // ...
  }
}

// 10. Export
export { UserController };
```

### ESLint Rules

We use ESLint with the following important rules:

- `@typescript-eslint/no-unused-vars`: Error
- `@typescript-eslint/explicit-function-return-type`: Off
- `no-console`: Warning (except warn, error, info)
- `prefer-const`: Error
- `eqeqeq`: Error

### Prettier Configuration

- Single quotes
- Trailing commas
- 100 character line limit
- 2 space indentation
- Semicolons

## Testing

### Writing Tests

We use Jest for testing. All new features should include tests.

#### Test File Structure

```
tests/
├── unit/           # Unit tests
│   ├── models/
│   ├── services/
│   └── middleware/
├── integration/    # Integration tests
│   ├── api/
│   └── database/
└── e2e/            # End-to-end tests
    └── workflows/
```

#### Test Naming Convention

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Test implementation
    });

    it('should reject invalid email format', async () => {
      // Test implementation
    });
  });
});
```

#### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests only
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test -- --coverage
```

### Test Coverage

We aim for:

- **Unit tests**: 80%+ coverage
- **Integration tests**: 70%+ coverage
- **Overall**: 75%+ coverage

### Mocking

Use Jest mocks for external dependencies:

```typescript
// Mock external service
jest.mock('../services/ai.service', () => ({
  AIService: jest.fn().mockImplementation(() => ({
    enhance: jest.fn().mockResolvedValue({ url: 'enhanced.jpg' }),
  })),
}));

// Mock database
jest.mock('../models/user.model', () => ({
  User: {
    create: jest.fn(),
    findById: jest.fn(),
  },
}));
```

## Documentation

### Code Documentation

- Use JSDoc for complex functions
- Add comments for non-obvious logic
- Keep comments up-to-date

```typescript
/**
 * Creates a new user with the provided data.
 *
 * @param userData - The user data to create
 * @returns The created user
 * @throws {ValidationError} If the user data is invalid
 * @throws {ConflictError} If the email already exists
 */
async function createUser(userData: CreateUserSchema): Promise<User> {
  // Implementation
}
```

### API Documentation

API documentation is automatically generated from OpenAPI specifications. Update the OpenAPI spec when adding new endpoints.

### README Updates

Update the README.md when:

- Adding new features
- Changing setup instructions
- Updating dependencies
- Modifying environment variables

## Pull Request Process

### 1. Create a Branch

```bash
# For features
git checkout -b feature/amazing-feature

# For bug fixes
git checkout -b fix/bug-description

# For documentation
git checkout -b docs/update-readme
```

### 2. Make Changes

- Follow coding standards
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Changes

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```bash
# Features
git commit -m "feat: add user registration endpoint"

# Bug fixes
git commit -m "fix: resolve login authentication issue"

# Documentation
git commit -m "docs: update API documentation"

# Tests
git commit -m "test: add unit tests for UserService"

# Refactoring
git commit -m "refactor: improve error handling"
```

### 4. Push Changes

```bash
git push origin feature/amazing-feature
```

### 5. Create Pull Request

1. Go to the repository on GitHub
2. Click "New pull request"
3. Select your branch
4. Fill out the PR template
5. Request review from maintainers

### PR Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. At least one maintainer must approve
2. All CI checks must pass
3. No merge conflicts
4. Address all review comments

## Issue Guidelines

### Bug Reports

Use the bug report template:

```markdown
## Describe the bug

A clear and concise description of what the bug is.

## To reproduce

Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected behavior

A clear and concise description of what you expected to happen.

## Screenshots

If applicable, add screenshots to help explain your problem.

## Environment

- OS: [e.g. Windows 10]
- Node.js version: [e.g. 20.10.0]
- npm version: [e.g. 10.2.3]
```

### Feature Requests

Use the feature request template:

```markdown
## Is your feature request related to a problem?

A clear and concise description of what the problem is.

## Describe the solution you'd like

A clear and concise description of what you want to happen.

## Describe alternatives you've considered

A clear and concise description of any alternative solutions or features you've considered.

## Additional context

Add any other context or screenshots about the feature request here.
```

## Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Email**: support@example.com

### Stay Updated

- Watch the repository for updates
- Follow the project on Twitter
- Join our Discord server

## Recognition

Contributors will be recognized in:

- The README.md file
- Release notes
- The project website

Thank you for contributing to AI Media Platform v2! 🎉
