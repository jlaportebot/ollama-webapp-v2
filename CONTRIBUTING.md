# Contributing to Ollama Web App

Thank you for your interest in contributing to Ollama Web App! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- Node.js 18+
- Ollama installed and running
- Git

### Setup Development Environment

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ollama-webapp-v2.git
cd ollama-webapp-v2

# Install dependencies
npm install

# Start development server
npm run dev
```

## Development Workflow

### 1. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b bugfix/your-bugfix-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly

### 3. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve database connection timeout"

# Documentation
git commit -m "docs: update API documentation"

# Style
git commit -m "style: format JavaScript code"
```

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## Pull Request Guidelines

### PR Title Format

```
<type>: <subject>

Examples:
- feat: add dark mode toggle
- fix: resolve streaming connection issues
- docs: update installation instructions
```

### PR Description Template

```markdown
## Changes
- Brief description of changes
- Key features added/modified

## Testing
- How to test these changes
- Test cases covered

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Commented complex logic
- [ ] Updated documentation
- [ ] Added/updated tests
- [ ] All tests passing
- [ ] No console errors or warnings

## Related Issues
Closes #123
Related to #456
```

## Code Style Guidelines

### JavaScript

- Use 2 spaces for indentation
- Use single quotes for strings
- Use const/let, avoid var
- Use arrow functions for callbacks
- Add JSDoc comments for functions

```javascript
// Good
const getUserById = (id) => {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
};

// Bad
function getUserById(id) {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}
```

### HTML/CSS

- Use semantic HTML
- Keep CSS organized
- Use meaningful class names
- Follow mobile-first approach

## Testing

### Manual Testing Checklist

- [ ] Server starts without errors
- [ ] Can create new conversations
- [ ] Can send messages and receive responses
- [ ] Streaming works correctly
- [ ] System stats display properly
- [ ] Database operations work
- [ ] Multiple users can access simultaneously

### Automated Tests (Future)

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Project Structure

```
ollama-webapp-v2/
├── server.js              # Main Express server
├── public/
│   └── index.html        # Frontend interface
├── package.json          # Dependencies
├── .gitignore           # Git ignore rules
├── README.md            # Project documentation
├── CONTRIBUTING.md      # This file
└── LICENSE              # MIT License
```

## Common Tasks

### Adding a New API Endpoint

1. Add route in `server.js`
2. Implement handler function
3. Add error handling
4. Test with curl or Postman
5. Update API documentation

### Modifying Database Schema

1. Create migration script
2. Test with backup database
3. Update queries in `server.js`
4. Document changes in README

### Updating Frontend

1. Modify `public/index.html`
2. Test in multiple browsers
3. Check mobile responsiveness
4. Update screenshots in README

## Reporting Issues

### Bug Reports

Use the issue template and include:

- Clear description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node.js version, Ollama version)
- Screenshots/logs if applicable

### Feature Requests

- Describe the feature
- Explain use case
- Suggest implementation approach
- Consider alternatives

## Getting Help

- 📖 Check [README.md](README.md)
- 🐛 Search existing [Issues](https://github.com/jlaportebot/ollama-webapp-v2/issues)
- 💬 Start a [Discussion](https://github.com/jlaportebot/ollama-webapp-v2/discussions)
- 📧 Email: jlaportebot@gmail.com

## Recognition

Contributors will be acknowledged in:
- README.md contributors section
- Release notes
- GitHub contributors list

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or discussion if you have any questions about contributing!
