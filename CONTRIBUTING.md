# Contributing to Solidity IDE

Thank you for your interest in contributing to Solidity IDE! We welcome contributions from the community and appreciate your help in making this project better.

## 🎯 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug Reports**: Found a bug? Please report it!
- **✨ Feature Requests**: Have an idea for a new feature?
- **📝 Documentation**: Help improve our documentation
- **💻 Code Contributions**: Fix bugs or implement features
- **🧪 Testing**: Help us improve test coverage
- **🎨 UI/UX**: Improve the user interface and experience

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.0+ (recommended) or Node.js 18+
- Git
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Solidity

### Development Setup

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Solidity-IDE.git
   cd Solidity-IDE
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Start Development Server**
   ```bash
   bun run dev
   ```

4. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use strict typing, avoid `any` types
- **React**: Use functional components with hooks
- **Styling**: Use Tailwind CSS classes
- **Naming**: Use descriptive, camelCase names
- **Comments**: Add JSDoc comments for complex functions

### File Structure

```
src/
├── components/          # React components
│   ├── ComponentName.tsx
│   └── index.ts        # Export barrel
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript definitions
└── styles/             # Global styles
```

### Component Guidelines

```typescript
// ✅ Good component structure
interface ComponentProps {
  title: string;
  onAction: () => void;
  isVisible?: boolean;
}

export function ComponentName({ title, onAction, isVisible = true }: ComponentProps) {
  // Component logic here
  return (
    <div className="component-wrapper">
      {/* JSX content */}
    </div>
  );
}
```

### Testing Guidelines

```typescript
// ✅ Good test structure
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test implementation
  });
});
```

## 🔧 Development Workflow

### 1. Before You Start

- Check existing [issues](https://github.com/solidity-ide/solidity-ide/issues) and [pull requests](https://github.com/solidity-ide/solidity-ide/pulls)
- Comment on issues you want to work on
- Ask questions if something is unclear

### 2. Making Changes

- **Small changes**: Direct commits to your branch
- **Large changes**: Break into smaller, logical commits
- **Commit messages**: Use conventional commits format

```bash
# Good commit messages
git commit -m "feat: add contract verification feature"
git commit -m "fix: resolve compilation error in Monaco editor"
git commit -m "docs: update deployment instructions"
```

### 3. Code Quality

Before submitting, ensure your code:

- ✅ Passes all linting checks: `bun run lint`
- ✅ Passes type checking: `bun run type-check`
- ✅ Follows the code style guide
- ✅ Includes tests for new features
- ✅ Updates documentation if needed

### 4. Testing Your Changes

```bash
# Run all checks
bun run lint
bun run type-check
bun run build

# Test in different browsers
# Chrome, Firefox, Safari, Edge
```

## 📝 Pull Request Process

### Before Submitting

1. **Update Documentation**: Update README.md if needed
2. **Add Tests**: Include tests for new functionality
3. **Check Dependencies**: Ensure no unnecessary dependencies
4. **Test Thoroughly**: Test your changes thoroughly

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, your PR will be merged

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Environment**: OS, browser, version
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Console Logs**: Any error messages

### Feature Requests

For feature requests, please include:

- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other relevant information

## 🏷️ Issue Labels

We use labels to categorize issues:

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: High priority
- `priority: low`: Low priority

## 🎯 Good First Issues

New to the project? Look for these labels:

- `good first issue`: Perfect for newcomers
- `help wanted`: Community help needed
- `documentation`: Great way to learn the codebase



### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## 🏆 Recognition

Contributors will be recognized in:

- **README.md**: Listed as contributors
- **Release Notes**: Mentioned in release notes
- **GitHub**: Starred as contributors

## 📚 Resources

### Learning Materials

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Development Tools

- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets, Tailwind CSS IntelliSense
- **Browser Extensions**: MetaMask, React Developer Tools
- **Testing Tools**: Jest, React Testing Library

## 🤝 Community

Join our community:

- **GitHub**: [@jeremiah-eth](https://github.com/jeremiah-eth)
- **Repository**: [Solidity-IDE](https://github.com/jeremiah-eth/Solidity-IDE)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Solidity IDE! 🚀**

*Together, we're building the future of Web3 development.*
